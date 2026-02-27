// http.js
// - fetch 공통 처리 (ApiResponse / ErrorResponse 표준)
// - 실무 포인트: 네트워크 오류/서버 오류/검증 오류를 UX로 구분 처리

window.VehicleHttp = (function () {
    async function requestJson(url, options = {}) {
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        const finalOptions = {
            ...options,
            headers
        };

        const res = await fetch(url, finalOptions);

        // 응답이 JSON이 아닐 수도 있으니 방어
        let body = null;
        const text = await res.text();
        try {
            body = text ? JSON.parse(text) : null;
        } catch (_) {
            body = null;
        }

        if (!res.ok) {
            // ErrorResponse 기대: { code, message, details, fields }
            const err = body || { code: "HTTP_ERROR", message: "요청 처리에 실패했습니다." };
            err.httpStatus = res.status;
            throw err;
        }

        return body;
    }

    async function get(url) {
        return requestJson(url, { method: "GET" });
    }

    async function post(url, payload) {
        return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
    }

    return { get, post };
})();