import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  clear: () => void;
}

function setRoleCookie(role: string | null) {
  if (typeof document === "undefined") return;
  if (!role) {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    return;
  }
  document.cookie = `user_role=${role}; path=/; max-age=86400; sameSite=Strict; Secure`;
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
      name: "incident-tracker-auth",
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
