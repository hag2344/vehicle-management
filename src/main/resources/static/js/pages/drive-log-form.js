// drive-log-form.js
// - form.html 전용 로직
// - 실무 포인트:
//   1) readyState 즉시 init 제거 → DOMContentLoaded/pageshow/load에서만 안전 실행
//   2) setTimeout(0)로 DOM 안정화 (Thymeleaf layout + bfcache 케이스 방어)
//   3) 페이지 가드(#driveLogFormPage)로 다른 페이지에서 실행 방지
//   4) 필수 DOM 누락 시 throw 금지 → 콘솔 로그 + 토스트 + 안전 종료(return)
//   5) appendChild/null 방지: DOM을 먼저 확보하고 파라미터로 전달

import * as Http from "../common/http.js";
import * as UI from "../common/ui.js";
import { todayIsoDateLocal } from "../common/util.js";

let initialized = false;

init();
window.addEventListener("pageshow", () => {
  // bfcache로 복원될 때가 있어 초기화 재시도
  if (!initialized) init();
});

function init() {
  if (initialized) return;

  const dom = collectDom();
  //dom id가 안맞아서 못 찾은 요소가 있는지 검사
  const missing = Object.entries(dom).filter(([, el]) => !el).map(([k]) => k);
  if (missing.length) {
    console.error("[drive-log-form] missing dom:", missing);
    UI.showToast("danger", "초기화 실패", "form.html의 id 반영을 확인하세요.");
    return;
  }

  initialized = true;
  setTimeout(() => safeInit(dom), 0);
}

async function safeInit(dom) {
  UI.showLoading();
  UI.clearFieldErrors(document);

  try {
    await Promise.all([
      loadDepartments(dom.departmentId),
      loadLatestMileage(dom),
    ]);

    bindEvents(dom);
    calculateDistance(dom);
  } catch (e) {
    console.error("[drive-log-form] init failed:", e);
    UI.showToast("danger", "초기화 실패", e?.message || "화면 초기화에 실패했습니다.");
    initialized = false;
  } finally {
    UI.hideLoading();
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
  [dom.startMileage, dom.endMileage, dom.commuteDistance, dom.businessDistance].forEach((el) => {
    el.addEventListener("input", () => calculateDistance(dom));
  });

  dom.form.addEventListener("submit", (e) => submitForm(e, dom));
}

async function loadDepartments(selectEl) {
  // 뒤로가기 재진입 시 중복 옵션 방지
  selectEl.querySelectorAll("option:not(:first-child)").forEach((o) => o.remove());

  const res = await Http.get("/api/v1/departments");
  const data = res?.data || [];

  data.forEach((dep) => {
    const opt = document.createElement("option");
    opt.value = dep.id;
    opt.textContent = dep.name;
    selectEl.appendChild(opt);
  });
}

async function loadLatestMileage(dom) {
  const res = await Http.get("/api/v1/drive-logs/latest-mileage");
  const data = res?.data || { lastMileage: 0, lastDriveDate: null };

  if (dom.startMileage){
    dom.startMileage.value = data.lastMileage
    dom.startMileage.readOnly = true;
  }else{
    dom.startMileage.value = 0;
    dom.startMileage.readOnly = false;
  }

  if (data.lastDriveDate) {
    dom.driveDate.min = data.lastDriveDate;
    dom.driveDate.value = data.lastDriveDate;
  } else {
    dom.driveDate.value = todayIsoDateLocal();
  }
}

function calculateDistance(dom) {
  const start = toInt(dom.startMileage.value);
  const end = toInt(dom.endMileage.value);
  const commute = toInt(dom.commuteDistance.value);
  const business = toInt(dom.businessDistance.value);

  const total = (Number.isFinite(start) && Number.isFinite(end)) ? Math.max(0, end - start) : 0;
  dom.totalDistance.value = total;

  const commuteSafe = Number.isFinite(commute) ? commute : 0;
  const businessSafe = Number.isFinite(business) ? business : 0;

  const invalid = (commuteSafe + businessSafe) !== total;
  dom.distanceWarning.style.display = invalid ? "block" : "none";
  dom.distanceWarning.textContent = invalid ? "출·퇴근용(km)과 일반 업무용(km)의 합이 총 주행거리와 같아야 합니다." : "none";
  dom.submitBtn.disabled = invalid;
}

async function submitForm(e, dom) {
  e.preventDefault();
  UI.clearFieldErrors(document);

  const payload = {
    driveDate: dom.driveDate.value,
    departmentId: dom.departmentId.value ? parseInt(dom.departmentId.value, 10) : null,
    driverName: dom.driverName.value?.trim(),
    startMileage: toInt(dom.startMileage.value),
    endMileage: toInt(dom.endMileage.value),
    commuteDistance: toInt(dom.commuteDistance.value),
    businessDistance: toInt(dom.businessDistance.value),
    remarks: dom.remarks?.value?.trim(),
  };

  const missing = [];
  if (!payload.driveDate) missing.push("사용일자");
  if (!payload.departmentId) missing.push("부서");
  if (!payload.driverName) missing.push("성명");
  if (!Number.isFinite(payload.startMileage)) missing.push("주행 전 거리");
  if (!Number.isFinite(payload.endMileage)) missing.push("주행 후 거리");
  if (!Number.isFinite(payload.commuteDistance)) missing.push("출·퇴근용 거리");
  if (!Number.isFinite(payload.businessDistance)) missing.push("일반 업무용 거리");
  if (!payload.remarks) missing.push("비고");

  if (missing.length) {
    UI.showToast("warning", "입력 확인", `${missing.join(", ")} 항목을 확인해주세요.`);
    return;
  }

  UI.showLoading();
  try {
    await Http.post("/api/v1/drive-logs", payload);
    UI.showToast("success", "저장 완료", "운행 기록이 저장되었습니다.");
    setTimeout(() => (window.location.href = "/drive-logs"), 450);
  } catch (err) {
    console.error("[drive-log-form] create failed:", err);

    if (err?.code === "INVALID_INPUT" && err?.fields) {
      UI.applyFieldErrors(err.fields, document);
      UI.showToast("warning", "입력 오류", "필수 입력값을 확인해주세요.");
      return;
    }

    UI.showToast("danger", "저장 실패", err?.message || "저장 중 문제가 발생했습니다.");
  } finally {
    UI.hideLoading();
  }
}

function toInt(v) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? NaN : n;
}