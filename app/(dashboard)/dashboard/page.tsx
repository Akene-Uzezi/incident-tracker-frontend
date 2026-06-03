// src/app/(dashboard)/dashboard/page.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved";
  createdAt: string;
}

export default function DashboardPage() {
  // Production seed layout data template
  const mockIncidents: Incident[] = [
    {
      id: "INC-1024",
      title:
        "Production database connection timeouts connection pooling exhaustion",
      severity: "Critical",
      status: "In Progress",
      createdAt: "2026-06-03 11:14",
    },
    {
      id: "INC-1023",
      title:
        "Authentication callback failing for OAuth verification structures",
      severity: "High",
      status: "Open",
      createdAt: "2026-06-03 09:32",
    },
    {
      id: "INC-1022",
      title:
        "SSL validation certificate expiration warning banner styling mismatch",
      severity: "Low",
      status: "Resolved",
      createdAt: "2026-06-02 14:05",
    },
  ];

  const getSeverityBadgeClass = (severity: Incident["severity"]) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    }
  };

  const getStatusBadgeClass = (status: Incident["status"]) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "In Progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "Resolved":
        return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Incident Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time analysis, operational visibility, and state handling.
        </p>
      </div>

      {/* Analytics KPI Metrics Matrix Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Issues
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tickets
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Under Investigation
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-sans">1</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Today
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Tracking Workspace Table Area Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Active Outages & Incidents</CardTitle>
          <CardDescription>
            Historical distribution tracking updates over the execution
            timeframe cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto border rounded-md">
            <table
              className="w-full caption-bottom text-sm border-collapse"
              role="table"
            >
              <thead>
                <tr className="border-b bg-muted/50 transition-colors text-muted-foreground text-left font-medium">
                  <th className="h-12 px-4 align-middle font-medium w-[100px]">
                    ID
                  </th>
                  <th className="h-12 px-4 align-middle font-medium">
                    Incident Summary
                  </th>
                  <th className="h-12 px-4 align-middle font-medium w-[120px]">
                    Severity
                  </th>
                  <th className="h-12 px-4 align-middle font-medium w-[120px]">
                    Status
                  </th>
                  <th className="h-12 px-4 align-middle font-medium w-[180px]">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockIncidents.map((incident) => (
                  <tr
                    key={incident.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="p-4 align-middle font-mono font-medium">
                      {incident.id}
                    </td>
                    <td className="p-4 align-middle font-medium max-w-sm truncate">
                      {incident.title}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getSeverityBadgeClass(incident.severity)}`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusBadgeClass(incident.status)}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-muted-foreground">
                      {incident.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
