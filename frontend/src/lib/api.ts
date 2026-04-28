const LOCAL_API_BASE = "http://localhost:3001";

function normalizeBase(url?: string) {
  return url?.replace(/\/$/, "") || "";
}

function getBase() {
  const publicBase = normalizeBase(process.env.NEXT_PUBLIC_API_URL);
  const serverBase = normalizeBase(process.env.API_URL);

  if (typeof window === "undefined") {
    return serverBase || publicBase || LOCAL_API_BASE;
  }

  if (publicBase) {
    return publicBase;
  }

  return window.location.hostname === "localhost" ? LOCAL_API_BASE : "";
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("petcare_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getBase()}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
