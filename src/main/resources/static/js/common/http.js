// http.js
// - fetch 공통 처리 (ApiResponse / ErrorResponse 표준)
// - 실무 포인트: 네트워크 오류/서버 오류/검증 오류를 UX로 구분 처리

export async function requestJson(url, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const finalOptions = {
    ...options,
    headers,
    // 세션/쿠키 기반이면 필요할 수 있음:
    // credentials: "same-origin",
  };

  let res;
  try {
    res = await fetch(url, finalOptions);
  } catch (_) {
    throw { code: "NETWORK_ERROR", message: "네트워크 연결을 확인해주세요." };
  }

  let body = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_) {
    body = null;
  }

  if (!res.ok) {
    const err = body || { code: "HTTP_ERROR", message: "요청 처리에 실패했습니다." };
    err.httpStatus = res.status;
    throw err;
  }

  return body;
}

export function get(url) {
  return requestJson(url, { method: "GET" });
}

export function post(url, payload) {
  return requestJson(url, { method: "POST", body: JSON.stringify(payload) });
}