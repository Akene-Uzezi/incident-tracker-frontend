import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys, type IncidentFilters } from "@/lib/api/query-keys";
import type { IncidentResponse, IncidentStatus } from "@/lib/types";

export function useIncidentsQuery(filters: IncidentFilters) {
  return useQuery({
    queryKey: queryKeys.incidents.list(filters),
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: "10",
      });
      if (filters.status && filters.status !== "all") params.set("status", filters.status);
      if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.set("dateTo", filters.dateTo);
      return apiFetch<IncidentResponse>(`/incidents?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useIncidentStatusMutation(incidentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: IncidentStatus) =>
      apiFetch(`/incidents/${incidentId}/status`, {
        method: "PATCH",
        body: { incidentStatus: status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.incidents.all });
    },
  });
}
