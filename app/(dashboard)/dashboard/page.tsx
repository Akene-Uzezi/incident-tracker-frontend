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
      // Both admins and general users check if a management report exists
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
        return "bg-red-100 text-red-800 border border-red-200";
      case "major":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "minor":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "near miss":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status: IncidentStatus) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "inprogress":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-rose-100 text-rose-800 border border-rose-200";
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
            <CardTitle className="text-xl font-black uppercase tracking-tight text-foreground">
              Hospital Incident Core Registry Logs
            </CardTitle>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
              Internal directory of logged safety events, risk evaluations, and
              institutional metrics
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0 sm:px-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider animate-pulse">
                Synchronizing data matrix parameters...
              </p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-16 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              No reported incident files found matching your profile.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3 pl-4">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3">
                        Reporter
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3">
                        Incident Ward/Dept
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3">
                        Cause Group
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3">
                        Severity Matrix
                      </TableHead>
                      <TableHead className="font-bold text-xs uppercase text-foreground py-3">
                        Status
                      </TableHead>
                      <TableHead className="text-right font-bold text-xs uppercase text-foreground py-3 pr-4">
                        Action Matrix
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((incident) => (
                      <TableRow
                        key={incident.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs whitespace-nowrap py-3 pl-4">
                          {incident.dateOfIncident}
                        </TableCell>
                        <TableCell className="text-xs font-medium whitespace-nowrap py-3">
                          {incident.reporterName}
                        </TableCell>
                        <TableCell className="text-xs font-semibold uppercase py-3">
                          {incident.incidentWardDept}
                        </TableCell>
                        <TableCell className="max-w-[200px] text-xs font-medium truncate py-3">
                          {incident.causeGroup}
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(incident.severityLevel)}`}
                          >
                            {incident.severityLevel}
                          </span>
                        </TableCell>
                        <TableCell className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(incident.incidentStatus)}`}
                          >
                            {formatStatusText(incident.incidentStatus)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-3 pr-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedIncident(incident)}
                            className="font-bold text-xs uppercase h-7 px-3 flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" /> Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-1">
                  <div className="text-[11px] font-bold uppercase text-muted-foreground">
                    Total: {pagination.total_items} institutional safety records
                    compiled
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-7 w-7"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs font-bold px-2">
                      Page {pagination.current_page} of {pagination.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.total_pages}
                      className="h-7 w-7"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
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
        <DialogContent className="!max-w-7xl !w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-xl border shadow-2xl bg-background">
          {selectedIncident && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <DialogHeader className="border-b pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      Hospital Incident dossier file #{selectedIncident.id}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                      Comprehensive clinical statements, site diagnostics, and
                      administrative report alignment matrix.
                    </DialogDescription>
                  </div>
                  {isAdmin ? (
                    <div className="flex flex-wrap items-center gap-3 shrink-0 bg-muted/50 p-2 rounded-lg border text-xs">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="status-select"
                          className="text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                        >
                          MANAGE REGISTRY STATUS:
                        </label>
                        <select
                          id="status-select"
                          value={selectedIncident.incidentStatus}
                          disabled={updatingStatus}
                          onChange={(e) =>
                            handleStatusChange(e.target.value as IncidentStatus)
                          }
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 ${getStatusBadgeClass(selectedIncident.incidentStatus)}`}
                        >
                          {VALID_STATUSES.map((st) => (
                            <option
                              key={st.value}
                              value={st.value}
                              className="bg-background text-foreground font-medium uppercase tracking-normal"
                            >
                              {st.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="h-4 w-px bg-muted hidden sm:block" />
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(selectedIncident.severityLevel)}`}
                      >
                        {selectedIncident.severityLevel} Level
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(selectedIncident.severityLevel)}`}
                    >
                      {selectedIncident.severityLevel} Level
                    </span>
                  )}
                </div>
              </DialogHeader>

              {/* Complete Incident Record Visualizations Mapping to Go Struct */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 bg-muted/20 p-5 rounded-xl border space-y-5">
                  <div>
                    <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-2 mb-3 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> REPORTER DETAILS
                    </h3>
                    <div className="space-y-3 text-xs">
                      <p>
                        <strong>Reporter Name:</strong>{" "}
                        {selectedIncident.reporterName}
                      </p>
                      <p className="capitalize">
                        <strong>Designation:</strong>{" "}
                        {selectedIncident.reporterDesignation}
                      </p>
                      <p className="break-all">
                        <strong>Contact Details:</strong>{" "}
                        {selectedIncident.reporterInfo}
                      </p>
                      <p>
                        <strong>Date Filed:</strong> {selectedIncident.date}
                      </p>
                      {selectedIncident.signature && (
                        <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="h-3.5 w-3.5" /> Signature
                          Acknowledged
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-2 mb-3 flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5" /> INCIDENT CONTEXT
                    </h3>
                    <div className="space-y-3 text-xs">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <strong>Date:</strong> {selectedIncident.dateOfIncident}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <strong>Time:</strong>{" "}
                        {selectedIncident.timeOfIncident || "Unspecified"}
                      </p>
                      <p className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span>
                          <strong>Location:</strong>{" "}
                          {selectedIncident.locationOfIncident} <br />
                          <span className="text-[10px] font-bold text-muted-foreground">
                            WARD/DEPT: {selectedIncident.incidentWardDept}
                          </span>
                        </span>
                      </p>
                      <p>
                        <strong>Near Miss:</strong>{" "}
                        {selectedIncident.isNearMiss ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Principal Demographics Section */}
                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                      <User className="h-3.5 w-3.5" /> PRINCIPAL PERSON INVOLVED
                      ({selectedIncident.principalType.toUpperCase()})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <p>
                        <strong>Name:</strong> {selectedIncident.principalName}
                      </p>
                      <p>
                        <strong>Gender:</strong>{" "}
                        {selectedIncident.principalGender}
                      </p>
                      <p>
                        <strong>DOB:</strong> {selectedIncident.principalDob}
                      </p>
                      <p>
                        <strong>People Involved Context:</strong>{" "}
                        {selectedIncident.peopleInvolved}
                      </p>
                    </div>

                    {/* Conditional Patient Specific Fields */}
                    {selectedIncident.principalType === "patient" && (
                      <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-amber-50/20 p-3 rounded-lg border border-amber-100">
                        <p>
                          <strong>Patient Medical ID:</strong>{" "}
                          {selectedIncident.patientId || "N/A"}
                        </p>
                        <p>
                          <strong>Patient Ward/Dept:</strong>{" "}
                          {selectedIncident.patientWardDept || "N/A"}
                        </p>
                      </div>
                    )}

                    {/* Conditional Staff Specific Fields */}
                    {selectedIncident.principalType === "staff" && (
                      <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-blue-50/20 p-3 rounded-lg border border-blue-100">
                        <p>
                          <strong>Staff Job Title:</strong>{" "}
                          {selectedIncident.staffJobTitle || "N/A"}
                        </p>
                        <p>
                          <strong>Staff Phone:</strong>{" "}
                          {selectedIncident.staffPhone || "N/A"}
                        </p>
                        <p>
                          <strong>Place of Work:</strong>{" "}
                          {selectedIncident.staffPlaceOfWork || "N/A"}
                        </p>
                        <p>
                          <strong>Staff Site Location:</strong>{" "}
                          {selectedIncident.staffSite || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Witnesses Information Matrix Block */}
                  {(selectedIncident.witnesses ||
                    selectedIncident.witnessType) && (
                    <div className="bg-background border p-5 rounded-xl shadow-sm space-y-3">
                      <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> WITNESS LOGGED DETAILS
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <p>
                          <strong>Witness Name(s):</strong>{" "}
                          {selectedIncident.witnesses || "None Stated"}
                        </p>
                        <p>
                          <strong>Witness Profile Type:</strong>{" "}
                          {selectedIncident.witnessType || "N/A"}
                        </p>
                        <p>
                          <strong>Witness Ward/Dept:</strong>{" "}
                          {selectedIncident.witnessWardDept || "N/A"}
                        </p>
                        <p>
                          <strong>Witness Job Title:</strong>{" "}
                          {selectedIncident.witnessJobTitle || "N/A"}
                        </p>
                        <p>
                          <strong>Witness Phone:</strong>{" "}
                          {selectedIncident.witnessPhone || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Factual Diagnoses and Medical Evaluation */}
                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> FACTUAL DESCRIPTION &
                      TREATMENT
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <p>
                        <strong>Cause Group:</strong>{" "}
                        <span className="font-bold underline">
                          {selectedIncident.causeGroup}
                        </span>
                      </p>
                      <p>
                        <strong>Prescribing Doctor:</strong>{" "}
                        {selectedIncident.prescribingDoctor ||
                          "None Identified"}
                      </p>
                    </div>
                    <div className="text-xs space-y-1">
                      <strong className="text-muted-foreground uppercase text-[10px]">
                        Detailed Root Causes:
                      </strong>
                      <div className="bg-muted/40 p-3 rounded border whitespace-pre-wrap leading-relaxed">
                        {selectedIncident.causes}
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <strong className="text-muted-foreground uppercase text-[10px]">
                        Clinical Treatment Received:
                      </strong>
                      <div className="bg-muted/40 p-3 rounded border whitespace-pre-wrap leading-relaxed">
                        {selectedIncident.treatmentReceived ||
                          "No treatment documented."}
                      </div>
                    </div>
                  </div>

                  {/* Asset & Equipment Verification Node */}
                  {selectedIncident.equipmentInvolved && (
                    <div className="bg-background border p-5 rounded-xl shadow-sm space-y-3">
                      <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1 flex items-center gap-1">
                        <Wrench className="h-3.5 w-3.5" /> EQUIPMENT & MEDICAL
                        DEVICES VERIFICATION
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <p>
                          <strong>Equipment Brand/Involved:</strong>{" "}
                          {selectedIncident.equipmentInvolved}
                        </p>
                        <p>
                          <strong>Model Identifier:</strong>{" "}
                          {selectedIncident.equipmentModel || "N/A"}
                        </p>
                        <p>
                          <strong>Serial/Equipment Number:</strong>{" "}
                          {selectedIncident.equipmentNumber || "N/A"}
                        </p>
                        <p>
                          <strong>Is Classified Medical Device:</strong>{" "}
                          {selectedIncident.isMedicalDevice || "No"}
                        </p>
                        <p>
                          <strong>Sent For Repair:</strong>{" "}
                          {selectedIncident.equipmentSentForRepair
                            ? "Yes"
                            : "No"}
                        </p>
                        <p>
                          <strong>Withdrawn from Use:</strong>{" "}
                          {selectedIncident.equipmentWithdrawn ? "Yes" : "No"}
                        </p>
                        <p>
                          <strong>Retained for Investigation:</strong>{" "}
                          {selectedIncident.equipmentRetained ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Administrative Evaluation Domain Block */}
              <div className="border-t pt-6">
                <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Administrative Evaluation
                  Dossier
                </h2>

                {loadingManagement ? (
                  <div className="text-center py-6 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Querying
                    dossier...
                  </div>
                ) : managementReport ? (
                  <div className="bg-emerald-50/20 p-5 rounded-xl border border-emerald-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <h3 className="text-xs font-black uppercase text-emerald-900 border-b pb-1">
                        MANAGEMENT REPORT DETAILS
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <strong>Impact on Service:</strong>
                          <p className="bg-background p-2.5 rounded border mt-1 text-xs">
                            {managementReport.impactOnService}
                          </p>
                        </div>
                        <div>
                          <strong>Contributory Factors:</strong>
                          <p className="bg-background p-2.5 rounded border mt-1 text-xs">
                            {managementReport.contributoryFactors}
                          </p>
                        </div>
                        <div>
                          <strong>Action / Outcomes:</strong>
                          <p className="bg-background p-2.5 rounded border mt-1 text-xs">
                            {managementReport.actionsTakenOutcomes}
                          </p>
                        </div>
                        <div>
                          <strong>Recommendations:</strong>
                          <p className="bg-background p-2.5 rounded border mt-1 text-xs">
                            {managementReport.recommendations}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <strong>Lessons Learned:</strong>
                          <p className="bg-background p-2.5 rounded border mt-1 text-xs">
                            {managementReport.lessonsLearned}
                          </p>
                        </div>
                      </div>

                      {/* View Who Was Informed Context */}
                      <div className="pt-3 border-t space-y-2">
                        <strong className="text-[11px] font-black uppercase text-emerald-900">
                          Stakeholder Communication Log:
                        </strong>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <p>
                            <strong>Patient Informed:</strong>{" "}
                            {managementReport.informedPatient ? "Yes" : "No"}
                          </p>
                          <p>
                            <strong>Relative Informed:</strong>{" "}
                            {managementReport.informedRelative ? "Yes" : "No"}
                          </p>
                          <p>
                            <strong>Senior Manager:</strong>{" "}
                            {managementReport.informedSeniorManager
                              ? "Yes"
                              : "No"}
                          </p>
                          <p>
                            <strong>Pharmacist Informed:</strong>{" "}
                            {managementReport.informedPharmacist ? "Yes" : "No"}
                          </p>
                        </div>
                        {(managementReport.policeIncidentNumber ||
                          managementReport.informedOther) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                            {managementReport.policeIncidentNumber && (
                              <p>
                                <strong>Police Incident Reference:</strong>{" "}
                                {managementReport.policeIncidentNumber}
                              </p>
                            )}
                            {managementReport.informedOther && (
                              <p>
                                <strong>Other Notified Party:</strong>{" "}
                                {managementReport.informedOther}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* View OHS Block Elements */}
                      {(managementReport.ohsStaffName ||
                        managementReport.ohsAbsenceOver3Days) && (
                        <div className="pt-3 border-t space-y-2 bg-muted/30 p-3 rounded-lg border">
                          <strong className="text-[11px] font-black uppercase text-emerald-900">
                            Occupational Health & Safety Metrics:
                          </strong>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <p>
                              <strong>Absence &gt; 3 Days:</strong>{" "}
                              {managementReport.ohsAbsenceOver3Days
                                ? "Yes"
                                : "No"}
                            </p>
                            <p>
                              <strong>Violence/Danger Act:</strong>{" "}
                              {managementReport.ohsActOfViolenceOrDanger
                                ? "Yes"
                                : "No"}
                            </p>
                            <p>
                              <strong>Hospitalized &gt; 24h:</strong>{" "}
                              {managementReport.ohsHospitalizationOver24Hours
                                ? "Yes"
                                : "No"}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                            <p>
                              <strong>OHS Staff Target:</strong>{" "}
                              {managementReport.ohsStaffName || "N/A"}
                            </p>
                            <p>
                              <strong>OHS Staff DOB:</strong>{" "}
                              {managementReport.ohsStaffDob || "N/A"}
                            </p>
                            <p>
                              <strong>Staff Home Address:</strong>{" "}
                              {managementReport.ohsStaffAddress || "N/A"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Authorized Signing Summary Block */}
                    <div className="space-y-4 border-l pl-0 md:pl-6 border-emerald-200/60 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="bg-background p-3 rounded border text-xs">
                          <p className="font-extrabold text-emerald-800 uppercase tracking-tight">
                            Risk Severity Rating:{" "}
                            {managementReport.riskSeverity} / 5
                          </p>
                          <p className="font-extrabold text-emerald-800 uppercase tracking-tight">
                            Risk Likelihood Rating:{" "}
                            {managementReport.riskLikelihood} / 5
                          </p>
                          <div className="mt-2 pt-2 border-t font-black text-xs text-rose-700">
                            Unified Risk Matrix Product:{" "}
                            {managementReport.riskRating}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] bg-emerald-800 text-white p-4 rounded-xl space-y-1.5 shadow-sm">
                        <p className="font-bold text-xs border-b border-white/20 pb-1 mb-1">
                          SIGN-OFF METRICS
                        </p>
                        <p>
                          <strong>Manager Name:</strong>{" "}
                          {managementReport.managerName}
                        </p>
                        <p>
                          <strong>Designation:</strong>{" "}
                          {managementReport.managerDesignation}
                        </p>
                        <p>
                          <strong>Authorization Date:</strong>{" "}
                          {managementReport.managerDate}
                        </p>
                        <p className="text-[9px] font-black bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-300 inline-block mt-1">
                          ✓ SIGNATURE COMPLIANT
                        </p>
                      </div>
                    </div>
                  </div>
                ) : isAdmin && !isAddingManagement ? (
                  /* Form Option ONLY Rendered if Current Authenticated User is Admin */
                  <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10">
                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">
                      No administrative report attached to this dossier yet.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsAddingManagement(true)}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Report Form
                      Matrix
                    </Button>
                  </div>
                ) : isAdmin && isAddingManagement ? (
                  /* Fully Complete Managerial Form Submission Segment containing all fields */
                  <form
                    onSubmit={handleManagementSubmit}
                    className="bg-muted/40 p-5 rounded-xl border space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                          MANAGEMENT REPORT CLINICAL MATRIX
                        </h3>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-16"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-16"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-16"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                          ACTIONS, REMEDIAL PLANS & OUTCOMES
                        </h3>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-16"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-16"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Communication Array Segment */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                        COMMUNICATION & NOTIFICATIONS INDEX
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedPatient}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedPatient: e.target.checked,
                              })
                            }
                          />
                          Patient Informed
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedRelative}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedRelative: e.target.checked,
                              })
                            }
                          />
                          Relative Informed
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedSeniorManager}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedSeniorManager: e.target.checked,
                              })
                            }
                          />
                          Senior Manager Notified
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.informedPharmacist}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                informedPharmacist: e.target.checked,
                              })
                            }
                          />
                          Pharmacist Informed
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Complete Risk Analysis Mapping */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                        QUANTITATIVE RISK FACTOR ASSESSMENT
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            Severity (1-5) *
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            Likelihood (1-5) *
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            Calculated Matrix Rating (Auto)
                          </label>
                          <input
                            type="number"
                            readOnly
                            value={mgmtForm.riskRating}
                            className="w-full text-xs bg-muted border rounded p-2 h-8 font-bold text-rose-700"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Occupational Health and Safety Parameters Segment */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                        OCCUPATIONAL HEALTH & SAFETY REGULATORY COMPLIANCE
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsAbsenceOver3Days}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsAbsenceOver3Days: e.target.checked,
                              })
                            }
                          />
                          Staff Absence Over 3 Days
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsActOfViolenceOrDanger}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsActOfViolenceOrDanger: e.target.checked,
                              })
                            }
                          />
                          Act of Violence or Peril Danger
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mgmtForm.ohsHospitalizationOver24Hours}
                            onChange={(e) =>
                              setMgmtForm({
                                ...mgmtForm,
                                ohsHospitalizationOver24Hours: e.target.checked,
                              })
                            }
                          />
                          Hospitalization &gt; 24 Hours
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            OHS Target Staff Name
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Authorized Signing Segments mapping perfectly to Go binding tags */}
                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                        EXECUTIVE MANAGER AUTHORIZATION
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            Official Corporate Designation *
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold uppercase">
                            Signing Authorization Date *
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
                            className="w-full text-xs bg-background border rounded p-2 h-8"
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
                            />
                            <span className="font-bold uppercase text-rose-700">
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
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submittingManagement}
                        className="bg-emerald-600 font-bold uppercase text-xs tracking-wider"
                      >
                        Save Management Log
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Message displayed for regular users if no report is present */
                  <div className="text-center py-6">
                    <p className="text-xs font-bold text-muted-foreground uppercase">
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
