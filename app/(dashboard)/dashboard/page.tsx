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
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  ShieldCheck,
  Activity,
  RefreshCw,
  Plus,
  Eye,
  Info,
  Users,
  Wrench,
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
  witnessPhone?: string;
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
  ohsHospitalizationOver24Hours: boolean;
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

  const [user, setUser] = useState<{ role?: string }>({});
  const [managementReport, setManagementReport] =
    useState<IncidentManagement | null>(null);
  const [loadingManagement, setLoadingManagement] = useState<boolean>(false);
  const [isAddingManagement, setIsAddingManagement] = useState<boolean>(false);
  const [submittingManagement, setSubmittingManagement] =
    useState<boolean>(false);

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
    ohsHospitalizationOver24Hours: false,
    ohsStaffName: "",
    ohsStaffDob: "",
    ohsStaffAddress: "",
    managerName: "",
    managerSignature: false,
    managerDesignation: "",
    managerDate: new Date().toISOString().split("T")[0],
  });

  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({});
      }
    }
  }, []);

  const isAdmin = user.role === "admin" || user.role === "superadmin";

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
        setManagementReport(null);
      } else {
        throw new Error(
          "Failed to pull administrative management report fields.",
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

  useEffect(() => {
    if (selectedIncident) {
      fetchManagementReport(selectedIncident.id);

      if (isAdmin) {
        setMgmtForm({
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
          ohsHospitalizationOver24Hours: false,
          ohsStaffName:
            selectedIncident.principalType === "staff"
              ? selectedIncident.principalName
              : "",
          ohsStaffDob:
            selectedIncident.principalType === "staff"
              ? selectedIncident.principalDob
              : "",
          ohsStaffAddress: "",
          managerName: "",
          managerSignature: false,
          managerDesignation: "",
          managerDate: new Date().toISOString().split("T")[0],
          incidentId: selectedIncident.id,
        });
      }
    } else {
      setManagementReport(null);
      setIsAddingManagement(false);
    }
  }, [selectedIncident, isAdmin]);

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
        throw new Error(
          "Failed to update incident pipeline registry status token.",
        );
      }

      const updatedIncident: IncidentReport = await response.json();
      setSelectedIncident(updatedIncident);
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === updatedIncident.id ? updatedIncident : inc,
        ),
      );
      toast.success(
        `Status shifted to ${formatStatusText(newStatus)} successfully.`,
      );
    } catch (error: any) {
      toast.error(
        error.message || "Error modifying system configuration status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleManagementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !isAdmin) return;

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
        throw new Error(
          "Failed to process management metadata mapping variables.",
        );
      }

      const freshReport = await response.json();
      setManagementReport(freshReport);
      setIsAddingManagement(false);
      toast.success("Documentation saved successfully to dossier.");
    } catch (error: any) {
      toast.error(error.message || "Database execution error occurred.");
    } finally {
      setSubmittingManagement(false);
    }
  };

  const getSeverityBadgeClass = (severity: SeverityLevel) => {
    switch (severity) {
      case "critical":
        return "bg-red-50 text-red-700 border border-red-200/60";
      case "major":
        return "bg-orange-50 text-orange-700 border border-orange-200/60";
      case "minor":
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
      case "near miss":
        return "bg-zinc-50 text-zinc-600 border border-zinc-200/60";
      default:
        return "bg-zinc-50 text-zinc-600";
    }
  };

  const getStatusBadgeClass = (status: IncidentStatus) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
      case "inprogress":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      default:
        return "bg-rose-50 text-rose-700 border border-rose-200/60";
    }
  };

  const formatStatusText = (status: IncidentStatus) => {
    if (status === "inprogress") return "In Progress";
    if (status === "resolved") return "Resolved";
    return "Unresolved";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="border-muted/40 shadow-sm rounded-xl">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Hospital Incident Logs
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Internal directory of logged safety events, risk evaluations, and
              institutional metrics.
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0 sm:px-6">
          <div className="space-y-4">
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-semibold text-sm text-foreground py-3 pl-4">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-foreground py-3">
                      Reporter
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-foreground py-3">
                      Incident Ward / Dept
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-foreground py-3">
                      Cause Group
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-foreground py-3">
                      Severity Matrix
                    </TableHead>
                    <TableHead className="font-semibold text-sm text-foreground py-3">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-semibold text-sm text-foreground py-3 pr-4">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton rows placeholder block
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx} className="animate-pulse">
                        <TableCell className="py-4 pl-4">
                          <div className="h-4 bg-muted rounded w-20" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-4 bg-muted rounded w-28" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-4 bg-muted rounded w-24" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-4 bg-muted rounded w-36" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 bg-muted rounded w-16" />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="h-5 bg-muted rounded w-20" />
                        </TableCell>
                        <TableCell className="py-4 pr-4 text-right">
                          <div className="h-7 bg-muted rounded w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : incidents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-16 text-sm text-muted-foreground"
                      >
                        No reported incident files found matching your profile.
                      </TableCell>
                    </TableRow>
                  ) : (
                    incidents.map((incident) => (
                      <TableRow
                        key={incident.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="text-sm whitespace-nowrap py-3 pl-4 text-muted-foreground">
                          {incident.dateOfIncident}
                        </TableCell>
                        <TableCell className="text-sm font-medium whitespace-nowrap py-3">
                          {incident.reporterName}
                        </TableCell>
                        <TableCell className="text-sm py-3 text-muted-foreground">
                          {incident.incidentWardDept}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-sm truncate py-3 font-medium">
                          {incident.causeGroup}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityBadgeClass(incident.severityLevel)}`}
                          >
                            {incident.severityLevel}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(incident.incidentStatus)}`}
                          >
                            {formatStatusText(incident.incidentStatus)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3 pr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                            className="text-xs h-8 px-3 flex items-center gap-1.5 ml-auto"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && pagination && pagination.total_pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-1">
                <div className="text-sm text-muted-foreground">
                  Total: {pagination.total_items} institutional safety records
                  compiled
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedIncident}
        onOpenChange={(open) => !open && setSelectedIncident(null)}
      >
        <DialogContent className="!max-w-7xl !w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-xl border shadow-2xl bg-background">
          {selectedIncident && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <DialogHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      Hospital Incident File #{selectedIncident.id}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                      Comprehensive clinical statements, site diagnostics, and
                      administrative report alignments.
                    </DialogDescription>
                  </div>
                  {isAdmin ? (
                    <div className="flex flex-wrap items-center gap-3 shrink-0 bg-muted/50 p-2 rounded-lg border text-sm">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="status-select"
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Manage Status:
                        </label>
                        <select
                          id="status-select"
                          value={selectedIncident.incidentStatus}
                          disabled={updatingStatus}
                          onChange={(e) =>
                            handleStatusChange(e.target.value as IncidentStatus)
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded-md border focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 ${getStatusBadgeClass(selectedIncident.incidentStatus)}`}
                        >
                          {VALID_STATUSES.map((st) => (
                            <option
                              key={st.value}
                              value={st.value}
                              className="bg-background text-foreground font-medium"
                            >
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="h-4 w-px bg-muted hidden sm:block" />
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getSeverityBadgeClass(selectedIncident.severityLevel)}`}
                      >
                        {selectedIncident.severityLevel} severity
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getSeverityBadgeClass(selectedIncident.severityLevel)}`}
                    >
                      {selectedIncident.severityLevel} severity
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 bg-muted/20 p-5 rounded-xl border space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" /> Reporter
                      Details
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground font-medium">
                          Reporter Name:
                        </strong>{" "}
                        {selectedIncident.reporterName}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Designation:
                        </strong>{" "}
                        {selectedIncident.reporterDesignation}
                      </p>
                      <p className="break-all">
                        <strong className="text-foreground font-medium">
                          Contact Info:
                        </strong>{" "}
                        {selectedIncident.reporterInfo}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Date Filed:
                        </strong>{" "}
                        {selectedIncident.date}
                      </p>
                      {selectedIncident.signature && (
                        <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="h-4 w-4" /> Signature
                          acknowledged
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2 mb-3 flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-600" /> Incident
                      Context
                    </h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground/70" />
                        <span>
                          <strong className="text-foreground font-medium">
                            Date:
                          </strong>{" "}
                          {selectedIncident.dateOfIncident}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground/70" />
                        <span>
                          <strong className="text-foreground font-medium">
                            Time:
                          </strong>{" "}
                          {selectedIncident.timeOfIncident || "Unspecified"}
                        </span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground/70 mt-0.5 shrink-0" />
                        <span>
                          <strong className="text-foreground font-medium">
                            Location:
                          </strong>{" "}
                          {selectedIncident.locationOfIncident} <br />
                          <span className="text-xs text-muted-foreground">
                            Ward / Dept: {selectedIncident.incidentWardDept}
                          </span>
                        </span>
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Near Miss:
                        </strong>{" "}
                        {selectedIncident.isNearMiss ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-emerald-600" /> Principal
                      Person Involved ({selectedIncident.principalType})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground font-medium">
                          Name:
                        </strong>{" "}
                        {selectedIncident.principalName}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Gender:
                        </strong>{" "}
                        {selectedIncident.principalGender}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Date of Birth:
                        </strong>{" "}
                        {selectedIncident.principalDob}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Involvement Context:
                        </strong>{" "}
                        {selectedIncident.peopleInvolved}
                      </p>
                    </div>

                    {selectedIncident.principalType === "patient" && (
                      <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-amber-50/20 p-3 rounded-lg border border-amber-100">
                        <p>
                          <strong className="font-medium text-foreground">
                            Patient ID:
                          </strong>{" "}
                          {selectedIncident.patientId || "N/A"}
                        </p>
                        <p>
                          <strong className="font-medium text-foreground">
                            Patient Ward / Dept:
                          </strong>{" "}
                          {selectedIncident.patientWardDept || "N/A"}
                        </p>
                      </div>
                    )}

                    {selectedIncident.principalType === "staff" && (
                      <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-blue-50/20 p-3 rounded-lg border border-blue-100">
                        <p>
                          <strong className="font-medium text-foreground">
                            Job Title:
                          </strong>{" "}
                          {selectedIncident.staffJobTitle || "N/A"}
                        </p>
                        <p>
                          <strong className="font-medium text-foreground">
                            Phone Number:
                          </strong>{" "}
                          {selectedIncident.staffPhone || "N/A"}
                        </p>
                        <p>
                          <strong className="font-medium text-foreground">
                            Place of Work:
                          </strong>{" "}
                          {selectedIncident.staffPlaceOfWork || "N/A"}
                        </p>
                        <p>
                          <strong className="font-medium text-foreground">
                            Site Location:
                          </strong>{" "}
                          {selectedIncident.staffSite || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>

                  {(selectedIncident.witnesses ||
                    selectedIncident.witnessType) && (
                    <div className="bg-background border p-5 rounded-xl shadow-sm space-y-3">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-emerald-600" /> Witness
                        Details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground font-medium">
                            Witness Name(s):
                          </strong>{" "}
                          {selectedIncident.witnesses || "None"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Type:
                          </strong>{" "}
                          {selectedIncident.witnessType || "N/A"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Ward / Dept:
                          </strong>{" "}
                          {selectedIncident.witnessWardDept || "N/A"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Job Title:
                          </strong>{" "}
                          {selectedIncident.witnessJobTitle || "N/A"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Phone:
                          </strong>{" "}
                          {selectedIncident.witnessPhone || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-emerald-600" /> Description
                      & Treatment
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground font-medium">
                          Cause Group:
                        </strong>{" "}
                        {selectedIncident.causeGroup}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Prescribing Doctor:
                        </strong>{" "}
                        {selectedIncident.prescribingDoctor || "None"}
                      </p>
                    </div>
                    <div className="text-sm space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Root Causes
                      </span>
                      <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedIncident.causes}
                      </div>
                    </div>
                    <div className="text-sm space-y-1.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Treatment Received
                      </span>
                      <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {selectedIncident.treatmentReceived ||
                          "No treatment documented."}
                      </div>
                    </div>
                  </div>

                  {selectedIncident.equipmentInvolved && (
                    <div className="bg-background border p-5 rounded-xl shadow-sm space-y-3">
                      <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                        <Wrench className="h-4 w-4 text-emerald-600" />{" "}
                        Equipment & Medical Devices
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground font-medium">
                            Equipment Name:
                          </strong>{" "}
                          {selectedIncident.equipmentInvolved}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Model:
                          </strong>{" "}
                          {selectedIncident.equipmentModel || "N/A"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Equipment Number:
                          </strong>{" "}
                          {selectedIncident.equipmentNumber || "N/A"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Medical Device Classified:
                          </strong>{" "}
                          {selectedIncident.isMedicalDevice || "No"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Sent for Repair:
                          </strong>{" "}
                          {selectedIncident.equipmentSentForRepair
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Withdrawn from Use:
                          </strong>{" "}
                          {selectedIncident.equipmentWithdrawn ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong className="text-foreground font-medium">
                            Retained for Investigation:
                          </strong>{" "}
                          {selectedIncident.equipmentRetained ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-base font-semibold tracking-tight mb-4 flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />{" "}
                  Administrative Evaluation Dossier
                </h2>

                {loadingManagement ? (
                  <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />{" "}
                    Loading administrative details...
                  </div>
                ) : managementReport ? (
                  <div className="bg-emerald-50/10 p-5 rounded-xl border border-emerald-200/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-xs font-semibold text-emerald-800 tracking-wider uppercase border-b pb-1">
                        Management Overview
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Impact on Service
                          </span>
                          <p className="bg-background p-2.5 rounded-lg border mt-1 text-xs text-foreground">
                            {managementReport.impactOnService}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Contributory Factors
                          </span>
                          <p className="bg-background p-2.5 rounded-lg border mt-1 text-xs text-foreground">
                            {managementReport.contributoryFactors}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Actions / Outcomes
                          </span>
                          <p className="bg-background p-2.5 rounded-lg border mt-1 text-xs text-foreground">
                            {managementReport.actionsTakenOutcomes}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Recommendations
                          </span>
                          <p className="bg-background p-2.5 rounded-lg border mt-1 text-xs text-foreground">
                            {managementReport.recommendations}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Lessons Learned
                          </span>
                          <p className="bg-background p-2.5 rounded-lg border mt-1 text-xs text-foreground">
                            {managementReport.lessonsLearned}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t space-y-2">
                        <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase block">
                          Communication Metrics
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <p>
                            <strong className="text-foreground font-medium">
                              Patient Informed:
                            </strong>{" "}
                            {managementReport.informedPatient ? "Yes" : "No"}
                          </p>
                          <p>
                            <strong className="text-foreground font-medium">
                              Relative Informed:
                            </strong>{" "}
                            {managementReport.informedRelative ? "Yes" : "No"}
                          </p>
                          <p>
                            <strong className="text-foreground font-medium">
                              Senior Manager:
                            </strong>{" "}
                            {managementReport.informedSeniorManager
                              ? "Yes"
                              : "No"}
                          </p>
                          <p>
                            <strong className="text-foreground font-medium">
                              Pharmacist Informed:
                            </strong>{" "}
                            {managementReport.informedPharmacist ? "Yes" : "No"}
                          </p>
                        </div>
                        {(managementReport.policeIncidentNumber ||
                          managementReport.informedOther) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground pt-1">
                            {managementReport.policeIncidentNumber && (
                              <p>
                                <strong className="text-foreground font-medium">
                                  Police Incident Number:
                                </strong>{" "}
                                {managementReport.policeIncidentNumber}
                              </p>
                            )}
                            {managementReport.informedOther && (
                              <p>
                                <strong className="text-foreground font-medium">
                                  Other Party Informed:
                                </strong>{" "}
                                {managementReport.informedOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {(managementReport.ohsStaffName ||
                        managementReport.ohsAbsenceOver3Days) && (
                        <div className="pt-3 border-t space-y-2 bg-muted/30 p-3 rounded-lg border">
                          <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase block">
                            Occupational Health & Safety Matrix
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <p>
                              <strong className="text-foreground font-medium">
                                Absence &gt; 3 Days:
                              </strong>{" "}
                              {managementReport.ohsAbsenceOver3Days
                                ? "Yes"
                                : "No"}
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">
                                Violence / Danger:
                              </strong>{" "}
                              {managementReport.ohsActOfViolenceOrDanger
                                ? "Yes"
                                : "No"}
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">
                                Hospitalized &gt; 24h:
                              </strong>{" "}
                              {managementReport.ohsHospitalizationOver24Hours
                                ? "Yes"
                                : "No"}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground pt-1">
                            <p>
                              <strong className="text-foreground font-medium">
                                Target Staff Name:
                              </strong>{" "}
                              {managementReport.ohsStaffName || "N/A"}
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">
                                Staff DOB:
                              </strong>{" "}
                              {managementReport.ohsStaffDob || "N/A"}
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">
                                Home Address:
                              </strong>{" "}
                              {managementReport.ohsStaffAddress || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 border-l pl-0 md:pl-6 border-emerald-100 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="bg-background p-3 rounded-lg border text-sm text-muted-foreground space-y-1.5">
                          <p>
                            <strong className="text-foreground font-medium">
                              Risk Severity Score:
                            </strong>{" "}
                            {managementReport.riskSeverity} / 5
                          </p>
                          <p>
                            <strong className="text-foreground font-medium">
                              Risk Likelihood Score:
                            </strong>{" "}
                            {managementReport.riskLikelihood} / 5
                          </p>
                          <div className="mt-2 pt-2 border-t font-semibold text-rose-600">
                            Combined Risk Product Rating:{" "}
                            {managementReport.riskRating}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm bg-emerald-800 text-white p-4 rounded-xl space-y-2 shadow-sm">
                        <span className="text-xs font-semibold tracking-wider uppercase block border-b border-white/20 pb-1">
                          Sign-Off Status
                        </span>
                        <p className="text-white/90">
                          <strong>Manager Name:</strong>{" "}
                          {managementReport.managerName}
                        </p>
                        <p className="text-white/90">
                          <strong>Designation:</strong>{" "}
                          {managementReport.managerDesignation}
                        </p>
                        <p className="text-white/90">
                          <strong>Authorization Date:</strong>{" "}
                          {managementReport.managerDate}
                        </p>
                        <span className="text-[10px] font-semibold bg-emerald-950 px-2 py-0.5 rounded text-emerald-300 inline-block mt-1">
                          ✓ Verified Signature
                        </span>
                      </div>
                    </div>
                  </div>
                ) : isAdmin && !isAddingManagement ? (
                  <div className="text-center py-8 border border-dashed rounded-xl bg-muted/10">
                    <p className="text-sm text-muted-foreground mb-3">
                      No administrative management report has been generated for
                      this record.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsAddingManagement(true)}
                      className="text-xs h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Management Report
                    </Button>
                  </div>
                ) : isAdmin && isAddingManagement ? (
                  <form
                    onSubmit={handleManagementSubmit}
                    className="bg-muted/40 p-5 rounded-xl border space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                          Operational Evaluation Metrics
                        </h3>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Impact on Service *
                          </label>
                          <textarea
                            required
                            value={mgmtForm.impactOnService}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                impactOnService: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-16 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Contributory Factors *
                          </label>
                          <textarea
                            required
                            value={mgmtForm.contributoryFactors}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                contributoryFactors: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-16 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Lessons Learned *
                          </label>
                          <textarea
                            required
                            value={mgmtForm.lessonsLearned}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                lessonsLearned: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-16 focus:ring-1 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                          Remedial Action Strategies
                        </h3>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Actions / Outcomes *
                          </label>
                          <textarea
                            required
                            value={mgmtForm.actionsTakenOutcomes}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                actionsTakenOutcomes: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-16 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Recommendations *
                          </label>
                          <textarea
                            required
                            value={mgmtForm.recommendations}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                recommendations: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-16 focus:ring-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                        Stakeholder Notifications Log
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedPatient}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedPatient: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Patient Informed
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedRelative}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedRelative: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Relative Informed
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedSeniorManager}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedSeniorManager: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Senior Manager Notified
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedPharmacist}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedPharmacist: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Pharmacist Informed
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Police Incident Number
                          </label>
                          <input
                            type="text"
                            value={mgmtForm.policeIncidentNumber}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                policeIncidentNumber: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Other Informed Parties
                          </label>
                          <input
                            type="text"
                            value={mgmtForm.informedOther}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedOther: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                        Risk Factor Assessment Rating
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Severity Rank (1-5) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="5"
                            value={mgmtForm.riskSeverity}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                riskSeverity: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Likelihood Rank (1-5) *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            max="5"
                            value={mgmtForm.riskLikelihood}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                riskLikelihood: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Calculated Rating Product
                          </label>
                          <input
                            type="number"
                            readOnly
                            value={mgmtForm.riskRating}
                            className="w-full text-xs bg-muted border rounded-md p-2 h-9 font-semibold text-rose-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                        Occupational Health & Safety Regulatory Compliance
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsAbsenceOver3Days}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsAbsenceOver3Days: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Staff Absence Over 3 Days
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsActOfViolenceOrDanger}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsActOfViolenceOrDanger: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Act of Violence or Peril Danger
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsHospitalizationOver24Hours}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsHospitalizationOver24Hours: e.target.checked,
                              })
                            }
                            className="rounded accent-emerald-600"
                          />
                          Hospitalization &gt; 24 Hours
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            OHS Impacted Staff Name
                          </label>
                          <input
                            type="text"
                            value={mgmtForm.ohsStaffName}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsStaffName: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Staff Date of Birth
                          </label>
                          <input
                            type="date"
                            value={mgmtForm.ohsStaffDob}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsStaffDob: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Staff Home Address
                          </label>
                          <input
                            type="text"
                            value={mgmtForm.ohsStaffAddress}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsStaffAddress: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b pb-1">
                        Executive Authorization Sign-Off
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Manager Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={mgmtForm.managerName}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                managerName: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Corporate Designation *
                          </label>
                          <input
                            type="text"
                            required
                            value={mgmtForm.managerDesignation}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                managerDesignation: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">
                            Authorization Date *
                          </label>
                          <input
                            type="date"
                            required
                            value={mgmtForm.managerDate}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                managerDate: e.target.value,
                              })
                            }
                            className="w-full text-xs bg-background border rounded-md p-2 h-9 focus:ring-1 focus:outline-none"
                          />
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center gap-2 cursor-pointer text-xs pb-2">
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
                              className="rounded accent-emerald-600"
                            />
                            <span className="font-medium text-rose-600">
                              Acknowledge Legal Signature Binding *
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddingManagement(false)}
                        className="text-xs h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submittingManagement}
                        className="bg-emerald-600 text-white font-medium text-xs h-9"
                      >
                        Save Management Log
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No management report has been registered for this
                      incident.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
