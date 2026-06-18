"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Clock,
  MapPin,
  User,
  Briefcase,
  Phone,
  FileText,
  ShieldCheck,
  Activity,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type SeverityLevel = "near miss" | "minor" | "major" | "critical";
export type IncidentStatus = "unresolved" | "inprogress" | "resolved";

// Client-side source of truth matching the backend constraints
const VALID_STATUSES: { value: IncidentStatus; label: string }[] = [
  { value: "unresolved", label: "Unresolved" },
  { value: "inprogress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export interface IncidentReport {
  id: number;
  reporterName: string;
  department: string;
  position: string;
  contactInfo: string;
  dateOfIncident: string;
  timeOfIncident: string;
  locationOfIncident: string;
  typeOfIncident: string;
  peopleInvolved: string;
  descriptionOfIncident: string;
  immediateActionTaken: string;
  injuryOrDamage: string;
  severityLevel: SeverityLevel;
  supervisorNotified: string;
  recommendedPreventiveAction: string;
  incidentStatus: IncidentStatus;
}

interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

interface IncidentResponse {
  data: IncidentReport[];
  pagination: PaginationMeta;
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const router = useRouter();

  const fetchIncidents = async (page: number) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication required");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents?page=${page}&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch incident logs");
      }

      const resData: IncidentResponse = await response.json();
      setIncidents(resData.data || []);
      setPagination(resData.pagination);
    } catch (error: any) {
      toast.error(error.message || "An unexpected network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(currentPage);
  }, [currentPage]);

  // Handler to perform backend state modification
  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;

    // Minor optimization: Prevent redundant API calls if selecting the same status
    if (selectedIncident.incidentStatus === newStatus) return;

    setUpdatingStatus(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/${selectedIncident.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            "Forbidden: You are not allowed to update this incident's status",
          );
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update incident status");
      }

      const updatedIncident: IncidentReport = await response.json();

      // Update local detailed view data context
      setSelectedIncident(updatedIncident);

      // Sync list state tracking matrix updates smoothly
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === updatedIncident.id ? updatedIncident : inc,
        ),
      );

      toast.success(
        `Status updated to ${formatStatusText(newStatus)} successfully`,
      );
    } catch (error: any) {
      toast.error(error.message || "An error occurred while updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const getSeverityBadgeClass = (severity: SeverityLevel) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50";
      case "major":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50";
      case "minor":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50";
      case "near miss":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: IncidentStatus) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50";
      case "inprogress":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50";
      case "unresolved":
      default:
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50";
    }
  };

  const formatStatusText = (status: IncidentStatus) => {
    if (status === "inprogress") return "In Progress";
    if (status === "resolved") return "Resolved";
    return "Unresolved";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="border-muted/40 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b gap-4">
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Hospital Incident Logs
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Internal directory of logged safety events, risk evaluations, and
              departmental incident records.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0 sm:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground font-medium animate-pulse">
                Retrieving localized file secure transmissions...
              </p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No reported files match your credential profile authorization
              limits.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground py-3.5 pl-4">
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Reporter
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Department
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Incident Type
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Severity
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Status
                      </TableHead>
                      <TableHead className="text-right font-semibold text-foreground py-3.5 pr-4">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident, idx) => (
                      <TableRow
                        key={idx}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium whitespace-nowrap py-3.5 pl-4">
                          {incident.dateOfIncident}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-3.5">
                          {incident.reporterName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap capitalize py-3.5">
                          {incident.department}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate py-3.5">
                          {incident.typeOfIncident}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getSeverityBadgeClass(incident.severityLevel)}`}
                          >
                            {incident.severityLevel}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusBadgeClass(incident.incidentStatus)}`}
                          >
                            {formatStatusText(incident.incidentStatus)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3.5 pr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                            className="font-medium h-8 px-3"
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 px-1">
                  <div className="text-xs text-muted-foreground font-medium">
                    Showing total {pagination.total_items} records found Across
                    Clinical Sectors
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 border-muted"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs font-semibold px-3 text-foreground">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.total_pages}
                      className="h-8 w-8 border-muted"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedIncident}
        onOpenChange={(open) => !open && setSelectedIncident(null)}
      >
        <DialogContent className="!max-w-7xl !w-[94vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-xl border shadow-2xl bg-background">
          {selectedIncident && (
            <div className="space-y-6">
              <DialogHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      Incident Dossier File Record
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      Full administrative context mapping, statement
                      documentation and risk assessment registry parameters.
                    </DialogDescription>
                  </div>

                  {/* Enhanced Interactive Action Control Block */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 bg-muted/40 p-2 rounded-lg border border-muted">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="status-select"
                        className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                      >
                        Manage Status:
                      </label>
                      <div className="relative flex items-center">
                        <select
                          id="status-select"
                          value={selectedIncident.incidentStatus}
                          disabled={updatingStatus}
                          onChange={(e) =>
                            handleStatusChange(e.target.value as IncidentStatus)
                          }
                          className={`text-xs font-semibold uppercase tracking-wider px-3 py-1.5 pr-8 rounded-md border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 transition-all ${getStatusBadgeClass(selectedIncident.incidentStatus)}`}
                        >
                          {VALID_STATUSES.map((statusItem) => (
                            <option
                              key={statusItem.value}
                              value={statusItem.value}
                              className="bg-background text-foreground uppercase tracking-normal font-normal"
                            >
                              {statusItem.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 pointer-events-none text-muted-foreground">
                          {updatingStatus ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="h-4 w-px bg-muted hidden sm:block" />
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider ${getSeverityBadgeClass(selectedIncident.severityLevel)}`}
                    >
                      {selectedIncident.severityLevel} Severity
                    </span>
                  </div>
                </div>
              </DialogHeader>

              {/* Master Layout Architecture System */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* 1. TOP LEFT CONTAINER */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-muted/30 p-5 rounded-xl border border-muted/70 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-3 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Personnel Profile
                      </h3>
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Reporter Name
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedIncident.reporterName}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Department / Position
                            </span>
                            <span className="capitalize font-medium text-foreground">
                              {selectedIncident.department}
                            </span>
                            {selectedIncident.position && (
                              <span className="text-muted-foreground block text-xs mt-0.5 font-normal">
                                {selectedIncident.position}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Contact Path
                            </span>
                            <span className="font-medium text-foreground/80">
                              {selectedIncident.contactInfo ||
                                "None Registered"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-3 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5" /> Event Metrics
                      </h3>
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Date Logged
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedIncident.dateOfIncident}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Time Stamp
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedIncident.timeOfIncident || "Unspecified"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Localization Zone
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedIncident.locationOfIncident}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TOP RIGHT CONTAINER */}
                <div className="lg:col-span-2 bg-muted/20 p-5 rounded-xl border border-muted/60 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Incident Type Group
                      </h4>
                      <p className="text-sm font-semibold text-foreground bg-background p-3 rounded-lg border shadow-sm">
                        {selectedIncident.typeOfIncident}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Supervisor Notified Route
                      </h4>
                      <p className="text-sm text-foreground bg-background p-3 rounded-lg border shadow-sm">
                        {selectedIncident.supervisorNotified || "None Noted"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Personnel / Witnesses Involved
                      </h4>
                      <div className="text-sm text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                        {selectedIncident.peopleInvolved ||
                          "No third party statements matching profile logs."}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Chronological Factual Description
                      </h4>
                      <div className="text-sm text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                        {selectedIncident.descriptionOfIncident}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Immediate Mitigation Measures Taken
                      </h4>
                      <div className="text-sm text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                        {selectedIncident.immediateActionTaken}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Bodily Injury or Property Damage Assertions
                      </h4>
                      <div className="text-sm text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                        {selectedIncident.injuryOrDamage}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. BOTTOM CONTAINER */}
                <div className="lg:col-span-3 bg-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />{" "}
                    Recommended Continuous Preventive Actions
                  </h4>
                  <div className="text-sm text-card-foreground bg-background p-4 rounded-lg border border-muted/60 shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                    {selectedIncident.recommendedPreventiveAction}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedIncident(null)}
                  className="px-6 font-medium h-10 shadow-sm"
                >
                  Close File Record
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
