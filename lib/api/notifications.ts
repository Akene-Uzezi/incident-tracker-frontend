import { apiFetch } from "./client";

export interface BackendNotification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  ref?: string;
  relatedId?: number;
  read: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: BackendNotification[];
}

export async function getNotifications() {
  return apiFetch<NotificationsResponse>("/notifications");
}

export async function markAllNotificationsRead() {
  return apiFetch<{ message: string }>("/notifications/read", { method: "PATCH" });
}

export async function markNotificationRead(id: number) {
  return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function clearNotifications() {
  return apiFetch<{ message: string }>("/notifications", { method: "DELETE" });
}
