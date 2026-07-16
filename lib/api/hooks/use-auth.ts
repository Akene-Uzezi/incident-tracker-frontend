import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import type { AuthUser } from "@/lib/types";
import type { LoginValues, RegisterValues } from "@/lib/schemas/auth";

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (values: LoginValues) =>
      apiFetch<LoginResponse>("/auth/login", {
        auth: false,
        method: "POST",
        body: values,
      }),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (values: RegisterValues) =>
      apiFetch("/auth/register", {
        method: "POST",
        body: values,
      }),
  });
}

export function useSearchUserMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<AuthUser>(`/user?email=${encodeURIComponent(email)}`),
  });
}

export function useEnableUserMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<AuthUser>("/auth/enable", { method: "PUT", body: { email } }),
  });
}

export function useDisableUserMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<AuthUser>("/auth/disable", { method: "PUT", body: { email } }),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      apiFetch<AuthUser>("/auth/resetpassword", { method: "PUT", body: values }),
  });
}
