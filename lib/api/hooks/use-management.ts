import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { IncidentManagement } from "@/lib/types";

export function useManagementQuery(incidentId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.management.detail(incidentId ?? 0),
    queryFn: async () => {
      try {
        return await apiFetch<IncidentManagement>(`/incidents/${incidentId}/management`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled: !!incidentId,
  });
}

export function useCreateManagementMutation(incidentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<IncidentManagement>) =>
      apiFetch(`/incidents/${incidentId}/management`, {
        method: "POST",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.management.detail(incidentId) });
    },
  });
}

export function useUpdateManagementMutation(incidentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Partial<IncidentManagement>) =>
      apiFetch(`/incidents/${incidentId}/management`, {
        method: "PUT",
        body: values,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.management.detail(incidentId) });
    },
  });
}
