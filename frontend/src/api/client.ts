const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)tradeflow_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers["X-CSRF-Token"] = csrf;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
