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
     if (selectedIncident && isAdmin) {
       fetchManagementReport(selectedIncident.id);
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
         ohsHospitalisationOver24Hours: false,
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
     } else if (selectedIncident && !isAdmin) {
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
                            className="font-bold text-xs uppercase h-7 px-3"
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
                       Hospital Incident dossier file ##{selectedIncident.id}
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
                      <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Signature
                        Acknowledged
                      </p>
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
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1">
                      PRINCIPAL PERSON INVOLVED
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
                      <p className="capitalize">
                        <strong>Classification:</strong>{" "}
                        {selectedIncident.principalType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider border-b pb-1 mb-2">
                        FACTUAL DESCRIPTION & CAUSE
                      </h3>
                      <p className="text-xs mb-2">
                        <strong>Cause Group:</strong>{" "}
                        <span className="font-bold underline">
                          {selectedIncident.causeGroup}
                        </span>
                      </p>
                      <div className="text-xs bg-muted/40 p-3 rounded border whitespace-pre-wrap leading-relaxed">
                        {selectedIncident.causes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               <div className="border-t pt-6">
                 <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                   <ShieldCheck className="h-4 w-4" /> Administrative Evaluation
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
                         MANAGEMENT REPORT
                       </h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                         <div>
                           <strong>Impact:</strong>
                           <p className="bg-background p-2.5 rounded border mt-1">
                             {managementReport.impactOnService}
                           </p>
                         </div>
                         <div>
                           <strong>Contributory Factors:</strong>
                           <p className="bg-background p-2.5 rounded border mt-1">
                             {managementReport.contributoryFactors}
                           </p>
                         </div>
                         <div>
                           <strong>Action/Outcomes:</strong>
                           <p className="bg-background p-2.5 rounded border mt-1">
                             {managementReport.actionsTakenOutcomes}
                           </p>
                         </div>
                         <div>
                           <strong>Recommendations:</strong>
                           <p className="bg-background p-2.5 rounded border mt-1">
                             {managementReport.recommendations}
                           </p>
                         </div>
                         <div className="sm:col-span-2">
                           <strong>Lessons Learned:</strong>
                           <p className="bg-background p-2.5 rounded border mt-1">
                             {managementReport.lessonsLearned}
                           </p>
                         </div>
                       </div>
                     </div>

                     <div className="space-y-4 border-l pl-0 md:pl-6 border-emerald-200/60">
                       <div className="bg-background p-3 rounded border text-xs">
                         <p className="font-extrabold text-emerald-800">
                           Risk Rating: {managementReport.riskRating}
                         </p>
                       </div>
                       <div className="text-[11px] bg-emerald-800 text-white p-3 rounded border">
                         <p>
                           <strong>Manager:</strong>{" "}
                           {managementReport.managerName}
                         </p>
                         <p>
                           <strong>Date:</strong> {managementReport.managerDate}
                         </p>
                       </div>
                     </div>
                   </div>
                  ) : isAdmin && !isAddingManagement ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-xl bg-muted/10">
                      <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">
                        No report attached yet.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsAddingManagement(true)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Report
                      </Button>
                    </div>
                  ) : isAddingManagement ? (
                    <form
                      onSubmit={handleManagementSubmit}
                      className="bg-muted/40 p-5 rounded-xl border space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-black uppercase text-emerald-800 border-b pb-1">
                            REPORT INPUTS
                          </h3>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase">
                              Impact *
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
                            ACTIONS
                          </h3>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold uppercase">
                              Actions/Outcomes *
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
                      <div className="flex justify-end gap-3 pt-2 border-t">
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
                          className="bg-emerald-600"
                        >
                          Save
                        </Button>
                      </div>
                    </form>
                  ) : null}
                 </div>
               </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
}
