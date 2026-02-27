// util.js
// - 작은 유틸을 한 곳에 모아 재사용 (날짜/문자열 등)

window.VehicleUtil = (function () {
    function todayIsoDate() {
        return new Date().toISOString().split("T")[0];
    }

    function formatNumber(v) {
        if (v === null || v === undefined) return "";
        const n = Number(v);
        if (Number.isNaN(n)) return String(v);
        return n.toLocaleString("ko-KR");
    }

    function getDayKor(dateIso) {
        // dateIso: "2026-02-27"
        const days = ["일", "월", "화", "수", "목", "금", "토"];
        const d = new Date(dateIso);
        return days[d.getDay()];
    }

    return { todayIsoDate, formatNumber, getDayKor };
})();