// ui.js
// - UX 공통: toast, loading overlay, field error 표준화

window.VehicleUI = (function () {
    const stack = () => document.getElementById("toastStack");
    const overlay = () => document.getElementById("loadingOverlay");

    function showToast(type, title, message, timeoutMs = 2500) {
        const el = document.createElement("div");
        el.className = `toast-item toast-${type}`;
        el.innerHTML = `
      <div class="toast-title">${escapeHtml(title || "알림")}</div>
      <div class="toast-msg">${escapeHtml(message || "")}</div>
    `;
        stack()?.appendChild(el);

        window.setTimeout(() => {
            el.remove();
        }, timeoutMs);
    }

    function showLoading() {
        const o = overlay();
        if (o) o.style.display = "flex";
    }

    function hideLoading() {
        const o = overlay();
        if (o) o.style.display = "none";
    }

    function clearFieldErrors(root = document) {
        root.querySelectorAll(".field-error").forEach((el) => {
            el.textContent = "";
            el.style.display = "none";
        });
    }

    // fields: { "driverName": "성명을 입력..." }
    function applyFieldErrors(fields, root = document) {
        if (!fields) return;
        Object.entries(fields).forEach(([field, msg]) => {
            const el = root.querySelector(`[data-field-error="${field}"]`);
            if (!el) return;
            el.textContent = msg;
            el.style.display = "block";
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    return {
        showToast,
        showLoading,
        hideLoading,
        clearFieldErrors,
        applyFieldErrors
    };
})();