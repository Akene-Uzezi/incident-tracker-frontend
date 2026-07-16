"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  FilePlus2,
  LogOut,
  UserPlus,
  User as UserIcon,
  ChevronLeft,
  Menu,
  LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore, useAuthUser, useIsSuperAdmin } from "@/lib/store/auth-store";
import { useUIStore } from "@/lib/store/ui-store";
import { NavigationItem, SuperAdminNavigationItem } from "./types/navTypes";
import type { AuthUser } from "@/lib/types";

function getNavItems(pathname: string): NavigationItem[] {
  return [
    {
      label: "View Incidents",
      href: "/dashboard",
      icon: LayoutDashboard,
      variant: pathname === "/dashboard" ? "default" : "ghost",
    },
    {
      label: "Report an Incident",
      href: "/",
      icon: FilePlus2,
      variant: pathname === "/" ? "default" : "ghost",
    },
  ];
}

function getSuperAdminNavItems(pathname: string): SuperAdminNavigationItem[] {
  return [
    {
      label: "Create User",
      href: "/dashboard/register",
      icon: UserPlus,
      variant: pathname === "/dashboard/register" ? "default" : "ghost",
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: UserIcon,
      variant: pathname === "/dashboard/users" ? "default" : "ghost",
    },
    {
      label: "Reset Password",
      href: "/dashboard/resetpassword",
      icon: LockKeyhole,
      variant: pathname === "/dashboard/resetpassword" ? "default" : "ghost",
    },
  ];
}

function NavLinks({
  pathname,
  isSuperAdmin,
  sidebarOpen,
  onNavigate,
}: {
  pathname: string;
  isSuperAdmin: boolean;
  sidebarOpen: boolean;
  onNavigate?: () => void;
}) {
  const navigationItems = getNavItems(pathname);
  const superAdminNavItems = getSuperAdminNavItems(pathname);

  return (
    <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
            item.variant === "default"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            !sidebarOpen && "md:justify-center md:px-0"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
          <span className={cn(!sidebarOpen && "md:hidden")}>{item.label}</span>
        </Link>
      ))}

      {isSuperAdmin &&
        superAdminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
              item.variant === "default"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              !sidebarOpen && "md:justify-center md:px-0"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
            <span className={cn(!sidebarOpen && "md:hidden")}>{item.label}</span>
          </Link>
        ))}
    </div>
  );
}

function UserMenu({
  user,
  compact,
  onLogout,
}: {
  user: AuthUser | null;
  compact?: boolean;
  onLogout: () => void;
}) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted",
            compact && "md:justify-center md:px-0"
          )}
        >
          <Avatar size="sm">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div className={cn("flex min-w-0 flex-col", compact && "md:hidden")}>
            <span className="truncate text-sm font-medium text-foreground">{user?.name || "Unknown user"}</span>
            <span className="truncate text-xs capitalize text-muted-foreground">{user?.role || "—"}</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} variant="destructive" className="gap-2">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();
  const isSuperAdmin = useIsSuperAdmin();
  const clearSession = useAuthStore((s) => s.clear);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/images/rhv logo.png" alt="RHV Logo" width={90} height={24} className="h-6 w-auto" />
            {sidebarOpen && <span className="font-bold text-primary transition-opacity duration-200">IncidentTracker</span>}
          </Link>
        </div>

        <NavLinks pathname={pathname} isSuperAdmin={isSuperAdmin} sidebarOpen={sidebarOpen} />

        <div className="mt-auto border-t p-3 space-y-2">
          <div className={cn("flex items-center", sidebarOpen ? "justify-between" : "justify-center")}>
            <UserMenu user={user} compact={!sidebarOpen} onLogout={handleLogout} />
            {sidebarOpen && <ThemeToggle />}
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground group",
              !sidebarOpen && "justify-center px-0"
            )}
          >
            <ChevronLeft className={cn("h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out", !sidebarOpen && "rotate-180")} />
            <span className={cn("whitespace-nowrap transition-all duration-200", !sidebarOpen && "hidden w-0 opacity-0")}>
              Minimize Sidebar
            </span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "md:pl-64" : "md:pl-16"
        )}
      >
        {/* Mobile header */}
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle className="flex items-center gap-2">
                  <img src="/images/rhv logo.png" alt="RHV Logo" width={90} height={24} className="h-6 w-auto" />
                  <span className="flex items-center gap-1 text-primary">
                    <ShieldAlert className="h-4 w-4" />
                    IncidentTracker
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex h-[calc(100%-4.5rem)] flex-col">
                <NavLinks
                  pathname={pathname}
                  isSuperAdmin={isSuperAdmin}
                  sidebarOpen
                  onNavigate={() => setMobileNavOpen(false)}
                />
                <div className="mt-auto border-t p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <UserMenu user={user} onLogout={handleLogout} />
                    <ThemeToggle />
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img src="/images/rhv logo.png" alt="RHV Logo" width={90} height={24} className="h-6 w-auto" />
            <span>IncidentTracker</span>
          </Link>

          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto bg-muted/5 p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
