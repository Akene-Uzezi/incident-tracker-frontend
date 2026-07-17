"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { RefreshCw, Plus, Edit2, CalendarIcon } from "lucide-react";
import { IncidentManagement } from "@/lib/types";
import { managementSchema, type ManagementValues } from "@/lib/schemas/management";
import {
  useCreateManagementMutation,
  useUpdateManagementMutation,
} from "@/lib/api/hooks/use-management";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function CompactDateField({
  label,
  value,
  onChange,
  required,
  error,
  maxDate,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: { message?: string };
  maxDate?: Date;
}) {
  const selected = parseIsoDate(value);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel className="text-xs font-medium text-foreground">
        {label} {required && "*"}
      </FieldLabel>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full justify-start gap-1.5 bg-background px-2.5 text-xs font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {selected
              ? selected.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
              : "Select date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? maxDate}
            endMonth={maxDate}
            disabled={maxDate ? { after: maxDate } : undefined}
            onSelect={(date) => onChange(date ? toIsoDate(date) : "")}
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={[error]} />
    </Field>
  );
}

const DEFAULT_VALUES: ManagementValues = {
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

interface AdminManagementFormProps {
  incidentId: number;
  isAdmin: boolean;
  loadingManagement: boolean;
  managementReport: IncidentManagement | null;
}

export function AdminManagementForm({
  incidentId,
  isAdmin,
  loadingManagement,
  managementReport,
}: AdminManagementFormProps) {
  const [mode, setMode] = useState<"idle" | "add" | "edit">("idle");
  const createMutation = useCreateManagementMutation(incidentId);
  const updateMutation = useUpdateManagementMutation(incidentId);
  const submitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ManagementValues>({
    resolver: zodResolver(managementSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const riskSeverity = watch("riskSeverity");
  const riskLikelihood = watch("riskLikelihood");
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    setValue("riskRating", (Number(riskSeverity) || 0) * (Number(riskLikelihood) || 0));
  }, [riskSeverity, riskLikelihood, setValue]);

  const startAdding = () => {
    reset(DEFAULT_VALUES);
    setMode("add");
  };

  const startEditing = () => {
    if (!managementReport) return;
    reset({
      ...DEFAULT_VALUES,
      ...managementReport,
      managerDate: managementReport.managerDate
        ? managementReport.managerDate.split("T")[0]
        : DEFAULT_VALUES.managerDate,
    });
    setMode("edit");
  };

  const onSubmit = (values: ManagementValues) => {
    const mutation = mode === "edit" ? updateMutation : createMutation;
    mutation.mutate(values, {
      onSuccess: () => {
        notify.success(mode === "edit" ? "Management report updated" : "Management report saved");
        setMode("idle");
      },
      onError: (err) => notify.apiError("Couldn't save management report", err),
    });
  };

  if (loadingManagement) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
        <RefreshCw className="h-4 w-4 animate-spin text-primary" /> Loading administrative details...
      </div>
    );
  }

  // 1. Static Display Mode
  if (managementReport && mode !== "edit") {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {isAdmin && (
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={startEditing} className="h-8 gap-1.5 text-xs">
              <Edit2 className="h-3.5 w-3.5" /> Edit Management Report
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 rounded-xl border border-primary/15 bg-primary/[0.02] p-5 md:grid-cols-3">
          <div className="space-y-4 md:col-span-2">
            <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Management Overview
            </h3>
            <div className="grid grid-cols-1 gap-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Impact on Service</span>
                <p className="mt-1 rounded-lg border bg-background p-2.5 text-xs text-foreground">
                  {managementReport.impactOnService || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Contributory Factors</span>
                <p className="mt-1 rounded-lg border bg-background p-2.5 text-xs text-foreground">
                  {managementReport.contributoryFactors || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Actions / Outcomes</span>
                <p className="mt-1 rounded-lg border bg-background p-2.5 text-xs text-foreground">
                  {managementReport.actionsTakenOutcomes || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Recommendations</span>
                <p className="mt-1 rounded-lg border bg-background p-2.5 text-xs text-foreground">
                  {managementReport.recommendations || "N/A"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs font-medium text-muted-foreground">Lessons Learned</span>
                <p className="mt-1 rounded-lg border bg-background p-2.5 text-xs text-foreground">
                  {managementReport.lessonsLearned || "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-2 border-t pt-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                Communication Metrics
              </span>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid-cols-4">
                <p><strong className="font-medium text-foreground">Patient Informed:</strong> {managementReport.informedPatient ? "Yes" : "No"}</p>
                <p><strong className="font-medium text-foreground">Relative Informed:</strong> {managementReport.informedRelative ? "Yes" : "No"}</p>
                <p><strong className="font-medium text-foreground">Senior Manager:</strong> {managementReport.informedSeniorManager ? "Yes" : "No"}</p>
                <p><strong className="font-medium text-foreground">Pharmacist Informed:</strong> {managementReport.informedPharmacist ? "Yes" : "No"}</p>
              </div>
              {(managementReport.policeIncidentNumber || managementReport.informedOther) && (
                <div className="grid grid-cols-1 gap-2 pt-1 text-sm text-muted-foreground sm:grid-cols-2">
                  {managementReport.policeIncidentNumber && (
                    <p><strong className="font-medium text-foreground">Police Incident Number:</strong> {managementReport.policeIncidentNumber}</p>
                  )}
                  {managementReport.informedOther && (
                    <p><strong className="font-medium text-foreground">Other Party Informed:</strong> {managementReport.informedOther}</p>
                  )}
                </div>
              )}
            </div>

            {(managementReport.ohsStaffName || managementReport.ohsAbsenceOver3Days) && (
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Occupational Health & Safety Matrix
                </span>
                <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <p><strong className="font-medium text-foreground">Absence &gt; 3 Days:</strong> {managementReport.ohsAbsenceOver3Days ? "Yes" : "No"}</p>
                  <p><strong className="font-medium text-foreground">Violence / Danger:</strong> {managementReport.ohsActOfViolenceOrDanger ? "Yes" : "No"}</p>
                  <p><strong className="font-medium text-foreground">Hospitalized &gt; 24h:</strong> {managementReport.ohsHospitalizationOver24Hours ? "Yes" : "No"}</p>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-1 text-sm text-muted-foreground sm:grid-cols-3">
                  <p><strong className="font-medium text-foreground">Target Staff Name:</strong> {managementReport.ohsStaffName || "N/A"}</p>
                  <p><strong className="font-medium text-foreground">Staff DOB:</strong> {managementReport.ohsStaffDob || "N/A"}</p>
                  <p><strong className="font-medium text-foreground">Home Address:</strong> {managementReport.ohsStaffAddress || "N/A"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-4 border-primary/10 pl-0 md:border-l md:pl-6">
            <div className="rounded-lg border bg-background p-3 text-sm text-muted-foreground space-y-1.5">
              <p><strong className="font-medium text-foreground">Risk Severity Score:</strong> {managementReport.riskSeverity || "0"} / 5</p>
              <p><strong className="font-medium text-foreground">Risk Likelihood Score:</strong> {managementReport.riskLikelihood || "0"} / 5</p>
              <div className="mt-2 border-t pt-2 font-semibold text-rose-600">
                Combined Risk Rating: {managementReport.riskRating || "N/A"}
              </div>
            </div>
            <div className="space-y-2 rounded-xl bg-primary p-4 text-sm text-primary-foreground shadow-sm">
              <span className="block border-b border-white/20 pb-1 text-xs font-semibold uppercase tracking-wider">
                Sign-Off Status
              </span>
              <p className="opacity-90"><strong>Manager Name:</strong> {managementReport.managerName}</p>
              <p className="opacity-90"><strong>Designation:</strong> {managementReport.managerDesignation}</p>
              <p className="opacity-90"><strong>Authorization Date:</strong> {managementReport.managerDate}</p>
              <span className="mt-1 inline-block rounded bg-black/20 px-2 py-0.5 text-[10px] font-semibold">
                Verified Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty-state prompt
  if (isAdmin && mode === "idle" && !managementReport) {
    return (
      <div className="animate-in fade-in rounded-xl border border-dashed bg-muted/10 py-8 text-center duration-200">
        <p className="mb-3 text-sm text-muted-foreground">
          No administrative management report has been generated for this record.
        </p>
        <Button size="sm" onClick={startAdding} className="h-8 text-xs">
          <Plus className="mr-1 h-4 w-4" /> Add Management Report
        </Button>
      </div>
    );
  }

  // 3. Add / Edit form
  if (isAdmin && (mode === "add" || mode === "edit")) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="animate-in fade-in max-w-full space-y-6 rounded-xl border bg-muted/40 p-5 duration-200"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operational Evaluation Metrics
            </h3>
            <Field data-invalid={!!errors.impactOnService}>
              <FieldLabel className="text-xs font-medium text-foreground">Impact on Service *</FieldLabel>
              <Textarea className="h-16 bg-background text-xs" {...register("impactOnService")} />
              <FieldError errors={[errors.impactOnService]} />
            </Field>
            <Field data-invalid={!!errors.contributoryFactors}>
              <FieldLabel className="text-xs font-medium text-foreground">Contributory Factors *</FieldLabel>
              <Textarea className="h-16 bg-background text-xs" {...register("contributoryFactors")} />
              <FieldError errors={[errors.contributoryFactors]} />
            </Field>
            <Field data-invalid={!!errors.lessonsLearned}>
              <FieldLabel className="text-xs font-medium text-foreground">Lessons Learned *</FieldLabel>
              <Textarea className="h-16 bg-background text-xs" {...register("lessonsLearned")} />
              <FieldError errors={[errors.lessonsLearned]} />
            </Field>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Remedial Action Strategies
            </h3>
            <Field data-invalid={!!errors.actionsTakenOutcomes}>
              <FieldLabel className="text-xs font-medium text-foreground">Actions / Outcomes *</FieldLabel>
              <Textarea className="h-16 bg-background text-xs" {...register("actionsTakenOutcomes")} />
              <FieldError errors={[errors.actionsTakenOutcomes]} />
            </Field>
            <Field data-invalid={!!errors.recommendations}>
              <FieldLabel className="text-xs font-medium text-foreground">Recommendations *</FieldLabel>
              <Textarea className="h-16 bg-background text-xs" {...register("recommendations")} />
              <FieldError errors={[errors.recommendations]} />
            </Field>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stakeholder Notifications Log
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            {(
              [
                { key: "informedPatient", label: "Patient Informed" },
                { key: "informedRelative", label: "Relative Informed" },
                { key: "informedSeniorManager", label: "Senior Manager Notified" },
                { key: "informedPharmacist", label: "Pharmacist Informed" },
              ] as const
            ).map(({ key, label }) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                    {label}
                  </label>
                )}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">Police Incident Number</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("policeIncidentNumber")} />
            </Field>
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">Other Informed Parties</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("informedOther")} />
            </Field>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Risk Factor Assessment Rating
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Field data-invalid={!!errors.riskSeverity}>
              <FieldLabel className="text-xs font-medium text-foreground">Severity Rank (1-5) *</FieldLabel>
              <Input type="number" min={1} max={5} className="h-9 bg-background text-xs" {...register("riskSeverity", { valueAsNumber: true })} />
              <FieldError errors={[errors.riskSeverity]} />
            </Field>
            <Field data-invalid={!!errors.riskLikelihood}>
              <FieldLabel className="text-xs font-medium text-foreground">Likelihood Rank (1-5) *</FieldLabel>
              <Input type="number" min={1} max={5} className="h-9 bg-background text-xs" {...register("riskLikelihood", { valueAsNumber: true })} />
              <FieldError errors={[errors.riskLikelihood]} />
            </Field>
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">Calculated Rating Product</FieldLabel>
              <Input
                type="number"
                readOnly
                value={(Number(riskSeverity) || 0) * (Number(riskLikelihood) || 0)}
                className="h-9 bg-muted text-xs font-semibold text-rose-600"
              />
            </Field>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Occupational Health & Safety Regulatory Compliance
          </h3>
          <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
            {(
              [
                { key: "ohsAbsenceOver3Days", label: "Staff Absence Over 3 Days" },
                { key: "ohsActOfViolenceOrDanger", label: "Act of Violence or Peril Danger" },
                { key: "ohsHospitalizationOver24Hours", label: "Hospitalization > 24 Hours" },
              ] as const
            ).map(({ key, label }) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                    {label}
                  </label>
                )}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">OHS Impacted Staff Name</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("ohsStaffName")} />
            </Field>
            <Controller
              control={control}
              name="ohsStaffDob"
              render={({ field }) => (
                <CompactDateField
                  label="Staff Date of Birth"
                  value={field.value || ""}
                  onChange={field.onChange}
                  maxDate={today}
                />
              )}
            />
            <Field>
              <FieldLabel className="text-xs font-medium text-foreground">Staff Home Address</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("ohsStaffAddress")} />
            </Field>
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h3 className="border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Executive Authorization Sign-Off
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.managerName}>
              <FieldLabel className="text-xs font-medium text-foreground">Manager Name *</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("managerName")} />
              <FieldError errors={[errors.managerName]} />
            </Field>
            <Field data-invalid={!!errors.managerDesignation}>
              <FieldLabel className="text-xs font-medium text-foreground">Corporate Designation *</FieldLabel>
              <Input className="h-9 bg-background text-xs" {...register("managerDesignation")} />
              <FieldError errors={[errors.managerDesignation]} />
            </Field>
            <Controller
              control={control}
              name="managerDate"
              render={({ field }) => (
                <CompactDateField
                  label="Authorization Date"
                  required
                  value={field.value || ""}
                  onChange={field.onChange}
                  error={errors.managerDate}
                  maxDate={today}
                />
              )}
            />
            <Controller
              control={control}
              name="managerSignature"
              render={({ field }) => (
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs">
                    <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                    <span className="font-medium text-rose-600">Acknowledge Legal Signature Binding *</span>
                  </label>
                </div>
              )}
            />
          </div>
          <FieldError errors={[errors.managerSignature]} />
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button type="button" variant="ghost" onClick={() => setMode("idle")} className="h-9 text-xs">
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="h-9 px-4 text-xs font-medium">
            {submitting ? "Saving..." : mode === "edit" ? "Update Management Log" : "Save Management Log"}
          </Button>
        </div>
      </form>
    );
  }

  // 4. Fallback
  return (
    <div className="py-6 text-center">
      <p className="text-sm text-muted-foreground">No management report has been registered for this incident.</p>
    </div>
  );
}
