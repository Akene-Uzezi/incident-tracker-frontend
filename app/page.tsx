"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm, Controller, type Control, type UseFormRegister } from "react-hook-form";
import type { FieldError as RHFFieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Field, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import {
  LogIn,
  Loader2,
  ShieldCheck,
  CalendarIcon,
  ClockIcon,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
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
import { LoadingScreen } from "@/components/loading-screen";
import { cn } from "@/lib/utils";

const STEP_LABELS = ["Reporter & Person", "Incident & Witnesses", "Causes & Equipment"];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseIsoDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDisplayTime(value?: string) {
  if (!value || !value.includes(":")) return "";
  const [h, m] = value.split(":");
  const hour = parseInt(h, 10);
  if (Number.isNaN(hour)) return "";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));

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
        className="h-11 rounded-xl px-4"
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

function DateField({
  id,
  label,
  required,
  control,
  error,
  disabled,
  placeholder = "Pick a date",
  maxDate,
  fromYear,
}: {
  id: keyof IncidentReportValues;
  label: string;
  required?: boolean;
  control: Control<IncidentReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
  placeholder?: string;
  maxDate?: Date;
  fromYear?: number;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => {
          const selected = typeof field.value === "string" ? parseIsoDate(field.value) : undefined;
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={!!error}
                  className={cn(
                    "h-11 w-full justify-start gap-2 rounded-xl px-4 font-normal",
                    !selected && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {selected ? formatDisplayDate(selected) : placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selected}
                  defaultMonth={selected ?? maxDate}
                  startMonth={fromYear ? new Date(fromYear, 0) : undefined}
                  endMonth={maxDate}
                  disabled={maxDate ? { after: maxDate } : undefined}
                  onSelect={(date) => field.onChange(date ? toIsoDate(date) : "")}
                />
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function TimeField({
  id,
  label,
  required,
  control,
  error,
  disabled,
}: {
  id: keyof IncidentReportValues;
  label: string;
  required?: boolean;
  control: Control<IncidentReportValues>;
  error?: RHFFieldError;
  disabled?: boolean;
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Controller
        control={control}
        name={id}
        render={({ field }) => {
          const raw = typeof field.value === "string" ? field.value : "";
          const [h, m] = raw.includes(":") ? raw.split(":") : ["", ""];
          const display = formatDisplayTime(raw);
          const setPart = (part: "h" | "m", value: string) => {
            const nh = part === "h" ? value : h || "00";
            const nm = part === "m" ? value : m || "00";
            field.onChange(`${nh}:${nm}`);
          };
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={id}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  aria-invalid={!!error}
                  className={cn(
                    "h-11 w-full justify-start gap-2 rounded-xl px-4 font-normal",
                    !display && "text-muted-foreground"
                  )}
                >
                  <ClockIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {display || "Select time"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Hour
                    </span>
                    <ScrollArea className="h-48 w-14 rounded-lg border">
                      <div className="flex flex-col gap-0.5 p-1">
                        {HOURS.map((hh) => (
                          <button
                            key={hh}
                            type="button"
                            onClick={() => setPart("h", hh)}
                            className={cn(
                              "cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent",
                              h === hh && "bg-primary text-primary-foreground hover:bg-primary"
                            )}
                          >
                            {hh}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <span className="mt-6 text-lg font-semibold text-muted-foreground">:</span>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                      Minute
                    </span>
                    <ScrollArea className="h-48 w-14 rounded-lg border">
                      <div className="flex flex-col gap-0.5 p-1">
                        {MINUTES.map((mm) => (
                          <button
                            key={mm}
                            type="button"
                            onClick={() => setPart("m", mm)}
                            className={cn(
                              "cursor-pointer rounded-md px-2 py-1.5 text-center text-sm transition-colors hover:bg-accent",
                              m === mm && "bg-primary text-primary-foreground hover:bg-primary"
                            )}
                          >
                            {mm}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          );
        }}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {STEP_LABELS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3;
        const isComplete = currentStep > step;
        const isActive = currentStep === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300",
                  isComplete || isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step}
              </motion.div>
              <span
                className={cn(
                  "hidden text-[11px] font-medium whitespace-nowrap sm:block",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {step < 3 && (
              <div className="relative h-0.5 w-full flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  initial={false}
                  animate={{ width: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

export default function LandingReportPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [success, setSuccess] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const token = useAuthToken();
  const createReport = useCreateIncidentReportMutation();
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const t = setTimeout(() => setAppReady(true), 1400);
    return () => clearTimeout(t);
  }, []);

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
    defaultValues: { ...INCIDENT_REPORT_DEFAULTS, reporterDate: todayIsoDate() },
    mode: "onSubmit",
  });

  const principalType = watch("principalType");
  const isLoading = createReport.isPending;

  const nextStep = async () => {
    const valid = await trigger(STEP_FIELDS[currentStep]);
    if (valid) {
      setDirection(1);
      setCurrentStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  };

  const onSubmit = (values: IncidentReportValues) => {
    createReport.mutate(
      { ...values, reporterDate: todayIsoDate() },
      {
        onSuccess: () => {
          setSuccess(true);
          notify.success("Report submitted", "Your incident report has been logged into the system.");
          reset({ ...INCIDENT_REPORT_DEFAULTS, reporterDate: todayIsoDate() });
          setDirection(-1);
          setCurrentStep(1);
        },
        onError: (err) => {
          notify.apiError("Submission failed", err);
        },
      }
    );
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [success]);

  return (
    <div className="min-h-screen w-full bg-background">
      <AnimatePresence>{!appReady && <LoadingScreen />}</AnimatePresence>

      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/60 lg:px-8">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
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

        <main className="relative flex flex-1 items-start justify-center overflow-hidden p-4 sm:p-6 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
          />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl"
          >
            <Card className="w-full gap-0 overflow-visible rounded-3xl py-0 shadow-xl ring-1 ring-foreground/10">
              <CardHeader className="space-y-1.5 border-b px-6 py-7 text-center sm:px-10">
                <span className="mx-auto mb-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Safety Reporting
                </span>
                <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  RHV Hospital Incident Reporting Form
                </CardTitle>
                <CardDescription className="mx-auto max-w-2xl text-sm sm:text-base">
                  Please use this form to safely record occurrences, injuries, damages, or near-miss
                  scenarios immediately following an incident.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <CardContent className="space-y-6 px-6 pt-6 sm:px-10">
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                        animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </motion.span>
                          Your incident report has been logged into the system.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Stepper currentStep={currentStep} />

                  <AnimatePresence mode="wait" custom={direction} initial={false}>
                    <motion.div
                      key={currentStep}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Reporter Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <TextField id="reporterName" label="Reporter Name" required placeholder="Jane Doe" register={register} error={errors.reporterName} disabled={isLoading} />
                              <TextField id="reporterDesignation" label="Designation / Job Title" required placeholder="Registered Nurse, Staff Physician..." register={register} error={errors.reporterDesignation} disabled={isLoading} />
                              <TextField className="md:col-span-2" id="reporterInfo" label="Contact Details / Info" required placeholder="Phone extension or email address" register={register} error={errors.reporterInfo} disabled={isLoading} />
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Principal Person Involved (Subject)
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                              <DateField
                                id="principalDob"
                                label="Date of Birth"
                                required
                                control={control}
                                error={errors.principalDob}
                                disabled={isLoading}
                                placeholder="Select date of birth"
                                maxDate={today}
                                fromYear={today.getFullYear() - 120}
                              />
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Incident Location & Timings
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <DateField
                                id="dateOfIncident"
                                label="Date of Incident"
                                required
                                control={control}
                                error={errors.dateOfIncident}
                                disabled={isLoading}
                                placeholder="Select date of incident"
                                maxDate={today}
                                fromYear={today.getFullYear() - 3}
                              />
                              <TimeField
                                id="timeOfIncident"
                                label="Time of Incident"
                                required
                                control={control}
                                error={errors.timeOfIncident}
                                disabled={isLoading}
                              />
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Witnesses Information
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Situational Description & Causes
                            </h3>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-muted-foreground">
                              Asset & Equipment Management
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <TextField id="equipmentInvolved" label="Equipment Involved Name / Context" required placeholder="Infusion Pump, Defibrillator, None..." register={register} error={errors.equipmentInvolved} disabled={isLoading} />
                              <TextField id="equipmentModel" label="Equipment Model" placeholder="Model series / manufacturer info" register={register} disabled={isLoading} />
                              <TextField id="equipmentNumber" label="Equipment Serial / Asset ID Number" placeholder="ASN-992182" register={register} disabled={isLoading} />
                              <TextField id="isMedicalDevice" label="Is this a certified medical device?" placeholder="Yes / No / Unsure" register={register} disabled={isLoading} />
                              <div className="mt-2 space-y-3 border-t border-dashed pt-2 md:col-span-2">
                                <FieldDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                  Current Equipment Status Actions
                                </FieldDescription>
                                <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-3">
                                  <CheckboxField id="equipmentSentForRepair" control={control} disabled={isLoading} label="Sent for Repair" />
                                  <CheckboxField id="equipmentWithdrawn" control={control} disabled={isLoading} label="Withdrawn from Use" />
                                  <CheckboxField id="equipmentRetained" control={control} disabled={isLoading} label="Retained for Audit" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="flex justify-between gap-3 px-6 py-5 sm:px-10">
                  <div className="flex gap-2">
                    {currentStep > 1 && (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="button" variant="outline" onClick={prevStep} disabled={isLoading} className="gap-1.5">
                          <ArrowLeft className="h-4 w-4" />
                          Previous
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {currentStep < 3 ? (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="button" onClick={nextStep} disabled={isLoading} className="gap-1.5">
                          Next Step
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
                        <Button type="submit" disabled={isLoading} className="gap-1.5">
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Submitting Report...
                            </>
                          ) : (
                            "Submit Incident Report"
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
