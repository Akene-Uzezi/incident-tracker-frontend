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
  FileSpreadsheet,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

export type SeverityLevel = "near miss" | "minor" | "major" | "critical";
export type IncidentStatus = "unresolved" | "inprogress" | "resolved";

const VALID_STATUSES: { value: IncidentStatus; label: string }[] = [
  { value: "unresolved", label: "Unresolved" },
  { value: "inprogress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export interface IncidentReport {
  id: number;
  principalName: string;
  principalGender: string;
  principalDob: string;
  principalType: string;
  patientId?: string;
  patientWardDept?: string;
  staffJobTitle?: string;
  staffPhone?: string;
  staffPlaceOfWork?: string;
  staffSite?: string;
  peopleInvolved: string;
  dateOfIncident: string;
  timeOfIncident: string;
  locationOfIncident: string;
  incidentWardDept: string;
  witnesses?: string;
  witnessType?: string;
  witnessWardDept?: string;
  witnessJobTitle?: string;
  witenssPhone?: string;
  isNearMiss: boolean;
  causeGroup: string;
  causes: string;
  prescribingDoctor?: string;
  treatmentReceived: string;
  equipmentInvolved: string;
  equipmentModel?: string;
  equipmentSentForRepair: boolean;
  equipmentWithdrawn: boolean;
  equipmentRetained: boolean;
  equipmentNumber?: string;
  isMedicalDevice?: string;
  reporterName: string;
  reporterDesignation: string;
  signature: boolean;
  reporterInfo: string;
  date: string;
  severityLevel: SeverityLevel;
  incidentStatus: IncidentStatus;
}

// Added backend data model interface alignment
export interface IncidentManagement {
  id?: number;
  incidentId: number;
  impactOnService: string;
  contributoryFactors: string;
  actionsTakenOutcomes: string;
  recommendations: string;
  lessonsLearned: string;
  informedPatient: boolean;
  informedRelative: boolean;
  informedSeniorManager: boolean;
  informedPharmacist: boolean;
  policeIncidentNumber?: string;
  informedOther?: string;
  riskSeverity: number;
  riskLikelihood: number;
  riskRating: number;
  ohsAbsenceOver3Days: boolean;
  ohsActOfViolenceOrDanger: boolean;
  ohsHospitalisationOver24Hours: boolean;
  ohsStaffName?: string;
  ohsStaffDob?: string;
  ohsStaffAddress?: string;
  managerName: string;
  managerSignature: boolean;
  managerDesignation: string;
  managerDate: string;
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

  // New states managed for Section H Management Reports
  const [managementReport, setManagementReport] =
    useState<IncidentManagement | null>(null);
  const [loadingManagement, setLoadingManagement] = useState<boolean>(false);
  const [isAddingManagement, setIsAddingManagement] = useState<boolean>(false);
  const [submittingManagement, setSubmittingManagement] =
    useState<boolean>(false);

  // Management Form Initial State
  const [mgmtForm, setMgmtForm] = useState<Partial<IncidentManagement>>({
    impactOnService: "",
    contributoryFactors: "",
    actionsTakenOutcomes: "",
    recommendations: "",
    lessonsLearned: "",
    informedPatient: false,
    informedRelative: false,
    informedSeniorManager: false,
    informedPharmacist: false,
    policeIncidentNumber: "",
    informedOther: "",
    riskSeverity: 1,
    riskLikelihood: 1,
    riskRating: 1,
    ohsAbsenceOver3Days: false,
    ohsActOfViolenceOrDanger: false,
    ohsHospitalisationOver24Hours: false,
    ohsStaffName: "",
    ohsStaffDob: "",
    ohsStaffAddress: "",
    managerName: "",
    managerSignature: false,
    managerDesignation: "",
    managerDate: new Date().toISOString().split("T")[0],
  });

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

  // Pulls associated Management Report from your backend API
  const fetchManagementReport = async (incidentId: number) => {
    setLoadingManagement(true);
    setManagementReport(null);
    setIsAddingManagement(false);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/${incidentId}/management`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setManagementReport(data);
      } else if (response.status === 404) {
        // Report doesn't exist yet, which is safe/expected
        setManagementReport(null);
      } else {
        throw new Error(
          "Failed to pull secondary administrative management logs",
        );
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoadingManagement(false);
    }
  };

  useEffect(() => {
    fetchIncidents(currentPage);
  }, [currentPage]);

  // Handle trigger side-effect whenever the details modal opens up
  useEffect(() => {
    if (selectedIncident) {
      fetchManagementReport(selectedIncident.id);
      // Synchronize context base inside form setup
      setMgmtForm((prev) => ({
        ...prev,
        incidentId: selectedIncident.id,
        ohsStaffName:
          selectedIncident.principalType === "staff"
            ? selectedIncident.principalName
            : "",
        ohsStaffDob:
          selectedIncident.principalType === "staff"
            ? selectedIncident.principalDob
            : "",
      }));
    }
  }, [selectedIncident]);

  // Automated Matrix calculation tracking
  useEffect(() => {
    const sev = mgmtForm.riskSeverity || 1;
    const like = mgmtForm.riskLikelihood || 1;
    setMgmtForm((prev) => ({ ...prev, riskRating: sev * like }));
  }, [mgmtForm.riskSeverity, mgmtForm.riskLikelihood]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
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

      setSelectedIncident(updatedIncident);
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

  const handleManagementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    setSubmittingManagement(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/${selectedIncident.id}/management`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mgmtForm),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to submit management report data fields.",
        );
      }

      const freshReport = await response.json();
      setManagementReport(freshReport);
      setIsAddingManagement(false);
      toast.success(
        "Section H Management Report appended to dossier file successfully.",
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          "Network execution exception on database pipeline connection.",
      );
    } finally {
      setSubmittingManagement(false);
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
                Retrieving data logs...
              </p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              No reported incident files found matching your profile.
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
                        Incident Ward/Dept
                      </TableHead>
                      <TableHead className="font-semibold text-foreground py-3.5">
                        Cause Group
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
                    {incidents.map((incident) => (
                      <TableRow
                        key={incident.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-medium whitespace-nowrap py-3.5 pl-4">
                          {incident.dateOfIncident}
                        </TableCell>
                        <TableCell className="whitespace-nowrap py-3.5">
                          {incident.reporterName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap capitalize py-3.5">
                          {incident.incidentWardDept}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate py-3.5">
                          {incident.causeGroup}
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
                    Showing total {pagination.total_items} records across
                    clinical sectors
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
                      Incident Dossier File Record #{selectedIncident.id}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      Full administrative context mapping, statement
                      documentation and risk assessment parameters.
                    </DialogDescription>
                  </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* 1. ADMINISTRATIVE METRICS */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-muted/30 p-5 rounded-xl border border-muted/70 shadow-sm space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b pb-2 mb-3 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" /> Reporter Profile
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
                              Designation / Position
                            </span>
                            <span className="capitalize font-medium text-foreground">
                              {selectedIncident.reporterDesignation}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5 text-sm">
                          <div className="p-1 rounded bg-background border mt-0.5 shrink-0">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <span className="block font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                              Contact Parameters
                            </span>
                            <span className="font-medium text-foreground/80 break-all">
                              {selectedIncident.reporterInfo}
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
                              Date of Incident
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
                              Location Zone & Dept
                            </span>
                            <span className="font-medium text-foreground">
                              {selectedIncident.locationOfIncident} (
                              {selectedIncident.incidentWardDept})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CLINICAL & CASE CONTEXT DATA */}
                <div className="lg:col-span-2 bg-muted/20 p-5 rounded-xl border border-muted/60 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Cause Group
                      </h4>
                      <p className="text-sm font-semibold text-foreground bg-background p-3 rounded-lg border shadow-sm capitalize">
                        {selectedIncident.causeGroup}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Principal Person Involved
                      </h4>
                      <div className="text-sm text-foreground bg-background p-3 rounded-lg border shadow-sm">
                        <span className="font-medium">
                          {selectedIncident.principalName}
                        </span>{" "}
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Type: {selectedIncident.principalType} | Gender:{" "}
                          {selectedIncident.principalGender} | DOB:{" "}
                          {selectedIncident.principalDob}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic sub-panels checking profile metrics */}
                  {(selectedIncident.patientId ||
                    selectedIncident.staffJobTitle) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background/60 p-4 rounded-lg border text-sm">
                      {selectedIncident.patientId && (
                        <div className="space-y-1">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Patient Registry Data
                          </span>
                          <p className="text-xs text-foreground">
                            <strong>Patient ID:</strong>{" "}
                            {selectedIncident.patientId}
                          </p>
                          <p className="text-xs text-foreground">
                            <strong>Ward/Dept:</strong>{" "}
                            {selectedIncident.patientWardDept || "N/A"}
                          </p>
                        </div>
                      )}
                      {selectedIncident.staffJobTitle && (
                        <div className="space-y-1">
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Staff Member Core Data
                          </span>
                          <p className="text-xs text-foreground">
                            <strong>Job Title:</strong>{" "}
                            {selectedIncident.staffJobTitle}
                          </p>
                          <p className="text-xs text-foreground">
                            <strong>Workplace/Site:</strong>{" "}
                            {selectedIncident.staffPlaceOfWork} (
                            {selectedIncident.staffSite})
                          </p>
                          <p className="text-xs text-foreground">
                            <strong>Phone:</strong>{" "}
                            {selectedIncident.staffPhone || "N/A"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Personnel & Witnesses Account
                      </h4>
                      <div className="text-xs text-foreground bg-background p-4 rounded-lg border shadow-sm space-y-3 whitespace-pre-wrap leading-relaxed break-words">
                        <div>
                          <span className="block font-bold text-[10px] uppercase text-muted-foreground mb-1">
                            People Involved:
                          </span>
                          <p>{selectedIncident.peopleInvolved}</p>
                        </div>
                        {selectedIncident.witnesses && (
                          <div className="pt-2 border-t border-muted">
                            <span className="block font-bold text-[10px] uppercase text-muted-foreground mb-1">
                              Witness Statements ({selectedIncident.witnessType}
                              ):
                            </span>
                            <p className="font-medium">
                              {selectedIncident.witnesses}
                            </p>
                            <p className="text-muted-foreground text-[11px] mt-1">
                              Dept: {selectedIncident.witnessWardDept} | Title:{" "}
                              {selectedIncident.witnessJobTitle} | Contact:{" "}
                              {selectedIncident.witenssPhone}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Factual Description of Causes
                      </h4>
                      <div className="text-xs text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words [overflow-wrap:anywhere]">
                        {selectedIncident.causes}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Treatment Received Measures
                      </h4>
                      <div className="text-xs text-foreground bg-background p-4 rounded-lg border shadow-sm whitespace-pre-wrap leading-relaxed break-words">
                        <p>{selectedIncident.treatmentReceived}</p>
                        {selectedIncident.prescribingDoctor && (
                          <p className="text-[11px] text-muted-foreground font-medium mt-2 pt-2 border-t">
                            Prescribing Medical Officer:{" "}
                            {selectedIncident.prescribingDoctor}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Equipment / Medical Device Allocation
                      </h4>
                      <div className="text-xs text-foreground bg-background p-4 rounded-lg border shadow-sm space-y-1.5">
                        <p>
                          <strong>Involved:</strong>{" "}
                          {selectedIncident.equipmentInvolved}
                        </p>
                        {selectedIncident.isMedicalDevice && (
                          <p>
                            <strong>Device Status:</strong> Classed as medical
                            device ({selectedIncident.isMedicalDevice})
                          </p>
                        )}
                        {selectedIncident.equipmentModel && (
                          <p>
                            <strong>Model Layout:</strong>{" "}
                            {selectedIncident.equipmentModel}
                          </p>
                        )}
                        {selectedIncident.equipmentNumber && (
                          <p>
                            <strong>Asset Number:</strong>{" "}
                            {selectedIncident.equipmentNumber}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {selectedIncident.equipmentSentForRepair && (
                            <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border">
                              Sent For Repair
                            </span>
                          )}
                          {selectedIncident.equipmentWithdrawn && (
                            <span className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border">
                              Withdrawn
                            </span>
                          )}
                          {selectedIncident.equipmentRetained && (
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border">
                              Retained
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. COMPLIANCE AND VALIDATION SYSTEM */}
                <div className="lg:col-span-3 bg-primary/5 p-5 rounded-xl border border-primary/20 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />{" "}
                    Reporter Administrative Validation & Safety Assessment
                  </h4>
                  <div className="text-xs text-card-foreground bg-background p-4 rounded-lg border border-muted/60 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground">
                        <strong>Form Signature Status:</strong>
                      </p>
                      <p className="font-semibold text-sm mt-0.5">
                        {selectedIncident.signature
                          ? "Verified Electronically Signed"
                          : "No Signature Record"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <strong>Submission System Date:</strong>
                      </p>
                      <p className="font-semibold text-sm mt-0.5">
                        {selectedIncident.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        <strong>Risk Parameter Category:</strong>
                      </p>
                      <p className="font-semibold text-sm mt-0.5">
                        {selectedIncident.isNearMiss
                          ? "Classified Near Miss Event"
                          : "Standard Incident Impact Record"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ============================================================== */}
                {/* DYNAMIC PIPELINE: SECTION H, I, J MANAGEMENT REPORT REGISTRY   */}
                {/* ============================================================== */}
                <div className="lg:col-span-3 border-t pt-6 mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      Section H, I, & J: Management Evaluation Report
                    </h3>

                    {!loadingManagement &&
                      !managementReport &&
                      !isAddingManagement && (
                        <Button
                          size="sm"
                          onClick={() => setIsAddingManagement(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
                        >
                          <Plus className="h-4 w-4" /> Add Management Report
                        </Button>
                      )}
                  </div>

                  {loadingManagement ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground p-4 bg-muted/20 border rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      Analyzing management log records...
                    </div>
                  ) : managementReport ? (
                    /* VIEW MODE: If the record has been submitted already */
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-6 rounded-xl border border-emerald-500/20 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                              Impact on Service/Individual
                            </span>
                            <p className="text-sm p-3 bg-background border rounded-lg shadow-sm">
                              {managementReport.impactOnService}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                              Contributory Factors
                            </span>
                            <p className="text-sm p-3 bg-background border rounded-lg shadow-sm">
                              {managementReport.contributoryFactors}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                              Actions Taken & Outcomes
                            </span>
                            <p className="text-sm p-3 bg-background border rounded-lg shadow-sm">
                              {managementReport.actionsTakenOutcomes}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                              Recommendations
                            </span>
                            <p className="text-sm p-3 bg-background border rounded-lg shadow-sm">
                              {managementReport.recommendations}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                            Lessons Learned
                          </span>
                          <p className="text-sm p-3 bg-background border rounded-lg shadow-sm whitespace-pre-wrap">
                            {managementReport.lessonsLearned}
                          </p>
                        </div>

                        {/* Notifications matrix mapping info */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                            Stakeholder Notifications Tracking
                          </span>
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`px-2.5 py-1 rounded text-xs border font-medium ${managementReport.informedPatient ? "bg-emerald-100/70 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                            >
                              Patient Informed:{" "}
                              {managementReport.informedPatient ? "Yes" : "No"}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded text-xs border font-medium ${managementReport.informedRelative ? "bg-emerald-100/70 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                            >
                              Relative Informed:{" "}
                              {managementReport.informedRelative ? "Yes" : "No"}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded text-xs border font-medium ${managementReport.informedSeniorManager ? "bg-emerald-100/70 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                            >
                              Senior Manager Informed:{" "}
                              {managementReport.informedSeniorManager
                                ? "Yes"
                                : "No"}
                            </span>
                            <span
                              className={`px-2.5 py-1 rounded text-xs border font-medium ${managementReport.informedPharmacist ? "bg-emerald-100/70 text-emerald-800" : "bg-muted text-muted-foreground"}`}
                            >
                              Pharmacist Informed:{" "}
                              {managementReport.informedPharmacist
                                ? "Yes"
                                : "No"}
                            </span>
                          </div>
                          {(managementReport.policeIncidentNumber ||
                            managementReport.informedOther) && (
                            <div className="text-xs text-muted-foreground bg-background p-2 border rounded mt-2 space-y-1">
                              {managementReport.policeIncidentNumber && (
                                <p>
                                  <strong>Police Incident Number:</strong>{" "}
                                  {managementReport.policeIncidentNumber}
                                </p>
                              )}
                              {managementReport.informedOther && (
                                <p>
                                  <strong>Other Notified Contexts:</strong>{" "}
                                  {managementReport.informedOther}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Management Validation Summary Sidebar Panel */}
                      <div className="md:col-span-1 space-y-4 border-l md:pl-6 border-dashed border-emerald-500/20">
                        {/* Section I: Risk Analysis grading view output */}
                        <div className="bg-background p-4 border rounded-xl shadow-sm space-y-2">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />{" "}
                            Section I: Risk Matrix Analysis
                          </span>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 bg-muted rounded border">
                              <span className="text-[10px] block font-medium text-muted-foreground">
                                Severity
                              </span>
                              <strong className="text-base text-foreground">
                                {managementReport.riskSeverity}
                              </strong>
                            </div>
                            <div className="p-2 bg-muted rounded border">
                              <span className="text-[10px] block font-medium text-muted-foreground">
                                Likelihood
                              </span>
                              <strong className="text-base text-foreground">
                                {managementReport.riskLikelihood}
                              </strong>
                            </div>
                            <div className="p-2 bg-emerald-600 text-white rounded border border-emerald-700">
                              <span className="text-[10px] block font-medium text-emerald-200">
                                Rating
                              </span>
                              <strong className="text-base">
                                {managementReport.riskRating}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Section J: Occupational Health evaluation data view */}
                        <div className="bg-background p-4 border rounded-xl shadow-sm space-y-2">
                          <span className="text-[11px] font-bold uppercase text-muted-foreground block">
                            Section J: OHS Staff Evaluation
                          </span>
                          <div className="text-xs space-y-1.5">
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">
                                Absence &gt; 3 Days:
                              </span>
                              <span className="font-semibold">
                                {managementReport.ohsAbsenceOver3Days
                                  ? "YES"
                                  : "NO"}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">
                                Act of Violence/Danger:
                              </span>
                              <span className="font-semibold">
                                {managementReport.ohsActOfViolenceOrDanger
                                  ? "YES"
                                  : "NO"}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-muted-foreground">
                                Hospitalisation &gt; 24 Hours:
                              </span>
                              <span className="font-semibold">
                                {managementReport.ohsHospitalisationOver24Hours
                                  ? "YES"
                                  : "NO"}
                              </span>
                            </p>
                            {managementReport.ohsStaffName && (
                              <div className="pt-1.5 border-t mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
                                <p>
                                  <strong>Staff Impacted:</strong>{" "}
                                  {managementReport.ohsStaffName} (
                                  {managementReport.ohsStaffDob})
                                </p>
                                <p>
                                  <strong>Home Address:</strong>{" "}
                                  {managementReport.ohsStaffAddress}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Administrative Authentication signature lock details */}
                        <div className="bg-muted/40 p-4 border rounded-xl text-xs space-y-1.5">
                          <p>
                            <strong>Manager in Charge:</strong>{" "}
                            {managementReport.managerName}
                          </p>
                          <p className="capitalize">
                            <strong>Designation:</strong>{" "}
                            {managementReport.managerDesignation}
                          </p>
                          <p>
                            <strong>Execution Sign Date:</strong>{" "}
                            {managementReport.managerDate}
                          </p>
                          <div className="pt-2 border-t flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                            <ShieldCheck className="h-4 w-4" /> Signature
                            Attested Electronically
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : isAddingManagement ? (
                    /* FORM CREATE MODE: Inline interactive insertion fields layout mapping */
                    <form
                      onSubmit={handleManagementSubmit}
                      className="bg-muted/30 p-6 rounded-xl border space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="impactOnService"
                          >
                            What was the impact on the individual/service? *
                          </label>
                          <textarea
                            id="impactOnService"
                            required
                            value={mgmtForm.impactOnService}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                impactOnService: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none h-20 resize-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="contributoryFactors"
                          >
                            Contributory Factors *
                          </label>
                          <textarea
                            id="contributoryFactors"
                            required
                            value={mgmtForm.contributoryFactors}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                contributoryFactors: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none h-20 resize-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="actionsTakenOutcomes"
                          >
                            Action Taken and Outcomes *
                          </label>
                          <textarea
                            id="actionsTakenOutcomes"
                            required
                            value={mgmtForm.actionsTakenOutcomes}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                actionsTakenOutcomes: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none h-20 resize-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="recommendations"
                          >
                            Recommendations *
                          </label>
                          <textarea
                            id="recommendations"
                            required
                            value={mgmtForm.recommendations}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                recommendations: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none h-20 resize-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label
                          className="text-xs font-bold text-foreground uppercase"
                          htmlFor="lessonsLearned"
                        >
                          Lessons Learned *
                        </label>
                        <textarea
                          id="lessonsLearned"
                          required
                          value={mgmtForm.lessonsLearned}
                          onChange={(e) =>
                            setMgmtForm({
                              ...mgmtForm,
                              lessonsLearned: e.target.value,
                            })
                          }
                          className="w-full text-sm bg-background border rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500/30 outline-none h-20"
                        />
                      </div>

                      {/* Stakeholder Info Circle Selections */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-foreground uppercase block">
                          Who was informed?
                        </span>
                        <div className="flex flex-wrap gap-4 bg-background p-3 rounded-lg border text-xs">
                          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mgmtForm.informedPatient}
                              onChange={(e) =>
                                setMgmtForm({
                                  ...mgmtForm,
                                  informedPatient: e.target.checked,
                                })
                              }
                              className="rounded border-muted text-emerald-600 focus:ring-emerald-500/40"
                            />
                            Patient
                          </label>
                          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mgmtForm.informedRelative}
                              onChange={(e) =>
                                setMgmtForm({
                                  ...mgmtForm,
                                  informedRelative: e.target.checked,
                                })
                              }
                              className="rounded border-muted text-emerald-600 focus:ring-emerald-500/40"
                            />
                            Relative
                          </label>
                          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mgmtForm.informedSeniorManager}
                              onChange={(e) =>
                                setMgmtForm({
                                  ...mgmtForm,
                                  informedSeniorManager: e.target.checked,
                                })
                              }
                              className="rounded border-muted text-emerald-600 focus:ring-emerald-500/40"
                            />
                            Senior Manager
                          </label>
                          <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={mgmtForm.informedPharmacist}
                              onChange={(e) =>
                                setMgmtForm({
                                  ...mgmtForm,
                                  informedPharmacist: e.target.checked,
                                })
                              }
                              className="rounded border-muted text-emerald-600 focus:ring-emerald-500/40"
                            />
                            Pharmacist
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="policeIncidentNumber"
                          >
                            Police Incident Number (Optional)
                          </label>
                          <input
                            type="text"
                            id="policeIncidentNumber"
                            value={mgmtForm.policeIncidentNumber}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                policeIncidentNumber: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label
                            className="text-xs font-bold text-foreground uppercase"
                            htmlFor="informedOther"
                          >
                            Other Persons Informed (Optional)
                          </label>
                          <input
                            type="text"
                            id="informedOther"
                            value={mgmtForm.informedOther}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedOther: e.target.value,
                              })
                            }
                            className="w-full text-sm bg-background border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500/30 outline-none"
                          />
                        </div>
                      </div>

                      {/* Section I & J Row Complex */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {/* Section I: Interactive Risk Calculations */}
                        <div className="bg-background border p-4 rounded-xl space-y-3 shadow-sm">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />{" "}
                            Section I: Risk Analysis
                          </span>
                          <div className="space-y-2 text-xs">
                            <div>
                              <label
                                className="block text-muted-foreground mb-1 font-medium"
                                htmlFor="riskSeverity"
                              >
                                Severity Level Grade (1-5)
                              </label>
                              <select
                                id="riskSeverity"
                                value={mgmtForm.riskSeverity}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    riskSeverity: parseInt(e.target.value),
                                  })
                                }
                                className="w-full bg-muted border p-1.5 rounded outline-none"
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                className="block text-muted-foreground mb-1 font-medium"
                                htmlFor="riskLikelihood"
                              >
                                Likelihood Rating (1-5)
                              </label>
                              <select
                                id="riskLikelihood"
                                value={mgmtForm.riskLikelihood}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    riskLikelihood: parseInt(e.target.value),
                                  })
                                }
                                className="w-full bg-muted border p-1.5 rounded outline-none"
                              >
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <option key={n} value={n}>
                                    {n}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-center rounded flex flex-col justify-center">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                                Calculated Risk Score
                              </span>
                              <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                                {mgmtForm.riskRating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Section J: Occupational Health Inputs */}
                        <div className="bg-background border p-4 rounded-xl space-y-3 shadow-sm md:col-span-2">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                            Section J: OHS Staff Incidents Evaluation Compliance
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                            <label className="flex items-center gap-1.5 bg-muted/50 p-2 border rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mgmtForm.ohsAbsenceOver3Days}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsAbsenceOver3Days: e.target.checked,
                                  })
                                }
                                className="rounded text-emerald-600"
                              />
                              <span>Absence &gt; 3 Days likely?</span>
                            </label>
                            <label className="flex items-center gap-1.5 bg-muted/50 p-2 border rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mgmtForm.ohsActOfViolenceOrDanger}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsActOfViolenceOrDanger: e.target.checked,
                                  })
                                }
                                className="rounded text-emerald-600"
                              />
                              <span>Act of violence/danger?</span>
                            </label>
                            <label className="flex items-center gap-1.5 bg-muted/50 p-2 border rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={mgmtForm.ohsHospitalisationOver24Hours}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsHospitalisationOver24Hours:
                                      e.target.checked,
                                  })
                                }
                                className="rounded text-emerald-600"
                              />
                              <span>Hospitalisation &gt; 24h?</span>
                            </label>
                          </div>

                          {/* Render specific OHS tracking fields if checked or if principal is staff */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label
                                className="block text-muted-foreground mb-0.5"
                                htmlFor="ohsStaffName"
                              >
                                Injured Staff Name
                              </label>
                              <input
                                type="text"
                                id="ohsStaffName"
                                value={mgmtForm.ohsStaffName}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsStaffName: e.target.value,
                                  })
                                }
                                className="w-full bg-muted/50 border p-1 rounded"
                              />
                            </div>
                            <div>
                              <label
                                className="block text-muted-foreground mb-0.5"
                                htmlFor="ohsStaffDob"
                              >
                                Staff Date of Birth
                              </label>
                              <input
                                type="text"
                                id="ohsStaffDob"
                                value={mgmtForm.ohsStaffDob}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsStaffDob: e.target.value,
                                  })
                                }
                                className="w-full bg-muted/50 border p-1 rounded"
                                placeholder="DD/MM/YYYY"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label
                                className="block text-muted-foreground mb-0.5"
                                htmlFor="ohsStaffAddress"
                              >
                                Staff Home Address (Required for OHS submission)
                              </label>
                              <input
                                type="text"
                                id="ohsStaffAddress"
                                value={mgmtForm.ohsStaffAddress}
                                onChange={(e) =>
                                  setMgmtForm({
                                    ...mgmtForm,
                                    ohsStaffAddress: e.target.value,
                                  })
                                }
                                className="w-full bg-muted/50 border p-1 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Manager Sign-Off Section Form block */}
                      <div className="bg-background border p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs shadow-sm items-end">
                        <div>
                          <label
                            className="block text-muted-foreground mb-1 font-bold uppercase"
                            htmlFor="managerName"
                          >
                            Manager In Charge Name *
                          </label>
                          <input
                            type="text"
                            id="managerName"
                            required
                            value={mgmtForm.managerName}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                managerName: e.target.value,
                              })
                            }
                            className="w-full bg-muted/30 border p-2 rounded-md"
                          />
                        </div>
                        <div>
                          <label
                            className="block text-muted-foreground mb-1 font-bold uppercase"
                            htmlFor="managerDesignation"
                          >
                            Manager Designation *
                          </label>
                          <input
                            type="text"
                            id="managerDesignation"
                            required
                            value={mgmtForm.managerDesignation}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                managerDesignation: e.target.value,
                              })
                            }
                            className="w-full bg-muted/30 border p-2 rounded-md"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 bg-emerald-50/50 p-2.5 border border-emerald-500/20 rounded-md font-bold text-emerald-800 uppercase tracking-wider cursor-pointer select-none">
                            <input
                              type="checkbox"
                              required
                              checked={mgmtForm.managerSignature}
                              onChange={(e) =>
                                setMgmtForm({
                                  ...mgmtForm,
                                  managerSignature: e.target.checked,
                                })
                              }
                              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                            />
                            Attest Manager Signature *
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddingManagement(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={submittingManagement}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
                        >
                          {submittingManagement ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          ) : (
                            "Save Report Fields"
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    /* EMPTY STATE MODE: If no report exists yet */
                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10 flex flex-col items-center justify-center p-4">
                      <p className="text-sm text-muted-foreground mb-3 font-medium">
                        No administrative evaluation or action plan has been
                        attached to this clinical event file yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingManagement(true)}
                        className="border-emerald-500/30 text-emerald-700 hover:bg-emerald-50/50 gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Initialize Management
                        Review
                      </Button>
                    </div>
                  )}
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
