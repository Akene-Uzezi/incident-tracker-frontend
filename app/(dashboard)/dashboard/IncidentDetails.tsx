"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  ShieldCheck,
  Activity,
  Info,
  Users,
  Wrench,
  Plus,
  Eye,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import {
  IncidentReport,
  IncidentManagement,
  IncidentStatus,
  VALID_STATUSES,
  getSeverityBadgeClass,
  getStatusBadgeClass,
} from "./types";
import { AdminManagementForm } from "./AdminManagementForm";

interface IncidentDetailsProps {
  incident: IncidentReport | null;
  isAdmin: boolean;
  userRole?: string;
  updatingStatus: boolean;
  loadingManagement: boolean;
  managementReport: IncidentManagement | null;
  isAddingManagement: boolean;
  isEditingManagement: boolean;
  submittingManagement: boolean;
  mgmtForm: Partial<IncidentManagement>;
  comments: any[];
  commentText: string;
  isAddingComment: boolean;
  submittingComment: boolean;
  logs: any[];
  loadingLogs: boolean;
  onClose: () => void;
  onStatusChange: (status: IncidentStatus) => void;
  onFormChange: (updated: Partial<IncidentManagement>) => void;
  onManagementSubmit: (e: React.FormEvent) => void;
  onManagementUpdate: (e: React.FormEvent) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onCommentTextChange: (text: string) => void;
  onCommentSubmit: (e: React.FormEvent) => void;
  onStartAddingComment: () => void;
  onCancelAddingComment: () => void;
}

// Helper function to extract and format only the fields that changed
function getLogChanges(oldVal: any, newVal: any): string[] {
  let parsedOld = oldVal;
  let parsedNew = newVal;

  // Gracefully handle stringified JSON in logs
  if (typeof oldVal === "string") {
    try {
      parsedOld = JSON.parse(oldVal);
    } catch (e) { }
  }
  if (typeof newVal === "string") {
    try {
      parsedNew = JSON.parse(newVal);
    } catch (e) { }
  }

  if (!parsedOld || !parsedNew) return [];
  const changes: string[] = [];

  const fieldLabels: Record<string, string> = {
    impactOnService: "Impact on Service",
    contributoryFactors: "Contributory Factors",
    actionsTakenOutcomes: "Actions Taken / Outcomes",
    recommendations: "Recommendations",
    lessonsLearned: "Lessons Learned",
    informedPatient: "Informed Patient",
    informedRelative: "Informed Relative",
    informedSeniorManager: "Informed Senior Manager",
    informedPharmacist: "Informed Pharmacist",
    policeIncidentNumber: "Police Incident Number",
    informedOther: "Informed Other",
    riskSeverity: "Risk Severity",
    riskLikelihood: "Risk Likelihood",
    riskRating: "Risk Rating",
    ohsAbsenceOver3Days: "OHS Absence > 3 Days",
    ohsActOfViolenceOrDanger: "OHS Act of Violence / Danger",
    ohsHospitalizationOver24Hours: "OHS Hospitalization > 24 Hours",
    ohsStaffName: "OHS Staff Name",
    ohsStaffDob: "OHS Staff DOB",
    ohsStaffAddress: "OHS Staff Address",
    managerName: "Manager Name",
    managerSignature: "Manager Signature Binding",
    managerDesignation: "Manager Designation",
    managerDate: "Manager Date",
  };

  const allKeys = Array.from(new Set([...Object.keys(parsedOld), ...Object.keys(parsedNew)]));

  for (const key of allKeys) {
    if (key === "id" || key === "incidentId") continue;

    const oldRaw = parsedOld[key];
    const newRaw = parsedNew[key];

    const oldStr = oldRaw === undefined || oldRaw === null ? "" : String(oldRaw);
    const newStr = newRaw === undefined || newRaw === null ? "" : String(newRaw);

    if (oldStr !== newStr) {
      const label = fieldLabels[key] || key;
      const formatVal = (v: any) => {
        if (v === true || v === "true") return "Yes";
        if (v === false || v === "false") return "No";
        if (v === "") return "(empty)";
        return String(v);
      };
      changes.push(`${label}: "${formatVal(oldRaw)}" → "${formatVal(newRaw)}"`);
    }
  }
  return changes;
}

export function IncidentDetails({
  incident,
  isAdmin,
  userRole,
  updatingStatus,
  loadingManagement,
  managementReport,
  isAddingManagement,
  isEditingManagement,
  submittingManagement,
  mgmtForm,
  comments = [],
  commentText,
  isAddingComment,
  submittingComment,
  logs = [],
  loadingLogs,
  onClose,
  onStatusChange,
  onFormChange,
  onManagementSubmit,
  onManagementUpdate,
  onStartAdding,
  onCancelAdding,
  onStartEditing,
  onCancelEditing,
  onCommentTextChange,
  onCommentSubmit,
  onStartAddingComment,
  onCancelAddingComment,
}: IncidentDetailsProps) {
  const isCoreAdmin = userRole === "admin" || userRole === "superadmin";
  const isManageAllowed = isAdmin || isCoreAdmin || userRole === "manager";

  const [showComments, setShowComments] = useState<boolean>(false);
  const [logPage, setLogPage] = useState<number>(1);
  const logsPerPage = 5;

  useEffect(() => {
    setLogPage(1);
  }, [incident]);

  // Normalize report checking logic to prevent truthiness of empty arrays or objects
  const reportData = useMemo(() => {
    if (!managementReport) return null;
    if (Array.isArray(managementReport)) {
      return managementReport.length > 0 ? managementReport[0] : null;
    }
    if (typeof managementReport === "object" && Object.keys(managementReport).length === 0) {
      return null;
    }
    return managementReport;
  }, [managementReport]);

  const hasReport = !!reportData;
  const logsList = Array.isArray(logs) ? logs : [];

  return (
    <Dialog open={!!incident} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-7xl !w-[95vw] max-h-[92vh] overflow-y-auto p-6 md:p-8 rounded-xl border shadow-2xl bg-background">
        {incident && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <DialogHeader className="border-b pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    Hospital Incident File #{incident.id}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground mt-1">
                    Comprehensive clinical statements, site diagnostics, and
                    administrative report alignments.
                  </DialogDescription>
                </div>

                {isCoreAdmin ? (
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
                        value={incident.incidentStatus}
                        disabled={updatingStatus}
                        onChange={(e) =>
                          onStatusChange(e.target.value as IncidentStatus)
                        }
                        className={`text-xs font-medium px-2.5 py-1 rounded-md border focus:outline-none focus:ring-1 cursor-pointer disabled:opacity-50 ${getStatusBadgeClass(incident.incidentStatus)}`}
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
                      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getSeverityBadgeClass(incident.severityLevel)}`}
                    >
                      {incident.severityLevel} severity
                    </span>
                  </div>
                ) : (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getSeverityBadgeClass(incident.severityLevel)}`}
                  >
                    {incident.severityLevel} severity
                  </span>
                )}
              </div>
            </DialogHeader>

            {/* Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left sidebar */}
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
                      {incident.reporterName}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Designation:
                      </strong>{" "}
                      {incident.reporterDesignation}
                    </p>
                    <p className="break-all">
                      <strong className="text-foreground font-medium">
                        Contact Info:
                      </strong>{" "}
                      {incident.reporterInfo}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Date Filed:
                      </strong>{" "}
                      {incident.date}
                    </p>
                    {incident.signature && (
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
                        {incident.dateOfIncident}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground/70" />
                      <span>
                        <strong className="text-foreground font-medium">
                          Time:
                        </strong>{" "}
                        {incident.timeOfIncident || "Unspecified"}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground/70 mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-foreground font-medium">
                          Location:
                        </strong>{" "}
                        {incident.locationOfIncident} <br />
                        <span className="text-xs text-muted-foreground">
                          Ward / Dept: {incident.incidentWardDept}
                        </span>
                      </span>
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Near Miss:
                      </strong>{" "}
                      {incident.isNearMiss ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Principal Person */}
                <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-emerald-600" /> Principal
                    Person Involved ({incident.principalType})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground font-medium">
                        Name:
                      </strong>{" "}
                      {incident.principalName}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Gender:
                      </strong>{" "}
                      {incident.principalGender}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Date of Birth:
                      </strong>{" "}
                      {incident.principalDob}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Involvement Context:
                      </strong>{" "}
                      {incident.peopleInvolved}
                    </p>
                  </div>

                  {incident.principalType === "patient" && (
                    <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-amber-50/20 p-3 rounded-lg border border-amber-100">
                      <p>
                        <strong className="font-medium text-foreground">
                          Patient ID:
                        </strong>{" "}
                        {incident.patientId || "N/A"}
                      </p>
                      <p>
                        <strong className="font-medium text-foreground">
                          Patient Ward / Dept:
                        </strong>{" "}
                        {incident.patientWardDept || "N/A"}
                      </p>
                    </div>
                  )}

                  {incident.principalType === "staff" && (
                    <div className="mt-2 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-blue-50/20 p-3 rounded-lg border border-blue-100">
                      <p>
                        <strong className="font-medium text-foreground">
                          Job Title:
                        </strong>{" "}
                        {incident.staffJobTitle || "N/A"}
                      </p>
                      <p>
                        <strong className="font-medium text-foreground">
                          Phone Number:
                        </strong>{" "}
                        {incident.staffPhone || "N/A"}
                      </p>
                      <p>
                        <strong className="font-medium text-foreground">
                          Place of Work:
                        </strong>{" "}
                        {incident.staffPlaceOfWork || "N/A"}
                      </p>
                      <p>
                        <strong className="font-medium text-foreground">
                          Site Location:
                        </strong>{" "}
                        {incident.staffSite || "N/A"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Witnesses */}
                {(incident.witnesses || incident.witnessType) && (
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
                        {incident.witnesses || "None"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Type:
                        </strong>{" "}
                        {incident.witnessType || "N/A"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Ward / Dept:
                        </strong>{" "}
                        {incident.witnessWardDept || "N/A"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Job Title:
                        </strong>{" "}
                        {incident.witnessJobTitle || "N/A"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Phone:
                        </strong>{" "}
                        {incident.witnessPhone || "N/A"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description & Treatment */}
                <div className="bg-background border p-5 rounded-xl shadow-sm space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-emerald-600" /> Description &
                    Treatment
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>
                      <strong className="text-foreground font-medium">
                        Cause Group:
                      </strong>{" "}
                      {incident.causeGroup}
                    </p>
                    <p>
                      <strong className="text-foreground font-medium">
                        Prescribing Doctor:
                      </strong>{" "}
                      {incident.prescribingDoctor || "None"}
                    </p>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Root Causes
                    </span>
                    <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {incident.causes}
                    </div>
                  </div>
                  <div className="text-sm space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Treatment Received
                    </span>
                    <div className="bg-muted/40 p-3 rounded-lg border text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {incident.treatmentReceived || "No treatment documented."}
                    </div>
                  </div>
                </div>

                {/* Equipment */}
                {incident.equipmentInvolved && (
                  <div className="bg-background border p-5 rounded-xl shadow-sm space-y-3">
                    <h3 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-emerald-600" /> Equipment
                      & Medical Devices
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground font-medium">
                          Equipment Name:
                        </strong>{" "}
                        {incident.equipmentInvolved}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Model:
                        </strong>{" "}
                        {incident.equipmentModel || "N/A"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Equipment Number:
                        </strong>{" "}
                        {incident.equipmentNumber || "N/A"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Medical Device Classified:
                        </strong>{" "}
                        {incident.isMedicalDevice || "No"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Sent for Repair:
                        </strong>{" "}
                        {incident.equipmentSentForRepair ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Withdrawn from Use:
                        </strong>{" "}
                        {incident.equipmentWithdrawn ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong className="text-foreground font-medium">
                          Retained for Investigation:
                        </strong>{" "}
                        {incident.equipmentRetained ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Management Section */}
            <div className="border-t pt-6">
              <h2 className="text-base font-semibold tracking-tight mb-4 flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />{" "}
                Administrative Evaluation Dossier
              </h2>
              <AdminManagementForm
                isAdmin={isManageAllowed}
                loadingManagement={loadingManagement}
                managementReport={reportData}
                isAddingManagement={isAddingManagement}
                isEditingManagement={isEditingManagement}
                submittingManagement={submittingManagement}
                mgmtForm={mgmtForm}
                selectedIncident={incident}
                onFormChange={onFormChange}
                onSubmit={isEditingManagement ? onManagementUpdate : onManagementSubmit}
                onStartAdding={onStartAdding}
                onCancelAdding={onCancelAdding}
                onStartEditing={onStartEditing}
                onCancelEditing={onCancelEditing}
              />

              {/* Administrative Comment Section (Requires filled report and authorized personnel) */}
              {hasReport && isManageAllowed && (
                <div className="mt-6 pt-6 border-t border-dashed space-y-4">
                  <div className="flex justify-between items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComments(!showComments)}
                      className="text-xs h-8 flex items-center gap-1.5 text-muted-foreground"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {showComments ? "Hide Comments" : `View Comments (${comments.length})`}
                    </Button>

                    {!isAddingComment && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onStartAddingComment}
                        className="text-xs h-8 flex items-center gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-600" /> Add Comment
                      </Button>
                    )}
                  </div>

                  {showComments && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 animate-in fade-in duration-200">
                      {comments.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic p-2">No timeline comments logged yet.</p>
                      ) : (
                        comments.map((c, i) => (
                          <div key={c.id || i} className="bg-muted/40 border p-3 rounded-lg space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                <MessageSquare className="h-3 w-3" />  {c.commentUserName} || {c.commentUserRole}
                              </span>
                              <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                            </div>
                            <p className="text-xs text-foreground/90 font-sans leading-relaxed">{c.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {isAddingComment && (
                    <form onSubmit={onCommentSubmit} className="space-y-4 bg-muted/20 p-4 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                          Add Administrative Comment / Note
                        </label>
                        <textarea
                          required
                          placeholder="Type your clinical alignment or internal administrative note here..."
                          value={commentText}
                          onChange={(e) => onCommentTextChange(e.target.value)}
                          className="w-full text-xs bg-background border rounded-md p-2.5 h-20 focus:ring-1 focus:outline-none resize-none"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={onCancelAddingComment}
                          className="text-xs h-8"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={submittingComment || !commentText.trim()}
                          className="bg-emerald-600 text-white font-medium text-xs h-8 px-4"
                        >
                          {submittingComment ? "Saving..." : "Submit Comment"}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Audit Logs Section (Admins & Superadmins Only) */}
            {isCoreAdmin && (
              <div className="border-t pt-6 space-y-4">
                <h2 className="text-base font-semibold tracking-tight flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-emerald-600" />{" "}
                  Management Activity Log Files
                </h2>

                {loadingLogs ? (
                  <div className="text-xs text-muted-foreground flex items-center gap-2 py-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                    Loading configuration history logs...
                  </div>
                ) : logsList.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-muted/20 p-3 rounded-lg border">
                    No administrative mutation history has been recorded for this dossier yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="overflow-x-auto border rounded-lg bg-background">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/50 border-b text-xs font-semibold text-foreground">
                            <th className="p-2.5 pl-4">Timestamp</th>
                            <th className="p-2.5">Operator</th>
                            <th className="p-2.5">Action</th>
                            <th className="p-2.5 pr-4">Modifications / Changes Made</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-xs text-muted-foreground">
                          {logsList
                            .slice((logPage - 1) * logsPerPage, logPage * logsPerPage)
                            .map((log) => {
                              // Dynamically extract changes, parser handles stringified JSON
                              const fieldChanges = getLogChanges(log.oldValue, log.newValue);

                              return (
                                <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                                  <td className="p-2.5 pl-4 whitespace-nowrap align-top">
                                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                                  </td>
                                  <td className="p-2.5 font-medium text-foreground whitespace-nowrap align-top">
                                    {log.userName || `User ID: ${log.changedBy}`}
                                  </td>
                                  <td className="p-2.5 whitespace-nowrap align-top">
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-200">
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-2.5 pr-4 text-xs align-top">
                                    {fieldChanges.length === 0 ? (
                                      <span className="text-muted-foreground/50 italic">No field differences mapped</span>
                                    ) : (
                                      <ul className="list-disc pl-4 space-y-1 text-foreground/90">
                                        {fieldChanges.map((change, idx) => (
                                          <li key={idx} className="leading-normal">
                                            {change}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                    {logsList.length > logsPerPage && (
                      <div className="flex items-center justify-between text-xs pt-1 px-1">
                        <div className="text-muted-foreground">
                          Showing {((logPage - 1) * logsPerPage) + 1}-
                          {Math.min(logsList.length, logPage * logsPerPage)} of {logsList.length} revision statements
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="h-7 px-2.5 text-xs"
                            disabled={logPage === 1}
                            onClick={() => setLogPage((p) => p - 1)}
                          >
                            Previous
                          </Button>
                          <span className="text-muted-foreground">
                            Page {logPage} of {Math.ceil(logsList.length / logsPerPage)}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-7 px-2.5 text-xs"
                            disabled={logPage >= Math.ceil(logsList.length / logsPerPage)}
                            onClick={() => setLogPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
