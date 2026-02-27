// drive-log-form.js
// - form.html 전용 로직
// - 실무 포인트:
//   1) readyState 즉시 init 제거 → DOMContentLoaded/pageshow/load에서만 안전 실행
//   2) setTimeout(0)로 DOM 안정화 (Thymeleaf layout + bfcache 케이스 방어)
//   3) 페이지 가드(#driveLogFormPage)로 다른 페이지에서 실행 방지
//   4) 필수 DOM 누락 시 throw 금지 → 콘솔 로그 + 토스트 + 안전 종료(return)
//   5) appendChild/null 방지: DOM을 먼저 확보하고 파라미터로 전달

(function () {
    let initialized = false;

    // ✅ 이벤트 기반 init만 사용 (readyState 즉시 init 제거)
    document.addEventListener("DOMContentLoaded", () => scheduleInit("DOMContentLoaded"));
    window.addEventListener("pageshow", () => scheduleInit("pageshow")); // bfcache(뒤로가기) 대응
    window.addEventListener("load", () => scheduleInit("load"));         // 최후 보험

    function scheduleInit(from) {
        window.setTimeout(() => safeInit(from), 0);
    }

    async function safeInit(from) {
        // ✅ 페이지 가드: form 페이지에서만 실행
        const root = document.getElementById("driveLogFormPage");
        if (!root) return;

        if (initialized) return;
        initialized = true;

        const dom = collectDom();

        const missing = Object.entries(dom)
            .filter(([, el]) => !el)
            .map(([k]) => k);

        if (missing.length > 0) {
            console.error("[drive-log-form] Required DOM not found:", { from, missing });
            VehicleUI?.showToast?.("danger", "초기화 실패", "form.html의 id/레이아웃 반영을 확인하세요.");
            initialized = false; // 다음 이벤트에서 재시도 가능
            return;
        }

        VehicleUI.showLoading();
        VehicleUI.clearFieldErrors(document);

        try {
            await Promise.all([
                loadDepartments(dom.departmentId),
                loadLatestMileage(dom)
            ]);

            bindEvents(dom);
            calculateDistance(dom); // 초기 계산
        } catch (e) {
            console.error("[drive-log-form] init failed:", e);
            VehicleUI.showToast("danger", "초기화 실패", e?.message || "화면 초기화에 실패했습니다.");
        } finally {
            VehicleUI.hideLoading();
        }
    }

    function collectDom() {
        return {
            form: document.getElementById("driveLogForm"),
            driveDate: document.getElementById("driveDate"),
            departmentId: document.getElementById("departmentId"),
            driverName: document.getElementById("driverName"),

            startMileage: document.getElementById("startMileage"),
            endMileage: document.getElementById("endMileage"),
            totalDistance: document.getElementById("totalDistance"),

            commuteDistance: document.getElementById("commuteDistance"),
            businessDistance: document.getElementById("businessDistance"),

            distanceWarning: document.getElementById("distanceWarning"),
            submitBtn: document.getElementById("submitBtn"),

            remarks: document.getElementById("remarks"),
        };
    }

    function bindEvents(dom) {
        // 입력 변경 시 자동 계산/검증
        [dom.startMileage, dom.endMileage, dom.commuteDistance, dom.businessDistance].forEach((el) => {
            el.addEventListener("input", () => calculateDistance(dom));
        });

        dom.form.addEventListener("submit", (e) => submitForm(e, dom));
    }

    async function loadDepartments(selectEl) {
        const res = await VehicleHttp.get("/api/v1/departments");
        const data = res?.data || [];

        data.forEach((dep) => {
            const opt = document.createElement("option");
            opt.value = dep.id;
            opt.textContent = dep.name;
            selectEl.appendChild(opt);
        });
    }

    async function loadLatestMileage(dom) {
        const res = await VehicleHttp.get("/api/v1/drive-logs/latest-mileage");
        const data = res?.data || { lastMileage: 0, lastDriveDate: null };

        // startMileage preset
        dom.startMileage.value = data.lastMileage ?? 0;

        // date restriction
        if (data.lastDriveDate) {
            dom.driveDate.min = data.lastDriveDate;
            dom.driveDate.value = data.lastDriveDate;
        } else {
            dom.driveDate.value = VehicleUtil.todayIsoDate();
        }
    }

    function calculateDistance(dom) {
        const start = toInt(dom.startMileage.value);
        const end = toInt(dom.endMileage.value);
        const commute = toInt(dom.commuteDistance.value);
        const business = toInt(dom.businessDistance.value);

        // start/end가 비정상일 때도 UI가 깨지지 않게 방어
        const total = (Number.isFinite(start) && Number.isFinite(end))
            ? Math.max(0, end - start)
            : 0;

        dom.totalDistance.value = total;

        const commuteSafe = Number.isFinite(commute) ? commute : 0;
        const businessSafe = Number.isFinite(business) ? business : 0;

        if (commuteSafe + businessSafe > total) {
            dom.distanceWarning.style.display = "block";
            dom.submitBtn.disabled = true;
        } else {
            dom.distanceWarning.style.display = "none";
            dom.submitBtn.disabled = false;
        }
    }

    async function submitForm(e, dom) {
        e.preventDefault();

        VehicleUI.clearFieldErrors(document);

        const payload = {
            driveDate: dom.driveDate.value,
            departmentId: dom.departmentId.value ? parseInt(dom.departmentId.value, 10) : null,
            driverName: dom.driverName.value?.trim(),
            startMileage: toInt(dom.startMileage.value),
            endMileage: toInt(dom.endMileage.value),
            commuteDistance: toInt(dom.commuteDistance.value) || 0,
            businessDistance: toInt(dom.businessDistance.value) || 0,
            remarks: dom.remarks?.value?.trim() || null
        };

        // ✅ 프론트 1차 검증(UX 개선)
        const missing = [];
        if (!payload.driveDate) missing.push("사용일자");
        if (!payload.driverName) missing.push("성명");
        if (!Number.isFinite(payload.startMileage)) missing.push("주행 전 거리");
        if (!Number.isFinite(payload.endMileage)) missing.push("주행 후 거리");

        if (missing.length > 0) {
            VehicleUI.showToast("warning", "입력 확인", `${missing.join(", ")} 항목을 확인해주세요.`);
            return;
        }

        VehicleUI.showLoading();
        try {
            await VehicleHttp.post("/api/v1/drive-logs", payload);

            VehicleUI.showToast("success", "저장 완료", "운행 기록이 저장되었습니다.");
            window.setTimeout(() => (window.location.href = "/drive-logs"), 450);
        } catch (err) {
            console.error("[drive-log-form] create failed:", err);

            // 서버 validation (예: MethodArgumentNotValidException)
            if (err?.code === "INVALID_INPUT" && err?.fields) {
                VehicleUI.applyFieldErrors(err.fields, document);
                VehicleUI.showToast("warning", "입력 오류", "필수 입력값을 확인해주세요.");
                return;
            }

            // 비즈니스/시스템 에러 공통 처리
            VehicleUI.showToast("danger", "저장 실패", err?.message || "저장 중 문제가 발생했습니다.");
        } finally {
            VehicleUI.hideLoading();
        }
    }

    function toInt(v) {
        const n = parseInt(v, 10);
        return Number.isNaN(n) ? NaN : n;
    }
})();