"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useForm, Controller, type Control, type UseFormRegister } from "react-hook-form";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { LogIn, Loader2, ShieldCheck } from "lucide-react";
import {
  incidentReportSchema,
  INCIDENT_REPORT_DEFAULTS,
  STEP_FIELDS,
  type IncidentReportValues,
} from "@/lib/schemas/incident-report";
import { useCreateIncidentReportMutation } from "@/lib/api/hooks/use-incident-report";
import { useAuthToken } from "@/lib/store/auth-store";
import { notify } from "@/lib/toast";
import { ThemeToggle } from "@/components/theme-toggle";

const STEP_LABELS = ["Reporter & Person", "Incident & Witnesses", "Causes & Equipment"];

function TextField({
  id,
  label,
  required,
  type = "text",
  placeholder,
  register,
  error,
  disabled,
  className,
}: {
  id: keyof IncidentReportValues;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<IncidentReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Field data-invalid={!!error} className={className}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        className="h-11 px-4 rounded-xl"
        {...register(id)}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function SelectField({
  id,
  label,
  required,
  control,
  error,
  disabled,
  placeholder,
  options,
}: {
  id: keyof IncidentReportValues;
  label: string;
  required?: boolean;
  control: Control<IncidentReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => (
          <Select
            value={typeof field.value === "string" ? field.value : ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={id} className="h-11 w-full rounded-xl px-4" aria-invalid={!!error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function CheckboxField({
  id,
  label,
  control,
  error,
  disabled,
  required,
}: {
  id: keyof IncidentReportValues;
  label: React.ReactNode;
  control: Control<IncidentReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={id}
      render={({ field }) => (
        <Field orientation="horizontal" data-invalid={!!error} className="items-start">
          <Checkbox
            id={id}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          <FieldLabel htmlFor={id} className="text-sm font-medium">
            {label} {required && <span className="text-destructive">*</span>}
          </FieldLabel>
        </Field>
      )}
    />
  );
}

export default function LandingReportPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [success, setSuccess] = useState(false);
  const token = useAuthToken();
  const createReport = useCreateIncidentReportMutation();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<IncidentReportValues>({
    resolver: zodResolver(incidentReportSchema),
    defaultValues: INCIDENT_REPORT_DEFAULTS,
    mode: "onSubmit",
  });

  const principalType = watch("principalType");
  const isLoading = createReport.isPending;

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep]);
    if (valid) setCurrentStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
  };

  const prevStep = () => setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const onSubmit = (values: IncidentReportValues) => {
    createReport.mutate(values, {
      onSuccess: () => {
        setSuccess(true);
        notify.success("Report submitted", "Your incident report has been logged into the system.");
        reset(INCIDENT_REPORT_DEFAULTS);
        setCurrentStep(1);
      },
      onError: (err) => {
        notify.apiError("Submission failed", err);
      },
    });
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col">
      <header className="w-full bg-background border-b sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img src="/images/rhv logo.png" alt="RHV Logo" width={90} height={24} className="h-6 w-auto" />
          <span>IncidentTracker</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {token ? (
            <Link href="/dashboard" passHref>
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login" passHref>
              <Button variant="outline" size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Personnel Login
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex justify-center items-start p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-4xl shadow-xl">
          <CardHeader className="space-y-1 text-center border-b pb-6">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              RHV Hospital Incident Reporting Form
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              Please use this form to safely record occurrences, injuries, damages, or near-miss
              scenarios immediately following an incident.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent className="space-y-6 pt-6">
              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Your incident report has been logged into the system.
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="secondary" className="font-semibold">
                    Step {currentStep} of 3
                  </Badge>
                  <span className="font-medium text-muted-foreground">{STEP_LABELS[currentStep - 1]}</span>
                </div>
                <Progress value={(currentStep / 3) * 100} />
              </div>

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Reporter Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField id="reporterName" label="Reporter Name" required placeholder="Jane Doe" register={register} error={errors.reporterName} disabled={isLoading} />
                      <TextField id="reporterDesignation" label="Designation / Job Title" required placeholder="Registered Nurse, Staff Physician..." register={register} error={errors.reporterDesignation} disabled={isLoading} />
                      <TextField id="reporterInfo" label="Contact Details / Info" required placeholder="Phone extension or email address" register={register} error={errors.reporterInfo} disabled={isLoading} />
                      <TextField id="reporterDate" label="Date of Report" required type="date" register={register} error={errors.reporterDate} disabled={isLoading} />
                      <div className="md:col-span-2">
                        <CheckboxField
                          id="signature"
                          control={control}
                          error={errors.signature}
                          disabled={isLoading}
                          label="I confirm that the factual particulars recorded here are true and accurate"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Principal Person Involved (Subject)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField id="principalName" label="Full Name" required placeholder="John Smith" register={register} error={errors.principalName} disabled={isLoading} />
                      <SelectField
                        id="principalGender"
                        label="Gender"
                        required
                        control={control}
                        error={errors.principalGender}
                        disabled={isLoading}
                        placeholder="Select gender"
                        options={[
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                        ]}
                      />
                      <TextField id="principalDob" label="Date of Birth" required type="date" register={register} error={errors.principalDob} disabled={isLoading} />
                      <SelectField
                        id="principalType"
                        label="Person Classification"
                        required
                        control={control}
                        error={errors.principalType}
                        disabled={isLoading}
                        placeholder="Select type"
                        options={[
                          { value: "patient", label: "Patient" },
                          { value: "staff", label: "Staff" },
                          { value: "visiting consultant", label: "Visiting Consultant" },
                          { value: "other", label: "Other" },
                        ]}
                      />

                      {principalType === "patient" && (
                        <>
                          <TextField id="patientId" label="Patient ID / Case Reference" placeholder="PT-12345" register={register} disabled={isLoading} />
                          <TextField id="patientWardDept" label="Patient Ward / Department" placeholder="ICU, Ward 4A..." register={register} disabled={isLoading} />
                        </>
                      )}

                      {principalType === "staff" && (
                        <>
                          <TextField id="staffJobTitle" label="Staff Job Title" placeholder="Clinical Lead, Lab Tech..." register={register} disabled={isLoading} />
                          <TextField id="staffPhone" label="Staff Contact Phone" placeholder="+1555-0199" register={register} disabled={isLoading} />
                          <TextField id="staffPlaceOfWork" label="Place of Work / Unit" placeholder="Main Laboratory" register={register} disabled={isLoading} />
                          <TextField id="staffSite" label="Staff Site location" placeholder="North Wing Facility" register={register} disabled={isLoading} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Incident Location & Timings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField id="dateOfIncident" label="Date of Incident" required type="date" register={register} error={errors.dateOfIncident} disabled={isLoading} />
                      <TextField id="timeOfIncident" label="Time of Incident" required type="time" register={register} error={errors.timeOfIncident} disabled={isLoading} />
                      <TextField id="locationOfIncident" label="Specific Location" required placeholder="Main Lobby Room B, Elevators..." register={register} error={errors.locationOfIncident} disabled={isLoading} />
                      <TextField id="incidentWardDept" label="Incident Ward / Dept" required placeholder="Emergency Department, Pediatrics..." register={register} error={errors.incidentWardDept} disabled={isLoading} />
                      <SelectField
                        id="severityLevel"
                        label="Assessed Severity Level"
                        required
                        control={control}
                        error={errors.severityLevel}
                        disabled={isLoading}
                        placeholder="Select severity"
                        options={[
                          { value: "near miss", label: "Near Miss" },
                          { value: "minor", label: "Minor" },
                          { value: "major", label: "Major" },
                          { value: "critical", label: "Critical" },
                        ]}
                      />
                      <SelectField
                        id="incidentStatus"
                        label="Initial Handling Status"
                        required
                        control={control}
                        error={errors.incidentStatus}
                        disabled={isLoading}
                        placeholder="Select status"
                        options={[
                          { value: "unresolved", label: "Unresolved" },
                          { value: "inprogress", label: "In Progress" },
                          { value: "resolved", label: "Resolved" },
                        ]}
                      />
                      <div className="flex items-center">
                        <CheckboxField
                          id="isNearMiss"
                          control={control}
                          disabled={isLoading}
                          label="Classify definitively as a Near-Miss scenario"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Witnesses Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField className="md:col-span-2" id="witnesses" label="Witness Name(s)" placeholder="Separate names with commas if multiple" register={register} disabled={isLoading} />
                      <TextField id="witnessType" label="Witness Category / Type" placeholder="Visitor, Colleague, Patient relative..." register={register} disabled={isLoading} />
                      <TextField id="witnessWardDept" label="Witness Ward / Department" placeholder="Radiology, Outpatient clinic..." register={register} disabled={isLoading} />
                      <TextField id="witnessJobTitle" label="Witness Designation / Job" placeholder="Security Guard, Resident Physician..." register={register} disabled={isLoading} />
                      <TextField id="witnessPhone" label="Witness Phone / Contact" placeholder="Phone extension or cell details" register={register} disabled={isLoading} />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Situational Description & Causes
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextField id="causeGroup" label="Cause Classification Group" required placeholder="Clinical Error, Operational Hazard, Technical Fault..." register={register} error={errors.causeGroup} disabled={isLoading} />
                        <TextField id="prescribingDoctor" label="Prescribing Doctor" placeholder="Dr. Alexander Pierce" register={register} disabled={isLoading} />
                      </div>
                      <Field data-invalid={!!errors.causes}>
                        <FieldLabel htmlFor="causes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Factual Description of Causes / Incident Details <span className="text-destructive">*</span>
                        </FieldLabel>
                        <Textarea id="causes" rows={4} placeholder="Provide a precise, factual and chronological timeline outlining exactly what happened..." disabled={isLoading} aria-invalid={!!errors.causes} className="rounded-xl" {...register("causes")} />
                        <FieldError errors={[errors.causes]} />
                      </Field>
                      <TextField id="treatmentReceived" label="Immediate Medical Treatment Received / Care Actions Provided" required placeholder="First aid given, transferred to trauma unit, nil required..." register={register} error={errors.treatmentReceived} disabled={isLoading} />
                      <TextField id="peopleInvolved" label="Other People Involved / Affected" required placeholder="Names or identifying details of other persons involved" register={register} error={errors.peopleInvolved} disabled={isLoading} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Asset & Equipment Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField id="equipmentInvolved" label="Equipment Involved Name / Context" required placeholder="Infusion Pump, Defibrillator, None..." register={register} error={errors.equipmentInvolved} disabled={isLoading} />
                      <TextField id="equipmentModel" label="Equipment Model" placeholder="Model series / manufacturer info" register={register} disabled={isLoading} />
                      <TextField id="equipmentNumber" label="Equipment Serial / Asset ID Number" placeholder="ASN-992182" register={register} disabled={isLoading} />
                      <TextField id="isMedicalDevice" label="Is this a certified medical device?" placeholder="Yes / No / Unsure" register={register} disabled={isLoading} />
                      <div className="md:col-span-2 space-y-3 pt-2 border-t border-dashed mt-2">
                        <FieldDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Current Equipment Status Actions
                        </FieldDescription>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <CheckboxField id="equipmentSentForRepair" control={control} disabled={isLoading} label="Sent for Repair" />
                          <CheckboxField id="equipmentWithdrawn" control={control} disabled={isLoading} label="Withdrawn from Use" />
                          <CheckboxField id="equipmentRetained" control={control} disabled={isLoading} label="Retained for Audit" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between gap-3">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading}>
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {currentStep < 3 ? (
                  <Button type="button" onClick={nextStep} disabled={isLoading}>
                    Next Step
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting Report...
                      </>
                    ) : (
                      "Submit Incident Report"
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
