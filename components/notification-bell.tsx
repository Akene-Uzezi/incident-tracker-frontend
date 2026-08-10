"use client";

import Link from "next/link";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotificationStore } from "@/lib/store/notification-store";
import { useBackendNotifications } from "@/lib/api/hooks/use-backend-notifications";
import { cn } from "@/lib/utils";

const SEVERITY_DOT: Record<string, string> = {
  critical: "bg-chart-severity-critical",
  major: "bg-chart-severity-major",
  minor: "bg-chart-severity-minor",
  "near miss": "bg-chart-severity-near-miss",
};

type Row = {
  key: string;
  title: string;
  description: string;
  dotClass: string;
  createdAt: string;
  read: boolean;
  source: "local" | "backend";
  backendId?: number;
  href: string;
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

export function NotificationBell() {
  const localNotifications = useNotificationStore((s) => s.notifications);
  const localMarkAllRead = useNotificationStore((s) => s.markAllRead);
  const localClear = useNotificationStore((s) => s.clear);
  const localMarkRead = useNotificationStore((s) => s.markRead);

  const { data, markAllRead, markRead, clearAll } = useBackendNotifications();
  const backendNotifications = data?.notifications ?? [];

  const rows: Row[] = [
    ...localNotifications.map((n) => ({
      key: `local-${n.id}`,
      title: n.title,
      description: n.description,
      dotClass: SEVERITY_DOT[n.severityLevel] || "bg-muted-foreground",
      createdAt: n.createdAt,
      read: n.read,
      source: "local" as const,
      href: "/dashboard/incidents",
    })),
    ...backendNotifications.map((n) => ({
      key: `backend-${n.id}`,
      title: n.title,
      description: n.message,
      dotClass: "bg-destructive",
      createdAt: n.createdAt,
      read: n.read,
      source: "backend" as const,
      backendId: n.id,
      href: process.env.NEXT_PUBLIC_deathreport || "/dashboard/death-reports",
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = rows.filter((r) => !r.read).length;

  const handleMarkAllRead = () => {
    localMarkAllRead();
    markAllRead.mutate();
  };

  const handleClearAll = () => {
    localClear();
    clearAll.mutate();
  };

  const handleRowClick = (row: Row) => {
    if (row.source === "backend" && row.backendId != null) {
      markRead.mutate(row.backendId);
    } else if (row.source === "local") {
      localMarkRead(row.key.replace(/^local-/, ""));
    }
  };

  return (
    <Popover>
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
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          ) : (
            <div className="divide-y">
              {rows.map((row) => (
                <Link
                  key={row.key}
                  href={row.href}
                  onClick={() => handleRowClick(row)}
                  className={cn(
                    "flex gap-3 px-3 py-3 text-sm transition-colors hover:bg-muted/60",
                    !row.read && "bg-primary/5"
                  )}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", row.dotClass)} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{row.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.description}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatRelativeTime(row.createdAt)}</p>
                  </div>
                  {!row.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
                </Link>
              ))}
            </div>
          )}
        </ScrollArea>
        {rows.length > 0 && (
          <div className="flex items-center gap-2 border-t p-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || markAllRead.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-destructive hover:text-destructive"
              onClick={handleClearAll}
              disabled={clearAll.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
