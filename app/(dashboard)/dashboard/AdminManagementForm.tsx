"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus } from "lucide-react";
import { IncidentManagement, IncidentReport } from "./types";

interface AdminManagementFormProps {
  isAdmin: boolean;
  loadingManagement: boolean;
  managementReport: IncidentManagement | null;
  isAddingManagement: boolean;
  submittingManagement: boolean;
  mgmtForm: Partial<IncidentManagement>;
  selectedIncident: IncidentReport;
  onFormChange: (updated: Partial<IncidentManagement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
}

export function AdminManagementForm({
  isAdmin,
  loadingManagement,
  managementReport,
  isAddingManagement,
  submittingManagement,
  mgmtForm,
  onFormChange,
  onSubmit,
  onStartAdding,
  onCancelAdding,
}: AdminManagementFormProps) {
  if (loadingManagement) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" /> Loading
        administrative details...
      </div>
    );
  }

  // 1. Any user can view the management report if it exists
  if (managementReport) {
    return (
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
                {managementReport.informedSeniorManager ? "Yes" : "No"}
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
                    {managementReport.ohsAbsenceOver3Days ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong className="text-foreground font-medium">
                      Violence / Danger:
                    </strong>{" "}
                    {managementReport.ohsActOfViolenceOrDanger ? "Yes" : "No"}
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
                Combined Risk Product Rating: {managementReport.riskRating}
              </div>
            </div>
          </div>
          <div className="text-sm bg-emerald-800 text-white p-4 rounded-xl space-y-2 shadow-sm">
            <span className="text-xs font-semibold tracking-wider uppercase block border-b border-white/20 pb-1">
              Sign-Off Status
            </span>
            <p className="text-white/90">
              <strong>Manager Name:</strong> {managementReport.managerName}
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
    );
  }

  // 2. Only Admins can see the creation/empty prompt button if no report exists
  if (isAdmin && !isAddingManagement) {
    return (
      <div className="text-center py-8 border border-dashed rounded-xl bg-muted/10">
        <p className="text-sm text-muted-foreground mb-3">
          No administrative management report has been generated for this
          record.
        </p>
        <Button size="sm" onClick={onStartAdding} className="text-xs h-8">
          <Plus className="h-4 w-4 mr-1" /> Add Management Report
        </Button>
      </div>
    );
  }

  // 3. Only Admins can see and access the configuration form layout
  if (isAdmin && isAddingManagement) {
    return (
      <form
        onSubmit={onSubmit}
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
                  onFormChange({ ...mgmtForm, impactOnService: e.target.value })
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
                  onFormChange({
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
                  onFormChange({ ...mgmtForm, lessonsLearned: e.target.value })
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
                  onFormChange({
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
                  onFormChange({
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
            {(
              [
                { key: "informedPatient", label: "Patient Informed" },
                { key: "informedRelative", label: "Relative Informed" },
                {
                  key: "informedSeniorManager",
                  label: "Senior Manager Notified",
                },
                { key: "informedPharmacist", label: "Pharmacist Informed" },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer text-muted-foreground"
              >
                <input
                  type="checkbox"
                  checked={!!mgmtForm[key]}
                  onChange={(e) =>
                    onFormChange({ ...mgmtForm, [key]: e.target.checked })
                  }
                  className="rounded accent-emerald-600"
                />
                {label}
              </label>
            ))}
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
                  onFormChange({
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
                  onFormChange({ ...mgmtForm, informedOther: e.target.value })
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
                  onFormChange({
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
                  onFormChange({
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
            {(
              [
                {
                  key: "ohsAbsenceOver3Days",
                  label: "Staff Absence Over 3 Days",
                },
                {
                  key: "ohsActOfViolenceOrDanger",
                  label: "Act of Violence or Peril Danger",
                },
                {
                  key: "ohsHospitalizationOver24Hours",
                  label: "Hospitalization > 24 Hours",
                },
              ] as const
            ).map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer text-muted-foreground"
              >
                <input
                  type="checkbox"
                  checked={!!mgmtForm[key]}
                  onChange={(e) =>
                    onFormChange({ ...mgmtForm, [key]: e.target.checked })
                  }
                  className="rounded accent-emerald-600"
                />
                {label}
              </label>
            ))}
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
                  onFormChange({ ...mgmtForm, ohsStaffName: e.target.value })
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
                  onFormChange({ ...mgmtForm, ohsStaffDob: e.target.value })
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
                  onFormChange({ ...mgmtForm, ohsStaffAddress: e.target.value })
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
                  onFormChange({ ...mgmtForm, managerName: e.target.value })
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
                  onFormChange({
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
                  onFormChange({ ...mgmtForm, managerDate: e.target.value })
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
                    onFormChange({
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
            onClick={onCancelAdding}
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
    );
  }

  // 4. Fallback for non-admins if no report is filed yet
  return (
    <div className="text-center py-6">
      <p className="text-sm text-muted-foreground">
        No management report has been registered for this incident.
      </p>
    </div>
  );
}
