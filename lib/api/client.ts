import { useAuthStore } from "@/lib/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_apiurl || "http://localhost:3001/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
}

function handleUnauthorized() {
  useAuthStore.getState().clear();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  { body, auth = true, headers, ...init }: ApiFetchOptions = {}
): Promise<T> {
  const token = auth ? useAuthStore.getState().token : null;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    handleUnauthorized();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data.error || data.message || message;
    } catch {
      // no JSON body
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;

  try {
    return (await res.json()) as T;
  } catch {
    return undefined as T;
  }
}
