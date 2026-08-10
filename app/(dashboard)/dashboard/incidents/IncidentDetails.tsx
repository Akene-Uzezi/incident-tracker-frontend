"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  MessageSquare,
} from "lucide-react";
import {
  IncidentReport,
  IncidentStatus,
  VALID_STATUSES,
} from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/ui/status-badge";
import { AdminManagementForm } from "./AdminManagementForm";
import { useAuthUser, useCanManageReport } from "@/lib/store/auth-store";
import { useManagementQuery } from "@/lib/api/hooks/use-management";
import { useCommentsQuery, useLogsQuery, useAddCommentMutation } from "@/lib/api/hooks/use-comments";
import { useIncidentStatusMutation } from "@/lib/api/hooks/use-incidents";
import { notify } from "@/lib/toast";

interface IncidentDetailsProps {
  incident: IncidentReport | null;
  onClose: () => void;
}

function getLogChanges(oldVal: unknown, newVal: unknown): string[] {
  let parsedOld: Record<string, unknown> | null =
    oldVal && typeof oldVal === "object" ? (oldVal as Record<string, unknown>) : null;
  let parsedNew: Record<string, unknown> | null =
    newVal && typeof newVal === "object" ? (newVal as Record<string, unknown>) : null;

  if (typeof oldVal === "string") {
    try {
      parsedOld = JSON.parse(oldVal);
    } catch {
      /* not JSON */
    }
  }
  if (typeof newVal === "string") {
    try {
      parsedNew = JSON.parse(newVal);
    } catch {
      /* not JSON */
    }
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
      const formatVal = (v: unknown) => {
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

export function IncidentDetails({ incident, onClose }: IncidentDetailsProps) {
  const user = useAuthUser();
  const canManageReport = useCanManageReport();
  const role = user?.role?.toLowerCase();
  const isCoreAdmin = role === "admin" || role === "superadmin";
  const isManageAllowed = canManageReport;

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 5;

  const incidentId = incident?.id;

  const { data: managementReport = null, isLoading: loadingManagement } = useManagementQuery(incidentId);
  const { data: comments = [], isLoading: loadingComments } = useCommentsQuery(incidentId);
  const { data: logs = [], isLoading: loadingLogs } = useLogsQuery(incidentId);
  const statusMutation = useIncidentStatusMutation(incidentId ?? 0);
  const addCommentMutation = useAddCommentMutation(incidentId ?? 0);

  const hasReport = !!managementReport;
  const logsList = Array.isArray(logs) ? logs : [];

  const handleStatusChange = (status: IncidentStatus) => {
    statusMutation.mutate(status, {
      onSuccess: () => notify.success("Status updated", `Marked as ${status === "inprogress" ? "In Progress" : status}`),
      onError: (err) => notify.apiError("Couldn't update status", err),
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(
      {
        comment: commentText.trim(),
        userId: user?.id,
        commentUserName: user?.name,
        commentUserRole: user?.role,
      },
      {
        onSuccess: () => {
          notify.success("Comment added");
          setCommentText("");
          setIsAddingComment(false);
        },
        onError: (err) => notify.apiError("Couldn't post comment", err),
      }
    );
  };

  return (
    <Dialog open={!!incident} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!max-w-6xl !w-[95vw] max-h-[92vh] overflow-y-auto rounded-xl p-6 shadow-2xl md:p-8">
        {incident && (
          <div key={incident.id} className="animate-in fade-in zoom-in-95 space-y-6 duration-200">
            <DialogHeader className="border-b pb-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    <FileText className="h-5 w-5 text-primary" />
                    Hospital Incident File #{incident.id}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Comprehensive clinical statements, site diagnostics, and administrative report alignments.
                  </DialogDescription>
                </div>

                {isCoreAdmin ? (
                  <div className="flex shrink-0 flex-wrap items-center gap-3 rounded-lg border bg-muted/50 p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <label htmlFor="status-select" className="text-xs font-medium text-muted-foreground">
                        Manage Status:
                      </label>
                      <Select
                        value={incident.incidentStatus}
                        disabled={statusMutation.isPending}
                        onValueChange={(v) => handleStatusChange(v as IncidentStatus)}
                      >
                        <SelectTrigger id="status-select" size="sm" className="h-7">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VALID_STATUSES.map((st) => (
                            <SelectItem key={st.value} value={st.value}>
                              {st.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="hidden h-4 w-px bg-muted sm:block" />
                    <SeverityBadge severity={incident.severityLevel} />
                  </div>
                ) : (
                  <SeverityBadge severity={incident.severityLevel} />
                )}
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="management">Management</TabsTrigger>
                {isManageAllowed && <TabsTrigger value="comments">Comments</TabsTrigger>}
                {isCoreAdmin && <TabsTrigger value="audit">Audit Log</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
                  <div className="space-y-5 rounded-xl border bg-muted/20 p-5 lg:col-span-1">
                    <div>
                      <h3 className="mb-3 flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                        <User className="h-4 w-4 text-primary" /> Reporter Details
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p><strong className="font-medium text-foreground">Reporter Name:</strong> {incident.reporterName}</p>
                        <p><strong className="font-medium text-foreground">Designation:</strong> {incident.reporterDesignation}</p>
                        <p className="break-all"><strong className="font-medium text-foreground">Contact Info:</strong> {incident.reporterInfo}</p>
                        <p><strong className="font-medium text-foreground">Date Filed:</strong> {incident.date}</p>
                        {incident.signature && (
                          <p className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <ShieldCheck className="h-4 w-4" /> Signature acknowledged
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                        <Activity className="h-4 w-4 text-primary" /> Incident Context
                      </h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground/70" />
                          <span><strong className="font-medium text-foreground">Date:</strong> {incident.dateOfIncident}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground/70" />
                          <span><strong className="font-medium text-foreground">Time:</strong> {incident.timeOfIncident || "Unspecified"}</span>
                        </p>
                        <p className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                          <span>
                            <strong className="font-medium text-foreground">Location:</strong> {incident.locationOfIncident}
                            <br />
                            <span className="text-xs text-muted-foreground">Ward / Dept: {incident.incidentWardDept}</span>
                          </span>
                        </p>
                        <p><strong className="font-medium text-foreground">Near Miss:</strong> {incident.isNearMiss ? "Yes" : "No"}</p>
                        <div className="pt-1">
                          <StatusBadge status={incident.incidentStatus} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 lg:col-span-2">
                    <div className="space-y-4 rounded-xl border bg-background p-5 shadow-sm">
                      <h3 className="flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                        <User className="h-4 w-4 text-primary" /> Principal Person Involved ({incident.principalType})
                      </h3>
                      <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                        <p><strong className="font-medium text-foreground">Name:</strong> {incident.principalName}</p>
                        <p><strong className="font-medium text-foreground">Gender:</strong> {incident.principalGender}</p>
                        <p><strong className="font-medium text-foreground">Date of Birth:</strong> {incident.principalDob}</p>
                        <p><strong className="font-medium text-foreground">Involvement Context:</strong> {incident.peopleInvolved}</p>
                      </div>

                      {incident.principalType === "patient" && (
                        <div className="mt-2 grid grid-cols-1 gap-4 rounded-lg border border-amber-200/60 bg-amber-50/30 p-3 pt-3 text-sm sm:grid-cols-2 dark:border-amber-500/20 dark:bg-amber-500/5">
                          <p><strong className="font-medium text-foreground">Patient ID:</strong> {incident.patientId || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Patient Ward / Dept:</strong> {incident.patientWardDept || "N/A"}</p>
                        </div>
                      )}

                      {incident.principalType === "staff" && (
                        <div className="mt-2 grid grid-cols-1 gap-3 rounded-lg border border-blue-200/60 bg-blue-50/30 p-3 pt-3 text-sm sm:grid-cols-2 dark:border-blue-500/20 dark:bg-blue-500/5">
                          <p><strong className="font-medium text-foreground">Job Title:</strong> {incident.staffJobTitle || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Phone Number:</strong> {incident.staffPhone || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Place of Work:</strong> {incident.staffPlaceOfWork || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Site Location:</strong> {incident.staffSite || "N/A"}</p>
                        </div>
                      )}
                    </div>

                    {(incident.witnesses || incident.witnessType) && (
                      <div className="space-y-3 rounded-xl border bg-background p-5 shadow-sm">
                        <h3 className="flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                          <Users className="h-4 w-4 text-primary" /> Witness Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
                          <p><strong className="font-medium text-foreground">Witness Name(s):</strong> {incident.witnesses || "None"}</p>
                          <p><strong className="font-medium text-foreground">Type:</strong> {incident.witnessType || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Ward / Dept:</strong> {incident.witnessWardDept || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Job Title:</strong> {incident.witnessJobTitle || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Phone:</strong> {incident.witnessPhone || "N/A"}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 rounded-xl border bg-background p-5 shadow-sm">
                      <h3 className="flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                        <Info className="h-4 w-4 text-primary" /> Description & Treatment
                      </h3>
                      <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <p><strong className="font-medium text-foreground">Cause Group:</strong> {incident.causeGroup}</p>
                        <p><strong className="font-medium text-foreground">Prescribing Doctor:</strong> {incident.prescribingDoctor || "None"}</p>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <span className="text-xs font-medium text-muted-foreground">Root Causes</span>
                        <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                          {incident.causes}
                        </div>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <span className="text-xs font-medium text-muted-foreground">Treatment Received</span>
                        <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                          {incident.treatmentReceived || "No treatment documented."}
                        </div>
                      </div>
                    </div>

                    {incident.equipmentInvolved && (
                      <div className="space-y-3 rounded-xl border bg-background p-5 shadow-sm">
                        <h3 className="flex items-center gap-1.5 border-b pb-2 text-sm font-semibold text-foreground">
                          <Wrench className="h-4 w-4 text-primary" /> Equipment & Medical Devices
                        </h3>
                        <div className="grid grid-cols-1 gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                          <p><strong className="font-medium text-foreground">Equipment Name:</strong> {incident.equipmentInvolved}</p>
                          <p><strong className="font-medium text-foreground">Model:</strong> {incident.equipmentModel || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Equipment Number:</strong> {incident.equipmentNumber || "N/A"}</p>
                          <p><strong className="font-medium text-foreground">Medical Device Classified:</strong> {incident.isMedicalDevice || "No"}</p>
                          <p><strong className="font-medium text-foreground">Sent for Repair:</strong> {incident.equipmentSentForRepair ? "Yes" : "No"}</p>
                          <p><strong className="font-medium text-foreground">Withdrawn from Use:</strong> {incident.equipmentWithdrawn ? "Yes" : "No"}</p>
                          <p><strong className="font-medium text-foreground">Retained for Investigation:</strong> {incident.equipmentRetained ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="management" className="pt-4">
                <AdminManagementForm
                  incidentId={incident.id}
                  isAdmin={isManageAllowed}
                  loadingManagement={loadingManagement}
                  managementReport={managementReport}
                />
              </TabsContent>

              {isManageAllowed && (
                <TabsContent value="comments" className="space-y-4 pt-4">
                  {!hasReport ? (
                    <p className="rounded-lg border border-dashed bg-muted/10 p-4 text-center text-xs text-muted-foreground italic">
                      Add a management report before starting the comment thread.
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <MessageSquare className="h-4 w-4 text-primary" /> Timeline Comments ({comments.length})
                        </h3>
                        {!isAddingComment && (
                          <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingComment(true)} className="h-8 gap-1.5 text-xs">
                            <Plus className="h-3.5 w-3.5" /> Add Comment
                          </Button>
                        )}
                      </div>

                      {isAddingComment && (
                        <form onSubmit={handleCommentSubmit} className="animate-in fade-in slide-in-from-top-2 space-y-3 rounded-xl border bg-muted/20 p-4 duration-200">
                          <Textarea
                            required
                            placeholder="Type your clinical alignment or internal administrative note here..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="h-20 resize-none bg-background text-xs"
                          />
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingComment(false)} className="h-8 text-xs">
                              Cancel
                            </Button>
                            <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !commentText.trim()} className="h-8 px-4 text-xs">
                              {addCommentMutation.isPending ? "Saving..." : "Submit Comment"}
                            </Button>
                          </div>
                        </form>
                      )}

                      {loadingComments ? (
                        <div className="space-y-2">
                          <Skeleton className="h-14 w-full rounded-lg" />
                          <Skeleton className="h-14 w-full rounded-lg" />
                        </div>
                      ) : comments.length === 0 ? (
                        <p className="p-2 text-xs italic text-muted-foreground">No timeline comments logged yet.</p>
                      ) : (
                        <div className="max-h-72 space-y-3 overflow-y-auto pr-2">
                          {comments.map((c, i) => (
                            <div key={c.id || i} className="space-y-1 rounded-lg border bg-muted/40 p-3">
                              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                                <span className="flex items-center gap-1 font-semibold text-primary">
                                  <MessageSquare className="h-3 w-3" /> {c.commentUserName} · {c.commentUserRole}
                                </span>
                                <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}</span>
                              </div>
                              <p className="font-sans text-xs leading-relaxed text-foreground/90">{c.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              )}

              {isCoreAdmin && (
                <TabsContent value="audit" className="space-y-4 pt-4">
                  {loadingLogs ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : logsList.length === 0 ? (
                    <p className="rounded-lg border bg-muted/20 p-3 text-xs italic text-muted-foreground">
                      No administrative mutation history has been recorded for this dossier yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <div className="overflow-x-auto rounded-lg border bg-background">
                        <table className="w-full border-collapse text-left">
                          <thead>
                            <tr className="border-b bg-muted/50 text-xs font-semibold text-foreground">
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
                                const fieldChanges = getLogChanges(log.oldValue, log.newValue);
                                return (
                                  <tr key={log.id} className="transition-colors hover:bg-muted/10">
                                    <td className="p-2.5 pl-4 align-top whitespace-nowrap">
                                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                                    </td>
                                    <td className="p-2.5 align-top whitespace-nowrap font-medium text-foreground">
                                      {log.userName || `User ID: ${log.changedBy}`}
                                    </td>
                                    <td className="p-2.5 align-top whitespace-nowrap">
                                      <span className="rounded border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[10px] text-primary">
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="p-2.5 pr-4 align-top text-xs">
                                      {fieldChanges.length === 0 ? (
                                        <span className="italic text-muted-foreground/50">No field differences mapped</span>
                                      ) : (
                                        <ul className="list-disc space-y-1 pl-4 text-foreground/90">
                                          {fieldChanges.map((change, idx) => (
                                            <li key={idx} className="leading-normal">{change}</li>
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
                        <div className="flex items-center justify-between px-1 pt-1 text-xs">
                          <div className="text-muted-foreground">
                            Showing {(logPage - 1) * logsPerPage + 1}-{Math.min(logsList.length, logPage * logsPerPage)} of {logsList.length} revision statements
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button type="button" variant="outline" className="h-7 px-2.5 text-xs" disabled={logPage === 1} onClick={() => setLogPage((p) => p - 1)}>
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
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
