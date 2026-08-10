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

// The backend has no dedicated analytics/stats endpoint yet, so the Overview
// dashboard computes everything client-side from a single large page of the
// existing GET /incidents endpoint — real data, no mocks. This scales fine up
// to a few hundred incidents; past that, `pagination.total_items` will exceed
// what's fetched here and the dashboard should say so rather than pretend the
// numbers are exhaustive.
export const ANALYTICS_FETCH_LIMIT = 200;

export function useIncidentsAnalyticsQuery() {
  return useQuery({
    queryKey: queryKeys.incidents.analytics(),
    queryFn: () => apiFetch<IncidentResponse>(`/incidents?page=1&limit=${ANALYTICS_FETCH_LIMIT}`),
    staleTime: 60_000,
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
