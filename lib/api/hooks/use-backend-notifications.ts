import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";

const POLL_INTERVAL_MS = 10_000;
const NOTIFICATIONS_KEY = ["backend-notifications"] as const;

/**
 * Server-driven notifications (e.g. death report submissions). Unlike the
 * client-side incident polling, these live in the shared backend so they reach
 * a user no matter which frontend (incident-tracker or death-report) they are
 * currently using.
 */
export function useBackendNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getNotifications,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
  });

  const clearAll = useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => queryClient.setQueryData(NOTIFICATIONS_KEY, { notifications: [] }),
  });

  return { ...query, markAllRead, markRead, clearAll };
}
