"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotificationStore, useUnreadNotificationCount } from "@/lib/store/notification-store";
import type { StoredNotification } from "@/lib/store/notification-store";
import { cn } from "@/lib/utils";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-chart-severity-critical",
  major: "bg-chart-severity-major",
  minor: "bg-chart-severity-minor",
  "near miss": "bg-chart-severity-near-miss",
};

function formatRelativeTime(iso: string) {
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function NotificationRow({ notification, onRead }: { notification: StoredNotification; onRead: (id: string) => void }) {
  return (
    <Link
      href="/dashboard/incidents"
      onClick={() => onRead(notification.id)}
      className={cn(
        "flex gap-3 px-3 py-3 text-sm transition-colors hover:bg-muted/60",
        !notification.read && "bg-primary/5"
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          SEVERITY_DOT[notification.severityLevel] || "bg-muted-foreground"
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{notification.title}</p>
        <p className="truncate text-xs text-muted-foreground">{notification.description}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatRelativeTime(notification.createdAt)}</p>
      </div>
      {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
    </Link>
  );
}

export function NotificationBell() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const unreadCount = useUnreadNotificationCount();

  return (
    <Popover onOpenChange={(open) => { if (!open) markAllRead(); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2.5">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
        </div>
        <div className="border-t" />
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onRead={markRead} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
