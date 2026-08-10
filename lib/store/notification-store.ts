import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { IncidentStatus } from "@/lib/types";
import type { DetectedNotification, NotificationDiffResult } from "@/lib/utils/notification-diff";

export interface StoredNotification extends DetectedNotification {
  read: boolean;
}

const MAX_STORED_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: StoredNotification[];
  seenIncidentIds: number[];
  seenStatuses: Record<number, IncidentStatus>;
  ingest: (result: NotificationDiffResult) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      seenIncidentIds: [],
      seenStatuses: {},
      ingest: ({ notifications, nextSeenIncidentIds, nextSeenStatuses }) =>
        set((state) => ({
          notifications: [
            ...notifications.map((n) => ({ ...n, read: false })),
            ...state.notifications,
          ].slice(0, MAX_STORED_NOTIFICATIONS),
          seenIncidentIds: nextSeenIncidentIds,
          seenStatuses: nextSeenStatuses,
        })),
      markAllRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      clear: () => set({ notifications: [] }),
    }),
    { name: "incident-tracker-notifications" }
  )
);

export function useUnreadNotificationCount() {
  return useNotificationStore((s) => s.notifications.reduce((count, n) => count + (n.read ? 0 : 1), 0));
}
