"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  TriangleAlert,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Eye,
  RefreshCw,
  ClipboardList,
  Activity,
  Users,
  ShieldCheck,
  ArrowRight,
  WifiOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge, StatusBadge } from "@/components/ui/status-badge";
import { StatTile } from "./StatTile";
import {
  IncidentsTrendChart,
  SeverityBreakdownChart,
  StatusBreakdownChart,
  TopBreakdownChart,
} from "./OverviewCharts";
import { useIncidentsAnalyticsQuery } from "@/lib/api/hooks/use-incidents";
import {
  computeStatusCounts,
  computeSeverityCounts,
  computeNearMissCount,
  computeTopBreakdown,
  computeDailyTimeSeries,
} from "@/lib/utils/incident-stats";

const CAPABILITIES = [
  {
    icon: ClipboardList,
    title: "Guided incident reporting",
    description: "A structured, multi-step form captures every detail — from reporter to root cause — in minutes.",
    href: "/",
    cta: "Report an Incident",
  },
  {
    icon: Activity,
    title: "Live status tracking",
    description: "Follow every report from unresolved through in-progress to fully resolved.",
    href: "/dashboard/incidents",
    cta: "View Incidents",
  },
  {
    icon: Users,
    title: "Role-based access",
    description: "supervisors, admins and super admins each see exactly the tools their role needs.",
    href: null,
    cta: null,
  },
  {
    icon: ShieldCheck,
    title: "Management oversight",
    description: "Risk assessment, follow-up actions and lessons learned, all attached to the original report.",
    href: "/dashboard/incidents",
    cta: "Review Reports",
  },
];

const cardEntrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: "easeOut" as const },
};

export default function OverviewPage() {
  const { data, isLoading, isError, isFetching, refetch } = useIncidentsAnalyticsQuery();
  const incidents = data?.data ?? [];
  const totalKnown = data?.pagination.total_items ?? incidents.length;
  const isPartial = totalKnown > incidents.length;

  const statusCounts = computeStatusCounts(incidents);
  const severityCounts = computeSeverityCounts(incidents);
  const nearMissCount = computeNearMissCount(incidents);
  const wardBreakdown = computeTopBreakdown(incidents, "incidentWardDept", 6);
  const causeBreakdown = computeTopBreakdown(incidents, "causeGroup", 6);
  const trend = computeDailyTimeSeries(incidents, 30);
  const recent = [...incidents]
    .sort((a, b) => (b.dateOfIncident || "").localeCompare(a.dateOfIncident || ""))
    .slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              A live snapshot of every incident tracked in the system.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-fit gap-2"
        >
          <RefreshCw className={isFetching ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
          Refresh
        </Button>
      </div>

      {isError ? (
        <Card className="rounded-2xl border-destructive/20">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <WifiOff className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Couldn&apos;t load incident data. Check your connection and try again.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {isPartial && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              Showing the most recent {incidents.length} of {totalKnown} incidents. The numbers below reflect this
              window, not the full history.
            </div>
          )}

          {/* KPI row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile label="Total" value={incidents.length} icon={Layers} loading={isLoading} />
            <StatTile
              label="Unresolved"
              value={statusCounts.unresolved}
              icon={TriangleAlert}
              tone="unresolved"
              loading={isLoading}
            />
            <StatTile
              label="In Progress"
              value={statusCounts.inprogress}
              icon={Clock}
              tone="inprogress"
              loading={isLoading}
            />
            <StatTile
              label="Resolved"
              value={statusCounts.resolved}
              icon={CheckCircle2}
              tone="resolved"
              loading={isLoading}
            />
            <StatTile
              label="Critical"
              value={severityCounts.critical}
              icon={ShieldAlert}
              tone="critical"
              loading={isLoading}
            />
            <StatTile label="Near Miss" value={nearMissCount} icon={Eye} tone="info" loading={isLoading} />
          </div>

          {/* Trend */}
          <motion.div {...cardEntrance}>
            <Card className="rounded-2xl py-0 shadow-sm">
              <CardHeader className="gap-1 border-b py-5">
                <CardTitle>Incidents Over Time</CardTitle>
                <CardDescription>Daily count for the last 30 days.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                {isLoading ? <Skeleton className="h-[220px] w-full rounded-xl" /> : <IncidentsTrendChart data={trend} />}
              </CardContent>
            </Card>
          </motion.div>

          {/* Severity + Status */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Severity Breakdown</CardTitle>
                  <CardDescription>How assessed severity is distributed across all reports.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <SeverityBreakdownChart counts={severityCounts} />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Status Breakdown</CardTitle>
                  <CardDescription>Where every report currently stands.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[160px] w-full rounded-xl" />
                  ) : (
                    <StatusBreakdownChart counts={statusCounts} />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Wards + Causes */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Top Wards / Departments</CardTitle>
                  <CardDescription>Where incidents are most frequently logged.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <TopBreakdownChart data={wardBreakdown} emptyMessage="No ward/department data yet." />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...cardEntrance}>
              <Card className="h-full rounded-2xl py-0 shadow-sm">
                <CardHeader className="gap-1 border-b py-5">
                  <CardTitle>Top Cause Groups</CardTitle>
                  <CardDescription>The most frequently recorded root-cause categories.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-4">
                  {isLoading ? (
                    <Skeleton className="h-[200px] w-full rounded-xl" />
                  ) : (
                    <TopBreakdownChart data={causeBreakdown} emptyMessage="No cause data yet." />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent incidents */}
          <motion.div {...cardEntrance}>
            <Card className="overflow-hidden rounded-2xl py-0 shadow-sm">
              <CardHeader className="flex-row items-center justify-between gap-3 border-b py-5">
                <div>
                  <CardTitle>Recent Incidents</CardTitle>
                  <CardDescription>The five most recently occurring reports.</CardDescription>
                </div>
                <Link href="/dashboard/incidents">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="divide-y p-0">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))
                ) : recent.length === 0 ? (
                  <p className="p-8 text-center text-sm text-muted-foreground">No incidents reported yet.</p>
                ) : (
                  recent.map((incident) => (
                    <div
                      key={incident.id}
                      className="flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{incident.incidentWardDept || "—"}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {incident.dateOfIncident} · Reported by {incident.reporterName}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <SeverityBadge severity={incident.severityLevel} />
                        <StatusBadge status={incident.incidentStatus} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Capabilities */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">What IncidentTracker Does</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((capability) => (
            <Card key={capability.title} className="flex h-full flex-col rounded-2xl shadow-sm">
              <CardContent className="flex flex-1 flex-col gap-3 p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <capability.icon className="h-5 w-5" />
                </span>
                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">{capability.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{capability.description}</p>
                </div>
                {capability.href && capability.cta && (
                  <Link href={capability.href} className="inline-flex w-fit">
                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-0 text-xs text-primary hover:bg-transparent hover:text-primary/80">
                      {capability.cta} <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
