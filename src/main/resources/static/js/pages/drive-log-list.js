// drive-log-list.js
// - list.html 전용
// - 실무 포인트: "즉시 실행(readyState)" 제거 → DOMContentLoaded/pageshow/load에서만 안전 실행
// - DOM 안정화를 위해 setTimeout(0)로 한 틱 늦춤

import * as Http from "../common/http.js";
import * as UI from "../common/ui.js";
import { formatNumber, getDayKor, escapeHtml } from "../common/util.js";
import { renderPagination } from "../common/pagination.js";

let initialized = false;
let departmentsMap = {};
let currentPage = 0;

init();
window.addEventListener("pageshow", () => {
  if (!initialized) init();
});

function init() {
  if (initialized) return;

  const dom = collectDom();
  const missing = Object.entries(dom).filter(([, el]) => !el).map(([k]) => k);
  if (missing.length) {
    console.error("[drive-log-list] missing dom:", missing);
    UI.showToast("danger", "초기화 실패", "list.html의 id 반영을 확인하세요.");
    return;
  }

  initialized = true;
  setTimeout(() => safeInit(dom), 0);
}

async function safeInit(dom) {
  bindEvents(dom);

  UI.showLoading();
  try {
    await Promise.all([loadDepartments(dom.departmentId), loadLatestMileage(dom)]);
    await loadLogs(0, dom);
  } catch (e) {
    console.error("[drive-log-list] init failed:", e);
    UI.showToast("danger", "초기화 실패", e?.message || "목록 화면 초기화에 실패했습니다.");
    initialized = false;
  } finally {
    UI.hideLoading();
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
  departmentsMap = {};

  // 중복 옵션 방지
  selectEl.querySelectorAll("option:not(:first-child)").forEach((o) => o.remove());

  const res = await Http.get("/api/v1/departments");
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
  const res = await Http.get("/api/v1/drive-logs/latest-mileage");
  const data = res?.data || { lastMileage: 0, lastDriveDate: null };

  dom.kpiLastMileage.textContent = formatNumber(data.lastMileage ?? 0) + " km";
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

  UI.showLoading();
  try {
    const res = await Http.get(`/api/v1/drive-logs?${query.toString()}`);
    const pageData = res?.data;

    renderTable(pageData?.content || [], dom.logTableBody);
    renderPagination(pageData, dom.pagination, {
      currentPage: pageData.page,
      onChange: (nextPage) => loadLogs(nextPage, dom)
    });

    dom.kpiCount.textContent = `${(pageData?.content || []).length}건`;
  } catch (e) {
    console.error("[drive-log-list] loadLogs failed:", e);
    dom.logTableBody.innerHTML =
      `<tr><td colspan="9" class="text-center text-danger">데이터를 불러오는 중 오류가 발생했습니다.</td></tr>`;
    UI.showToast("danger", "조회 실패", e?.message || "목록 조회에 실패했습니다.");
  } finally {
    UI.hideLoading();
  }
}

function renderTable(logs, tbody) {
  tbody.innerHTML = "";

  if (!logs || logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">조회된 운행 기록이 없습니다.</td></tr>`;
    return;
  }

  logs.forEach((log) => {
    const dayStr = getDayKor(log.driveDate);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${log.driveDate}<br>(${dayStr})</td>
      <td>${departmentsMap[String(log.departmentId)] || "-"}</td>
      <td>${escapeHtml(log.driverName)}</td>
      <td>${formatNumber(log.startMileage)}</td>
      <td>${formatNumber(log.endMileage)}</td>
      <td>${formatNumber(log.totalDistance)}</td>
      <td>${formatNumber(log.commuteDistance)}</td>
      <td>${formatNumber(log.businessDistance)}</td>
      <td class="text-start">${escapeHtml(log.remarks || "")}</td>
    `;
    tbody.appendChild(tr);
  });
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