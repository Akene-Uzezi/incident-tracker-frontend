import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
}

// Shared session cookie name. A cookie set on `localhost` is readable by every
// port served from that host, so both frontends (3000 + 3001) see the same
// session. This is what makes a single login/logout span both apps.
const AUTH_COOKIE = "rhv_auth";

function isBrowser() {
  return typeof document !== "undefined";
}

const cookieStorage: StateStorage = {
  getItem: (name) => {
    if (!isBrowser()) return null;
    const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (name, value) => {
    if (!isBrowser()) return;
    const isHttps = window.location.protocol === "https:";
    const secure = isHttps ? " Secure;" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; sameSite=Lax;${secure}`;
  },
  removeItem: (name) => {
    if (!isBrowser()) return;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

function setRoleCookie(role: string | null) {
  if (!isBrowser()) return;
  const isHttps = window.location.protocol === "https:";
  const secure = isHttps ? " Secure;" : "";
  if (!role) {
    document.cookie = `user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;${secure}`;
    return;
  }
  document.cookie = `user_role=${role}; path=/; max-age=86400; sameSite=Strict;${secure}`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        setRoleCookie(user.role);
        set({ token, user });
      },
      clear: () => {
        setRoleCookie(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: AUTH_COOKIE,
      storage: createJSONStorage(() => cookieStorage),
      onRehydrateStorage: () => (state) => {
        setRoleCookie(state?.user?.role ?? null);
      },
    }
  )
);

export function useAuthUser() {
  return useAuthStore((s) => s.user);
}

export function useAuthToken() {
  return useAuthStore((s) => s.token);
}

export function useIsSuperAdmin() {
  return useAuthStore((s) => s.user?.role?.toLowerCase() === "superadmin");
}

export function useCanManageReport() {
  return useAuthStore((s) => {
    const role = s.user?.role?.toLowerCase();
    return role === "admin" || role === "manager" || role === "superadmin";
  });
}
