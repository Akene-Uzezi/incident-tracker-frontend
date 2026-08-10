"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { IncidentResponse } from "@/lib/types";
import { useAuthToken } from "@/lib/store/auth-store";
import { useNotificationStore } from "@/lib/store/notification-store";
import { diffIncidentsForNotifications } from "@/lib/utils/notification-diff";
import { notify } from "@/lib/toast";

const POLL_INTERVAL_MS = 10_000;
const POLL_FETCH_LIMIT = 50;
const TOASTS_PER_POLL = 3;

/**
 * Near-real-time notifications via fast polling of the existing GET /incidents
 * endpoint — there's no push/WebSocket endpoint on the backend yet. Detects
 * newly-created incidents and status changes by diffing against what this
 * client has already seen, surfaces them as toasts, and stores them for the
 * notification bell panel. Mount this once, high in the dashboard tree.
 */
export function useNotificationPolling() {
  const token = useAuthToken();
  const ingest = useNotificationStore((s) => s.ingest);
  const seenIncidentIds = useNotificationStore((s) => s.seenIncidentIds);
  const seenStatuses = useNotificationStore((s) => s.seenStatuses);
  const processedAtRef = useRef<number | null>(null);

  const { data, dataUpdatedAt } = useQuery({
    queryKey: queryKeys.notifications.poll(),
    queryFn: () => apiFetch<IncidentResponse>(`/incidents?page=1&limit=${POLL_FETCH_LIMIT}`),
    enabled: !!token,
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (!data || processedAtRef.current === dataUpdatedAt) return;
    processedAtRef.current = dataUpdatedAt;

    const isFirstRun = seenIncidentIds.length === 0 && Object.keys(seenStatuses).length === 0;
    const result = diffIncidentsForNotifications({
      incidents: data.data ?? [],
      seenIncidentIds,
      seenStatuses,
      isFirstRun,
    });

    if (result.notifications.length === 0) {
      if (isFirstRun) ingest(result);
      return;
    }

    ingest(result);
    for (const n of result.notifications.slice(0, TOASTS_PER_POLL)) {
      notify.info(n.title, n.description);
    }
    if (result.notifications.length > TOASTS_PER_POLL) {
      notify.info(
        `${result.notifications.length - TOASTS_PER_POLL} more update${result.notifications.length - TOASTS_PER_POLL === 1 ? "" : "s"}`,
        "Check the notification bell for details."
      );
    }
  }, [data, dataUpdatedAt, seenIncidentIds, seenStatuses, ingest]);
}
