import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { IncidentComment, IncidentLog } from "@/lib/types";

export function useCommentsQuery(incidentId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.forIncident(incidentId ?? 0),
    queryFn: async () => {
      const data = await apiFetch<{ comments: IncidentComment[] }>(
        `/incidents/comments?incidentId=${incidentId}&incident_id=${incidentId}`
      );
      return data.comments || [];
    },
    enabled: !!incidentId,
  });
}

export function useLogsQuery(incidentId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.logs.forIncident(incidentId ?? 0),
    queryFn: async () => {
      const data = await apiFetch<{ incidentLogs: IncidentLog[] }>(
        `/incidents/${incidentId}/managementlogs`
      );
      return data.incidentLogs || [];
    },
    enabled: !!incidentId,
  });
}

interface AddCommentInput {
  comment: string;
  userId?: number;
  commentUserName?: string;
  commentUserRole?: string;
}

export function useAddCommentMutation(incidentId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: AddCommentInput) =>
      apiFetch(`/incidents/comments`, {
        method: "POST",
        body: { incidentId, ...values },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.forIncident(incidentId) });
    },
  });
}
