// src/app/(dashboard)/layout.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  FilePlus2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "ghost";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navigationItems: NavigationItem[] = [
    {
      label: "View Incidents",
      href: "/dashboard",
      icon: LayoutDashboard,
      variant: pathname === "/dashboard" ? "default" : "ghost",
    },
    {
      label: "Report an Incident",
      href: "/dashboard/report",
      icon: FilePlus2,
      variant: pathname === "/dashboard/report" ? "default" : "ghost",
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      variant: pathname === "/dashboard/settings" ? "default" : "ghost",
    },
  ];

  const handleLogout = () => {
    // Backend logout configuration logic will integrate here
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar navigation */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background p-4 md:flex">
        <div className="flex h-14 items-center px-2 py-4 mb-6 border-b">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-lg tracking-tight"
          >
            <ShieldAlert className="h-6 w-6 text-destructive" />
            <span>IncidentTracker</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-2" aria-label="Main Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  item.variant === "default"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-2 border-t pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive group"
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main layout container viewport spacing */}
      <div className="flex flex-1 flex-col md:pl-64">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 md:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <span>IncidentTracker</span>
          </Link>
          {/* Mobile responsive popovers or alternative execution logic can mount cleanly right here */}
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
