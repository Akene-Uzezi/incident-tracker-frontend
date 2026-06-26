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
      label: "Add User",
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.replace("/login");
    } else {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  if (!isAuthenticated) {
    return (
      <div
        className={`${inter.variable} flex h-screen w-screen items-center justify-center bg-background text-muted-foreground`}
      >
        <div className="flex flex-col items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-destructive animate-pulse" />
          <p className="text-sm font-medium tracking-wide">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${inter.variable} flex min-h-screen bg-muted/20`}>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden flex-col border-r bg-background p-4 md:flex transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-16 px-2",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center justify-between py-4 mb-6 border-b transition-all",
            isSidebarOpen ? "px-2" : "px-0 justify-center",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center justify-center gap-1 font-semibold tracking-tight transition-all duration-200",
              !isSidebarOpen && "w-0 h-0 opacity-0 overflow-hidden",
            )}
          >
            <img
              src="/images/rhv logo.png"
              alt="RHV Logo"
              width={90}
              height={24}
              className="h-6 w-auto"
            />
            <span className="text-sm">IncidentTracker</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform duration-300",
                !isSidebarOpen && "rotate-180",
              )}
            />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-2" aria-label="Main Navigation">
          <motion.div
            variants={navContainerVariants}
            initial="hidden"
            animate="visible"
          >
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.href} variants={{ itemVariants }}>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{
                      scale: 0.97,
                      transition: {
                        type: "spring",
                        stiffness: 500,
                        damping: 18,
                      },
                    }}
                  >
                    <Link
                      href={item.href}
                      title={!isSidebarOpen ? item.label : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative",
                        item.variant === "default"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-muted-foreground hover:bg-blue-100 hover:text-foreground dark:hover:bg-slate-800",
                        !isSidebarOpen && "justify-center px-0",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span
                        className={cn(
                          "transition-all duration-200 whitespace-nowrap",
                          !isSidebarOpen &&
                            "w-0 opacity-0 pointer-events-none hidden",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
            {user.role === "superadmin" && (
              <>
                {superAdminNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.href} variants={{ itemVariants }}>
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{
                          scale: 0.97,
                          transition: {
                            type: "spring",
                            stiffness: 500,
                            damping: 18,
                          },
                        }}
                      >
                        <Link
                          href={item.href}
                          title={!isSidebarOpen ? item.label : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative",
                            item.variant === "default"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "text-muted-foreground hover:bg-blue-100 hover:text-foreground dark:hover:bg-slate-800",
                            !isSidebarOpen && "justify-center px-0",
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span
                            className={cn(
                              "transition-all duration-200 whitespace-nowrap",
                              !isSidebarOpen &&
                                "w-0 opacity-0 pointer-events-none hidden",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </motion.div>
        </nav>

        <div className="mt-auto px-2 border-t pt-4">
          <button
            onClick={handleLogout}
            title={!isSidebarOpen ? "Logout" : undefined}
            className={cn(
              "cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive group",
              !isSidebarOpen && "justify-center px-0",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
            <span
              className={cn(
                "transition-all duration-200",
                !isSidebarOpen && "w-0 opacity-0 pointer-events-none hidden",
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? "md:pl-64" : "md:pl-16",
        )}
      >
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 md:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
