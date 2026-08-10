import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { AuthUser, UsersResponse } from "@/lib/types";
import type { LoginValues, RegisterValues } from "@/lib/schemas/auth";
import type { EditUserValues } from "@/lib/schemas/users";

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

export function useUsersQuery(page: number, limit = 10) {
  return useQuery({
    queryKey: queryKeys.users.list(page, limit),
    queryFn: () => apiFetch<UsersResponse>(`/users?page=${page}&limit=${limit}`),
    placeholderData: (previousData) => previousData,
  });
}

export function useSearchUsersQuery(searchQuery: string) {
  const query = searchQuery.trim();
  return useQuery({
    queryKey: queryKeys.users.search(query),
    queryFn: () =>
      apiFetch<{ users: AuthUser[] }>(`/searchUsers?searchQuery=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: EditUserValues) =>
      apiFetch<{ user: AuthUser }>("/auth/update", { method: "PUT", body: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useEnableUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<AuthUser>("/auth/enable", { method: "PUT", body: { email } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useDisableUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      apiFetch<AuthUser>("/auth/disable", { method: "PUT", body: { email } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (values: { email: string; password: string }) =>
      apiFetch<AuthUser>("/auth/resetpassword", { method: "PUT", body: values }),
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (values: { email: string; newPassword: string }) =>
      apiFetch<AuthUser>("/auth/userResetPassword", { method: "PUT", body: values }),
  });
}
