"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIncident, setSelectedIncident] =
    useState<IncidentReport | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const [user, setUser] = useState<{ role?: string; id?: number }>({});
  const [managementReport, setManagementReport] =
    useState<IncidentManagement | null>(null);
  const [loadingManagement, setLoadingManagement] = useState<boolean>(false);
  const [isAddingManagement, setIsAddingManagement] = useState<boolean>(false);
  const [isEditingManagement, setIsEditingManagement] = useState<boolean>(false);
  const [submittingManagement, setSubmittingManagement] =
    useState<boolean>(false);
  const [mgmtForm, setMgmtForm] =
    useState<Partial<IncidentManagement>>(DEFAULT_MGMT_FORM);

  // Administrative Comment & Logs States
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isAddingComment, setIsAddingComment] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(false);

  // User-side filter state
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  const router = useRouter();

  const isAdmin = user.role === "admin" || user.role === "superadmin";

  const canManageReport =
    user.role === "admin" ||
    user.role === "superadmin" ||
    user.role === "manager";

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
    setIsEditingManagement(false);
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
      console.log(error.message);
    } finally {
      setLoadingManagement(false);
    }
  };

  const fetchComments = async (incidentId: number) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/comments?incidentId=${incidentId}`,
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
        setComments(Array.isArray(data) ? data : data.comments || []);
      }
    } catch (error: any) {
      console.error("Error fetching comments dossier:", error.message);
    }
  };

  const fetchIncidentLogs = async (incidentId: number) => {
    setLoadingLogs(true);
    setLogs([]);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/${incidentId}/managementlogs`,
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
        setLogs(data.incidentLogs || []);
      }
    } catch (error: any) {
      console.error("Error fetching management audit logs:", error.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchIncidents(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (selectedIncident) {
      fetchManagementReport(selectedIncident.id);
      fetchComments(selectedIncident.id);

      if (user.role === "admin" || user.role === "superadmin") {
        fetchIncidentLogs(selectedIncident.id);
      }

      if (canManageReport) {
        setMgmtForm({
          ...DEFAULT_MGMT_FORM,
          ohsStaffName:
            selectedIncident.principalType === "staff"
              ? selectedIncident.principalName
              : "",
          ohsStaffDob:
            selectedIncident.principalType === "staff"
              ? selectedIncident.principalDob
              : "",
          incidentId: selectedIncident.id,
        });
      }
    } else {
      setManagementReport(null);
      setComments([]);
      setLogs([]);
      setIsAddingManagement(false);
      setIsEditingManagement(false);
      setIsAddingComment(false);
      setCommentText("");
    }
  }, [selectedIncident, canManageReport, user.role]);

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
    if (!selectedIncident || !canManageReport) return;

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

      if (user.role === "admin" || user.role === "superadmin") {
        fetchIncidentLogs(selectedIncident.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Database execution error occurred.");
    } finally {
      setSubmittingManagement(false);
    }
  };

  const handleManagementUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !canManageReport) return;

    setSubmittingManagement(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/${selectedIncident.id}/management`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mgmtForm),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process modification update metrics variables.");
      }

      const freshReport = await response.json();
      setManagementReport(freshReport);
      setIsEditingManagement(false);
      toast.success("Administrative report variables updated and logged successfully.");

      if (user.role === "admin" || user.role === "superadmin") {
        fetchIncidentLogs(selectedIncident.id);
      }
    } catch (error: any) {
      toast.error(error.message || "Database execution modification sequence failed.");
    } finally {
      setSubmittingManagement(false);
    }
  };

  const handleStartEditingManagement = () => {
    if (managementReport) {
      setMgmtForm({
        ...DEFAULT_MGMT_FORM,
        ...managementReport,
        managerDate: managementReport.managerDate ? managementReport.managerDate.split("T")[0] : new Date().toISOString().split("T")[0],
        ohsStaffDob: managementReport.ohsStaffDob ? managementReport.ohsStaffDob.split("T")[0] : "",
      });
      setIsEditingManagement(true);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !canManageReport || !commentText.trim()) return;

    setSubmittingComment(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incidentId: selectedIncident.id,
            userId: user.id || 1,
            comment: commentText,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to process comment mapping schema variables.");
      }

      toast.success("Comment logged successfully to dossier.");
      setCommentText("");
      setIsAddingComment(false);
      fetchComments(selectedIncident.id);
    } catch (error: any) {
      toast.error(error.message || "Database execution error parsing comment payload.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Compute filtered rows array contextually inline on the client side
  const filteredIncidents = selectedStatusFilter === "all"
    ? incidents
    : incidents.filter((inc) => inc.incidentStatus === selectedStatusFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Card className="border-muted/40 shadow-sm rounded-xl">
        <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-6 border-b gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              Hospital Incident Logs
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Internal directory of logged safety events, risk evaluations, and
              institutional metrics.
            </p>
          </div>

          {/* User-side Filter Interface Buttons Panels */}
          <div className="flex flex-wrap gap-1.5 bg-muted/40 p-1 rounded-lg border border-muted">
            <Button
              variant={selectedStatusFilter === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedStatusFilter("all")}
              className={`text-xs h-7 px-3 font-medium transition-all duration-150 ${selectedStatusFilter === "all" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              All Logs
            </Button>
            {VALID_STATUSES.map((st) => (
              <Button
                key={st.value}
                variant={selectedStatusFilter === st.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatusFilter(st.value)}
                className={`text-xs h-7 px-3 font-medium transition-all duration-150 ${selectedStatusFilter === st.value ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {st.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-0 sm:px-6">
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
