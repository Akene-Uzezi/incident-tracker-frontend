"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  LayoutDashboard,
  FilePlus2,
  LogOut,
  UserPlus,
  User,
  ChevronLeft,
  Menu,
  LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { NavigationItem, SuperAdminNavigationItem } from "./types/navTypes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [user, setUser] = useState<any>({});

  const navigationItems: NavigationItem[] = [
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

  const superAdminNavItems: SuperAdminNavigationItem[] = [
    {
      label: "Create User",
      href: "/dashboard/register",
      icon: UserPlus,
      variant: pathname === "/dashboard/register" ? "default" : "ghost",
    },
    {
      label: "Users",
      href: "/dashboard/users",
      icon: User,
      variant: pathname === "/dashboard/users" ? "default" : "ghost",
    },
    {
      label: "Reset Password",
      href: "/dashboard/resetpassword",
      icon: LockKeyhole,
      variant: pathname === "/dashboard/resetpassword" ? "default" : "ghost",
    },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAuthenticated(true);

      // Pull the user object directly out of localStorage
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse user object from localStorage:", error);
        }
      } else {
        console.warn(
          "No 'user' key found in localStorage. Ensure your login component saves it using: localStorage.setItem('user', JSON.stringify(userData))"
        );
      }
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    router.push("/login");
  };

  return (
    <div className={cn("flex min-h-screen bg-background font-sans antialiased", inter.variable)}>
      {/* Desktop Sidebar Layout */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-background transition-all duration-300 ease-in-out hidden md:flex",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Branding Container */}
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img
              src="/images/rhv logo.png"
              alt="RHV Logo"
              width={90}
              height={24}
              className="h-6 w-auto"
            />
            {isSidebarOpen && (
              <span className="font-bold text-blue-600 transition-opacity duration-200">
                IncidentTracker
              </span>
            )}
          </Link>
        </div>

        {/* Primary Functional Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                item.variant === "default"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}

          {/* Elevated Administrative Action Elements */}
          {/* Made case-insensitive to safely catch 'superadmin', 'SuperAdmin', or 'SUPERADMIN' */}
          {user?.role?.toLowerCase() === "superadmin" &&
            superAdminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  item.variant === "default"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
        </div>

        {/* Actions Section - Affixed cleanly to the bottom container */}
        <div className="mt-auto p-3 border-t space-y-1">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground group cursor-pointer",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-300 ease-in-out",
                !isSidebarOpen && "rotate-180"
              )}
            />
            <span
              className={cn(
                "transition-all duration-200 whitespace-nowrap",
                !isSidebarOpen && "w-0 opacity-0 pointer-events-none hidden"
              )}
            >
              Minimize Sidebar
            </span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive group",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span
              className={cn(
                "transition-all duration-200 whitespace-nowrap",
                !isSidebarOpen && "w-0 opacity-0 pointer-events-none hidden"
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Structural Layout View Container Wrapper */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out min-h-screen",
          isSidebarOpen ? "md:pl-64" : "md:pl-16"
        )}
      >
        {/* Mobile Header Visibility Container fallback */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 md:hidden">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <img
              src="/images/rhv logo.png"
              alt="RHV Logo"
              width={90}
              height={24}
              className="h-6 w-auto"
            />
            <span>IncidentTracker</span>
          </Link>
        </header>

        {/* Content Injection Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
