"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, Filter, X } from "lucide-react";
import { IncidentReport, IncidentStatus, VALID_STATUSES, formatStatusText } from "@/lib/types";
import { useIncidentsQuery } from "@/lib/api/hooks/use-incidents";
import { IncidentTable } from "./IncidentTable";
import { IncidentDetails } from "./IncidentDetails";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);

  const { data, isLoading } = useIncidentsQuery({
    page: currentPage,
    status: selectedStatusFilter,
    dateFrom,
    dateTo,
  });

  const incidents = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  // The backend query param doesn't reliably filter by status, so we
  // filter the fetched page of incidents client-side before rendering.
  const filteredIncidents =
    selectedStatusFilter === "all"
      ? incidents
      : incidents.filter((incident) => incident.incidentStatus === selectedStatusFilter);

  const handleStatusSelect = (status: string) => {
    setSelectedStatusFilter(status);
    setCurrentPage(1);
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedStatusFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                Incident Control Room Logs
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitor clinical risk profiles, workflows, and administrative resolutions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:self-start">
              <div className="flex items-center gap-1.5 rounded-lg border bg-background px-2 py-1 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-6 w-28 border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                />
                <span className="px-0.5 text-xs font-medium text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-6 w-28 border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                />
              </div>

              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  onClick={clearDateFilters}
                  className="h-8 gap-1 px-2 text-xs text-rose-600 hover:bg-rose-50/50 hover:text-rose-700"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Dates
                </Button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-dashed pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 gap-2 px-3 text-xs font-medium shadow-sm">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    Status:{" "}
                    <strong className="text-primary">
                      {selectedStatusFilter === "all"
                        ? "All Logs"
                        : formatStatusText(selectedStatusFilter as IncidentStatus)}
                    </strong>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">
                  Select Workflow View
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusSelect("all")} className="justify-between">
                  All Logs
                  {selectedStatusFilter === "all" && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                {VALID_STATUSES.map((st) => (
                  <DropdownMenuItem
                    key={st.value}
                    onClick={() => handleStatusSelect(st.value)}
                    className="justify-between"
                  >
                    {st.label}
                    {selectedStatusFilter === st.value && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden text-xs text-muted-foreground sm:block">
              {hasActiveFilters ? (
                <Badge variant="outline" className="border-amber-200/70 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                  Filters active
                </Badge>
              ) : (
                <span className="text-[11px]">Displaying exhaustive operational ledger</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <IncidentTable
            incidents={filteredIncidents}
            loading={isLoading}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onViewIncident={setSelectedIncident}
          />
        </CardContent>
      </Card>

      <IncidentDetails incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
    </div>
  );
}
