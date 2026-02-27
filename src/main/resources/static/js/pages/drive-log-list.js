// drive-log-list.js
// - list.html 전용
// - 실무 포인트: "즉시 실행(readyState)" 제거 → DOMContentLoaded/pageshow/load에서만 안전 실행
// - DOM 안정화를 위해 setTimeout(0)로 한 틱 늦춤

(function () {
    let departmentsMap = {};
    let currentPage = 0;
    let initialized = false;

    // ✅ 이벤트 기반으로만 init (readyState 즉시 init 제거)
    document.addEventListener("DOMContentLoaded", () => scheduleInit("DOMContentLoaded"));
    window.addEventListener("pageshow", () => scheduleInit("pageshow")); // bfcache 대응
    window.addEventListener("load", () => scheduleInit("load"));         // 최후 보험

    function scheduleInit(from) {
        // 같은 이벤트가 중복 호출될 수 있으니 한 틱 늦춰 DOM 안정화
        window.setTimeout(() => safeInit(from), 0);
    }

    async function safeInit(from) {
        // ✅ 페이지 가드
        const root = document.getElementById("driveLogListPage");
        if (!root) return;

        if (initialized) return;
        initialized = true;

        const dom = collectDom();

        const missing = Object.entries(dom)
            .filter(([, el]) => !el)
            .map(([k]) => k);

        if (missing.length > 0) {
            console.error("[drive-log-list] Required DOM not found:", { from, missing });
            VehicleUI?.showToast?.("danger", "초기화 실패", "list.html의 id/레이아웃 반영을 확인하세요.");
            initialized = false; // ✅ 다음 이벤트에서 재시도 가능하게
            return;
        }

        bindEvents(dom);

        VehicleUI.showLoading();
        try {
            await Promise.all([loadDepartments(dom.departmentId), loadLatestMileage(dom)]);
            await loadLogs(0, dom);
        } catch (e) {
            console.error("[drive-log-list] init failed:", e);
            VehicleUI.showToast("danger", "초기화 실패", e?.message || "목록 화면 초기화에 실패했습니다.");
        } finally {
            VehicleUI.hideLoading();
        }
    }

    function collectDom() {
        return {
            btnPrint: document.getElementById("btnPrint"),
            btnReset: document.getElementById("btnReset"),
            searchForm: document.getElementById("searchForm"),
            logTableBody: document.getElementById("logTableBody"),
            pagination: document.getElementById("pagination"),
            departmentId: document.getElementById("departmentId"),
            startDate: document.getElementById("startDate"),
            endDate: document.getElementById("endDate"),
            driverName: document.getElementById("driverName"),
            kpiLastMileage: document.getElementById("kpiLastMileage"),
            kpiLastDate: document.getElementById("kpiLastDate"),
            kpiFilterSummary: document.getElementById("kpiFilterSummary"),
            kpiCount: document.getElementById("kpiCount"),
        };
    }

    function bindEvents(dom) {
        dom.btnPrint.addEventListener("click", () => window.print());
        dom.btnReset.addEventListener("click", () => resetSearch(dom));
        dom.searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            loadLogs(0, dom);
        });
    }

    async function loadDepartments(selectEl) {
        const res = await VehicleHttp.get("/api/v1/departments");
        const data = res?.data || [];

        data.forEach((dep) => {
            departmentsMap[String(dep.id)] = dep.name;
            const opt = document.createElement("option");
            opt.value = dep.id;
            opt.textContent = dep.name;
            selectEl.appendChild(opt);
        });
    }

    async function loadLatestMileage(dom) {
        const res = await VehicleHttp.get("/api/v1/drive-logs/latest-mileage");
        const data = res?.data || { lastMileage: 0, lastDriveDate: null };

        dom.kpiLastMileage.textContent = VehicleUtil.formatNumber(data.lastMileage ?? 0) + " km";
        dom.kpiLastDate.textContent = data.lastDriveDate
            ? `마지막 사용일자: ${data.lastDriveDate}`
            : "데이터 없음";
    }

    async function loadLogs(page, dom) {
        currentPage = page;

        const startDate = dom.startDate.value;
        const endDate = dom.endDate.value;
        const departmentId = dom.departmentId.value;
        const driverName = dom.driverName.value;

        dom.kpiFilterSummary.textContent = buildFilterSummary(startDate, endDate, departmentId, driverName);

        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("size", "20");
        if (startDate) query.set("startDate", startDate);
        if (endDate) query.set("endDate", endDate);
        if (departmentId) query.set("departmentId", departmentId);
        if (driverName) query.set("driverName", driverName);

        VehicleUI.showLoading();
        try {
            const res = await VehicleHttp.get(`/api/v1/drive-logs?${query.toString()}`);
            const pageData = res?.data;

            renderTable(pageData?.content || [], dom.logTableBody);
            renderPagination(pageData, dom.pagination);

            dom.kpiCount.textContent = `${(pageData?.content || []).length}건`;
        } catch (e) {
            console.error("[drive-log-list] loadLogs failed:", e);
            dom.logTableBody.innerHTML =
                `<tr><td colspan="9" class="text-center text-danger">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
            VehicleUI.showToast("danger", "조회 실패", e?.message || "목록 조회에 실패했습니다.");
        } finally {
            VehicleUI.hideLoading();
        }
    }

    function renderTable(logs, tbody) {
        tbody.innerHTML = "";

        if (!logs || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="text-center">조회된 운행 기록이 없습니다.</td></tr>`;
            return;
        }

        logs.forEach((log) => {
            const dayStr = VehicleUtil.getDayKor(log.driveDate);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${log.driveDate}<br>(${dayStr})</td>
                <td>${departmentsMap[String(log.departmentId)] || "-"}</td>
                <td>${escapeHtml(log.driverName)}</td>
                <td>${VehicleUtil.formatNumber(log.startMileage)}</td>
                <td>${VehicleUtil.formatNumber(log.endMileage)}</td>
                <td>${VehicleUtil.formatNumber(log.totalDistance)}</td>
                <td>${VehicleUtil.formatNumber(log.commuteDistance)}</td>
                <td>${VehicleUtil.formatNumber(log.businessDistance)}</td>
                <td class="text-start">${escapeHtml(log.remarks || "")}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderPagination(pageData, ul) {
        ul.innerHTML = "";
        if (!pageData || pageData.totalPages <= 1) return;

        ul.appendChild(pageItem("이전", currentPage - 1, pageData.first));

        for (let i = 0; i < pageData.totalPages; i++) {
            ul.appendChild(pageNumberItem(i, i === currentPage));
        }

        ul.appendChild(pageItem("다음", currentPage + 1, pageData.last));

        function pageItem(label, page, disabled) {
            const li = document.createElement("li");
            li.className = `page-item ${disabled ? "disabled" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${label}</a>`;
            li.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                if (!disabled) loadLogs(page, collectDomForPaging());
            });
            return li;
        }

        function pageNumberItem(page, active) {
            const li = document.createElement("li");
            li.className = `page-item ${active ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${page + 1}</a>`;
            li.querySelector("a").addEventListener("click", (e) => {
                e.preventDefault();
                loadLogs(page, collectDomForPaging());
            });
            return li;
        }

        function collectDomForPaging() {
            // 페이지네이션 클릭 시 최신 DOM을 다시 잡아 안정성↑
            return collectDom();
        }
    }

    function resetSearch(dom) {
        dom.startDate.value = "";
        dom.endDate.value = "";
        dom.departmentId.value = "";
        dom.driverName.value = "";
        loadLogs(0, dom);
    }

    function buildFilterSummary(startDate, endDate, departmentId, driverName) {
        const parts = [];
        if (startDate || endDate) parts.push(`${startDate || "-"} ~ ${endDate || "-"}`);
        if (departmentId) parts.push(departmentsMap[String(departmentId)] || `부서#${departmentId}`);
        if (driverName) parts.push(driverName);
        return parts.length ? parts.join(" / ") : "전체";
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
})();