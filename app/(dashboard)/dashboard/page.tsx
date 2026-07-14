"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar, X, Filter } from "lucide-react";

import {
  IncidentReport,
  IncidentManagement,
  IncidentStatus,
  PaginationMeta,
  IncidentResponse,
  formatStatusText,
  VALID_STATUSES,
} from "./types";
import { IncidentTable } from "./IncidentTable";
import { IncidentDetails } from "./IncidentDetails";

const API_BASE_URL = process.env.NEXT_PUBLIC_apiurl || "http://localhost:3001/api/v1";

const DEFAULT_MGMT_FORM: Partial<IncidentManagement> = {
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
};

export default function Dashboard() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtering States
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Mock User Session Profile context matching backend authentication states
  const user = {
    role: "admin", // "admin", "supervisor", "reporter"
    department: "Emergency",
  };

  const canManageReport = user.role === "admin" || user.role === "manager";

  // Detailed modal management view overlay track states
  const [selectedIncident, setSelectedIncident] = useState<IncidentReport | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [loadingManagement, setLoadingManagement] = useState<boolean>(false);
  const [managementReport, setManagementReport] = useState<IncidentManagement | null>(null);

  const [isAddingManagement, setIsAddingManagement] = useState<boolean>(false);
  const [isEditingManagement, setIsEditingManagement] = useState<boolean>(false);
  const [submittingManagement, setSubmittingManagement] = useState<boolean>(false);
  const [mgmtForm, setMgmtForm] = useState<Partial<IncidentManagement>>(DEFAULT_MGMT_FORM);

  // Communication comments audit tracking logs states
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // Helper to fetch the secure token from local storage
  const getAuthHeaders = (extraHeaders = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Authorization": `Bearer ${token || ""}`,
      ...extraHeaders,
    };
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch metrics synced contextually against Go backend parameters
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/incidents?page=${currentPage}&limit=10`;

      if (selectedStatusFilter !== "all") {
        url += `&status=${selectedStatusFilter}`;
      }
      if (dateFrom) {
        url += `&dateFrom=${dateFrom}`;
      }
      if (dateTo) {
        url += `&dateTo=${dateTo}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/auth/login");
        return;
      }

      if (!res.ok) throw new Error("Failed to pull analytical records");
      const data: IncidentResponse = await res.json();

      setIncidents(data.data || []);
      setPagination(data.pagination || null);
    } catch (err: any) {
      toast.error(err.message || "Could not complete lookup loop sequence");
    } finally {
      setLoading(false);
    }
  };

  // Effect hooks watching structural state shifts
  useEffect(() => {
    fetchIncidents();
  }, [currentPage, selectedStatusFilter, dateFrom, dateTo]);

  // The backend query param above doesn't actually filter by status, so we
  // filter the fetched page of incidents client-side before rendering.
  const filteredIncidents = useMemo(() => {
    if (selectedStatusFilter === "all") return incidents;
    return incidents.filter(
      (incident) => incident.incidentStatus === selectedStatusFilter
    );
  }, [incidents, selectedStatusFilter]);

  // Reset page counter tracking to avoid offsets overflow boundary conflicts on filter mutations
  const handleStatusSelect = (status: string) => {
    setSelectedStatusFilter(status);
    setCurrentPage(1);
    setStatusDropdownOpen(false);
  };

  const clearDateFilters = () => {
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
    toast.success("Date range criteria cleared");
  };

  // Administrative detail record loading orchestration handlers
  const fetchManagementDetails = async (incidentId: number) => {
    setLoadingManagement(true);
    setManagementReport(null); // Reset layout context strictly to prevent lingering stale logs
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${incidentId}/management`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (res.status === 404) {
        setManagementReport(null);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Backend returns the incident management object directly (no wrapper key)
      setManagementReport(data);
    } catch {
      toast.error("Failed to load historical management layout context profiles");
      setManagementReport(null);
    } finally {
      setLoadingManagement(false);
    }
  };

  const fetchCommentsAndLogs = async (incidentId: number) => {
    setLoadingLogs(true);
    setComments([]); // Flush old items on refresh
    setLogs([]);
    try {
      // Aligned with the exact routes.go endpoints v1.GET("/incidents/comments") & v1.GET("/incidents/:id/managementlogs")
      const [commentsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/incidents/comments?incidentId=${incidentId}&incident_id=${incidentId}`, {
          method: "GET",
          headers: getAuthHeaders(),
        }),
        fetch(`${API_BASE_URL}/incidents/${incidentId}/managementlogs`, {
          method: "GET",
          headers: getAuthHeaders(),
        })
      ]);
      if (commentsRes.ok) {
        const cData = await commentsRes.json();
        // Backend wraps the array under "comments", not "data"
        setComments(cData.comments || []);
      }
      if (logsRes.ok) {
        const lData = await logsRes.json();
        // Backend wraps the array under "incidentLogs", not "data"
        setLogs(lData.incidentLogs || []);
      }
    } catch {
      toast.error("Error connecting with timeline verification updates context");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (selectedIncident) {
      fetchManagementDetails(selectedIncident.id);
      fetchCommentsAndLogs(selectedIncident.id);
      setIsAddingManagement(false);
      setIsEditingManagement(false);
      setMgmtForm(DEFAULT_MGMT_FORM);
    }
  }, [selectedIncident]);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${selectedIncident.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ incidentStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Workflow status updated successfully to ${formatStatusText(newStatus)}`);
      setSelectedIncident((prev) => prev ? { ...prev, incidentStatus: newStatus } : null);
      fetchIncidents();
    } catch {
      toast.error("Critical access authority error editing process variables");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleManagementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setSubmittingManagement(true);
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${selectedIncident.id}/management`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(mgmtForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Administrative management parameters authorized smoothly");
      setIsAddingManagement(false);
      fetchManagementDetails(selectedIncident.id);
    } catch {
      toast.error("Process error handling context save operations validation loop");
    } finally {
      setSubmittingManagement(false);
    }
  };

  const handleManagementUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !managementReport) return;
    setSubmittingManagement(true);
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${selectedIncident.id}/management`, {
        method: "PUT",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(mgmtForm),
      });
      if (!res.ok) throw new Error();
      toast.success("Management revision block committed to ledger");
      setIsEditingManagement(false);
      fetchManagementDetails(selectedIncident.id);
    } catch {
      toast.error("Error processing tracking changes back online");
    } finally {
      setSubmittingManagement(false);
    }
  };

  const handleStartEditingManagement = () => {
    if (managementReport) {
      setMgmtForm({
        ...managementReport,
        managerDate: managementReport.managerDate
          ? managementReport.managerDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
      setIsEditingManagement(true);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !commentText.trim()) return;
    setSubmittingComment(true);
    try {
      // Aligned with the exact routes.go v1.POST("/incidents/comments") endpoint definition
      const res = await fetch(`${API_BASE_URL}/incidents/comments`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          comment: commentText.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Comment audit entry preserved");
      setCommentText("");
      setIsAddingComment(false);
      fetchCommentsAndLogs(selectedIncident.id);
    } catch {
      toast.error("Internal transaction error validating system messaging fields");
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Card className="shadow-sm border-muted">
        <CardHeader className="pb-4 border-b border-muted bg-muted/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                Incident Control Room Logs
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor clinical risk profiles, workflows, and administrative resolutions.
              </p>
            </div>

            {/* Top Right Date Filter Area */}
            <div className="flex flex-wrap items-center gap-2 md:self-start">
              <div className="flex items-center gap-1.5 bg-background border rounded-lg px-2 py-1 shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="text-xs bg-transparent border-none outline-none focus:ring-0 w-28 text-foreground"
                />
                <span className="text-xs text-muted-foreground font-medium px-0.5">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="text-xs bg-transparent border-none outline-none focus:ring-0 w-28 text-foreground"
                />
              </div>

              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  onClick={clearDateFilters}
                  className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear Dates
                </Button>
              )}
            </div>
          </div>

          {/* Action Filter Controls Row */}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-dashed">
            {/* Shadcn Card Styled Status Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="text-xs h-8 px-3 font-medium transition-all duration-150 flex items-center gap-2 shadow-sm"
              >
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span>
                  Status:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {selectedStatusFilter === "all"
                      ? "All Logs"
                      : formatStatusText(selectedStatusFilter as IncidentStatus)}
                  </strong>
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200" />
              </Button>

              {statusDropdownOpen && (
                <Card className="absolute left-0 mt-1.5 w-48 z-50 shadow-md border border-muted p-1 bg-popover text-popover-foreground animate-in fade-in-50 slide-in-from-top-1">
                  <div className="text-[10px] font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider border-b border-muted/50 mb-1">
                    Select Workflow View
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStatusSelect("all")}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${selectedStatusFilter === "all"
                      ? "bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "hover:bg-muted text-foreground"
                      }`}
                  >
                    <span>All Logs</span>
                    {selectedStatusFilter === "all" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                  </button>
                  {VALID_STATUSES.map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => handleStatusSelect(st.value)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded-md transition-colors flex items-center justify-between ${selectedStatusFilter === st.value
                        ? "bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "hover:bg-muted text-foreground"
                        }`}
                    >
                      <span>{st.label}</span>
                      {selectedStatusFilter === st.value && <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </Card>
              )}
            </div>

            {/* Decorative Active Filter Feedback Indicator */}
            <div className="text-xs text-muted-foreground hidden sm:block">
              {(selectedStatusFilter !== "all" || dateFrom || dateTo) ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/40 animate-pulse">
                  System criteria tuning active
                </span>
              ) : (
                <span className="text-[11px]">Displaying exhaustive operational ledger</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <IncidentTable
            incidents={filteredIncidents}
            loading={loading}
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onViewIncident={setSelectedIncident}
          />
        </CardContent>
      </Card>

      <IncidentDetails
        incident={selectedIncident}
        isAdmin={canManageReport}
        userRole={user.role}
        updatingStatus={updatingStatus}
        loadingManagement={loadingManagement}
        managementReport={managementReport}
        isAddingManagement={isAddingManagement}
        isEditingManagement={isEditingManagement}
        submittingManagement={submittingManagement}
        mgmtForm={mgmtForm}
        comments={comments}
        commentText={commentText}
        isAddingComment={isAddingComment}
        submittingComment={submittingComment}
        logs={logs}
        loadingLogs={loadingLogs}
        onClose={() => setSelectedIncident(null)}
        onStatusChange={handleStatusChange}
        onFormChange={setMgmtForm}
        onManagementSubmit={handleManagementSubmit}
        onManagementUpdate={handleManagementUpdate}
        onStartAdding={() => setIsAddingManagement(true)}
        onCancelAdding={() => setIsAddingManagement(false)}
        onStartEditing={handleStartEditingManagement}
        onCancelEditing={() => setIsEditingManagement(false)}
        onCommentTextChange={setCommentText}
        onCommentSubmit={handleCommentSubmit}
        onStartAddingComment={() => setIsAddingComment(true)}
        onCancelAddingComment={() => setIsAddingComment(false)}
      />
    </div>
  );
}
