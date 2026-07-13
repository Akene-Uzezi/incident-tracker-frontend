"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LogIn, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function LandingReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Step 1: Reporter Details
  const [reporterName, setReporterName] = useState("");
  const [reporterDesignation, setReporterDesignation] = useState("");
  const [reporterInfo, setReporterInfo] = useState("");
  const [reporterDate, setReporterDate] = useState("");
  const [signature, setSignature] = useState(false);

  // Step 1: Principal Person Involved Details
  const [principalName, setPrincipalName] = useState("");
  const [principalGender, setPrincipalGender] = useState("");
  const [principalDob, setPrincipalDob] = useState("");
  const [principalType, setPrincipalType] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientWardDept, setPatientWardDept] = useState("");
  const [staffJobTitle, setStaffJobTitle] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPlaceOfWork, setStaffPlaceOfWork] = useState("");
  const [staffSite, setStaffSite] = useState("");

  // Step 2: Incident Specifics & Witnesses
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [timeOfIncident, setTimeOfIncident] = useState("");
  const [locationOfIncident, setLocationOfIncident] = useState("");
  const [incidentWardDept, setIncidentWardDept] = useState("");
  const [severityLevel, setSeverityLevel] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("unresolved");
  const [isNearMiss, setIsNearMiss] = useState(false);

  const [witnesses, setWitnesses] = useState("");
  const [witnessType, setWitnessType] = useState("");
  const [witnessWardDept, setWitnessWardDept] = useState("");
  const [witnessJobTitle, setWitnessJobTitle] = useState("");
  const [witnessPhone, setWitnessPhone] = useState("");

  // Step 3: Factual Analysis & Equipment Details
  const [causeGroup, setCauseGroup] = useState("");
  const [causes, setCauses] = useState("");
  const [prescribingDoctor, setPrescribingDoctor] = useState("");
  const [treatmentReceived, setTreatmentReceived] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");

  const [equipmentInvolved, setEquipmentInvolved] = useState("");
  const [equipmentModel, setEquipmentModel] = useState("");
  const [equipmentNumber, setEquipmentNumber] = useState("");
  const [isMedicalDevice, setIsMedicalDevice] = useState("");
  const [equipmentSentForRepair, setEquipmentSentForRepair] = useState(false);
  const [equipmentWithdrawn, setEquipmentWithdrawn] = useState(false);
  const [equipmentRetained, setEquipmentRetained] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (
        !reporterName ||
        !reporterDesignation ||
        !reporterInfo ||
        !reporterDate ||
        !signature ||
        !principalName ||
        !principalGender ||
        !principalDob ||
        !principalType
      ) {
        setError("Please complete all required fields for Step 1.");
        return false;
      }
    }
    if (step === 2) {
      if (
        !dateOfIncident ||
        !timeOfIncident ||
        !locationOfIncident ||
        !incidentWardDept ||
        !severityLevel ||
        !incidentStatus
      ) {
        setError("Please complete all required fields for Step 2.");
        return false;
      }
    }
    if (step === 3) {
      if (
        !causeGroup ||
        !causes ||
        !treatmentReceived ||
        !equipmentInvolved ||
        !peopleInvolved
      ) {
        setError("Please complete all required fields for Step 3.");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    setError(null);
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateStep(currentStep)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            principalName,
            principalGender,
            principalDob,
            principalType,
            patientId,
            patientWardDept,
            staffJobTitle,
            staffPhone,
            staffPlaceOfWork,
            staffSite,
            peopleInvolved,
            dateOfIncident,
            timeOfIncident,
            locationOfIncident,
            incidentWardDept,
            witnesses,
            witnessType,
            witnessWardDept,
            witnessJobTitle,
            witenssPhone: witnessPhone,
            isNearMiss,
            causeGroup,
            causes,
            prescribingDoctor,
            treatmentReceived,
            equipmentInvolved,
            equipmentModel,
            equipmentSentForRepair,
            equipmentWithdrawn,
            equipmentRetained,
            equipmentNumber,
            isMedicalDevice,
            reporterName,
            reporterDesignation,
            signature,
            reporterInfo,
            date: reporterDate,
            severityLevel,
            incidentStatus,
          }),
        },
      );

      if (response.ok) {
        setSuccess(true);
        toast.success("Report submitted");
        resetForm();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to submit report. Please try again");
        setError(data.message || "Failed to submit report. Please try again.");
      }
    } catch (err) {
      toast.error("A connection issue occurred. Please check your network and try again");
      setError(
        "A connection issue occurred. Please check your network and try again.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setReporterName("");
    setReporterDesignation("");
    setReporterInfo("");
    setReporterDate("");
    setSignature(false);
    setPrincipalName("");
    setPrincipalGender("");
    setPrincipalDob("");
    setPrincipalType("");
    setPatientId("");
    setPatientWardDept("");
    setStaffJobTitle("");
    setStaffPhone("");
    setStaffPlaceOfWork("");
    setStaffSite("");
    setDateOfIncident("");
    setTimeOfIncident("");
    setLocationOfIncident("");
    setIncidentWardDept("");
    setSeverityLevel("");
    setIncidentStatus("unresolved");
    setIsNearMiss(false);
    setWitnesses("");
    setWitnessType("");
    setWitnessWardDept("");
    setWitnessJobTitle("");
    setWitnessPhone("");
    setCauseGroup("");
    setCauses("");
    setPrescribingDoctor("");
    setTreatmentReceived("");
    setPeopleInvolved("");
    setEquipmentInvolved("");
    setEquipmentModel("");
    setEquipmentNumber("");
    setIsMedicalDevice("");
    setEquipmentSentForRepair(false);
    setEquipmentWithdrawn(false);
    setEquipmentRetained(false);
  };

  const inputClassName =
    "h-11 px-4 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all";
  const labelClassName =
    "text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400";

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="w-full bg-background border-b sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <img
            src="/images/rhv logo.png"
            alt="RHV Logo"
            width={90}
            height={24}
            className="h-6 w-auto"
          />
          <span>IncidentTracker</span>
        </div>
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
      </header>

      <main className="flex-1 flex justify-center items-start p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-4xl border-muted-foreground/20 shadow-xl bg-background">
          <CardHeader className="space-y-1 text-center border-b pb-6">
            <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
              RHV Hospital Incident Reporting Form
            </CardTitle>
            <CardDescription className="text-base max-w-2xl mx-auto">
              Please use this form to safely record occurrences, injuries,
              damages, or near-miss scenarios immediately following an incident.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Submission Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>
                    Your incident report has been logged into the system.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-center space-x-2 mb-6">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${step <= currentStep
                        ? "bg-blue-600 w-8"
                        : "bg-slate-200 dark:bg-slate-700 w-2"
                      }`}
                  />
                ))}
              </div>

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Reporter Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="reporterName"
                          className={labelClassName}
                        >
                          Reporter Name{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="reporterName"
                          placeholder="Jane Doe"
                          value={reporterName}
                          onChange={(e) => setReporterName(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reporterDesignation"
                          className={labelClassName}
                        >
                          Designation / Job Title{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="reporterDesignation"
                          placeholder="Registered Nurse, Staff Physician..."
                          value={reporterDesignation}
                          onChange={(e) =>
                            setReporterDesignation(e.target.value)
                          }
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reporterInfo"
                          className={labelClassName}
                        >
                          Contact Details / Info{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="reporterInfo"
                          placeholder="Phone extension or email address"
                          value={reporterInfo}
                          onChange={(e) => setReporterInfo(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="reporterDate"
                          className={labelClassName}
                        >
                          Date of Report{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="reporterDate"
                          type="date"
                          value={reporterDate}
                          onChange={(e) => setReporterDate(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                        <input
                          id="signature"
                          type="checkbox"
                          checked={signature}
                          onChange={(e) => setSignature(e.target.checked)}
                          disabled={isLoading}
                          required
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <Label
                          htmlFor="signature"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          I confirm that the factual particulars recorded here
                          are true and accurate{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Principal Person Involved (Subject)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="principalName"
                          className={labelClassName}
                        >
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="principalName"
                          placeholder="John Smith"
                          value={principalName}
                          onChange={(e) => setPrincipalName(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="principalGender"
                          className={labelClassName}
                        >
                          Gender <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={principalGender}
                          onValueChange={(value) => setPrincipalGender(value)}
                          disabled={isLoading}
                          required
                        >
                          <SelectTrigger
                            id="principalGender"
                            className={inputClassName}
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="principalDob"
                          className={labelClassName}
                        >
                          Date of Birth{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="principalDob"
                          type="date"
                          value={principalDob}
                          onChange={(e) => setPrincipalDob(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="principalType"
                          className={labelClassName}
                        >
                          Person Classification{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={principalType}
                          onValueChange={(value) => setPrincipalType(value)}
                          disabled={isLoading}
                          required
                        >
                          <SelectTrigger
                            id="principalType"
                            className={inputClassName}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="visiting consultant">
                              Visiting Consultant
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {principalType === "patient" && (
                        <>
                          <div className="space-y-2">
                            <Label
                              htmlFor="patientId"
                              className={labelClassName}
                            >
                              Patient ID / Case Reference
                            </Label>
                            <Input
                              id="patientId"
                              placeholder="PT-12345"
                              value={patientId}
                              onChange={(e) => setPatientId(e.target.value)}
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="patientWardDept"
                              className={labelClassName}
                            >
                              Patient Ward / Department
                            </Label>
                            <Input
                              id="patientWardDept"
                              placeholder="ICU, Ward 4A..."
                              value={patientWardDept}
                              onChange={(e) =>
                                setPatientWardDept(e.target.value)
                              }
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
                        </>
                      )}

                      {principalType === "staff" && (
                        <>
                          <div className="space-y-2">
                            <Label
                              htmlFor="staffJobTitle"
                              className={labelClassName}
                            >
                              Staff Job Title
                            </Label>
                            <Input
                              id="staffJobTitle"
                              placeholder="Clinical Lead, Lab Tech..."
                              value={staffJobTitle}
                              onChange={(e) => setStaffJobTitle(e.target.value)}
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="staffPhone"
                              className={labelClassName}
                            >
                              Staff Contact Phone
                            </Label>
                            <Input
                              id="staffPhone"
                              placeholder="+1555-0199"
                              value={staffPhone}
                              onChange={(e) => setStaffPhone(e.target.value)}
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="staffPlaceOfWork"
                              className={labelClassName}
                            >
                              Place of Work / Unit
                            </Label>
                            <Input
                              id="staffPlaceOfWork"
                              placeholder="Main Laboratory"
                              value={staffPlaceOfWork}
                              onChange={(e) =>
                                setStaffPlaceOfWork(e.target.value)
                              }
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="staffSite"
                              className={labelClassName}
                            >
                              Staff Site location
                            </Label>
                            <Input
                              id="staffSite"
                              placeholder="North Wing Facility"
                              value={staffSite}
                              onChange={(e) => setStaffSite(e.target.value)}
                              disabled={isLoading}
                              className={inputClassName}
                            />
                          </div>
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
                      <div className="space-y-2">
                        <Label
                          htmlFor="dateOfIncident"
                          className={labelClassName}
                        >
                          Date of Incident{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="dateOfIncident"
                          type="date"
                          value={dateOfIncident}
                          onChange={(e) => setDateOfIncident(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="timeOfIncident"
                          className={labelClassName}
                        >
                          Time of Incident{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="timeOfIncident"
                          type="time"
                          value={timeOfIncident}
                          onChange={(e) => setTimeOfIncident(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="locationOfIncident"
                          className={labelClassName}
                        >
                          Specific Location{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="locationOfIncident"
                          placeholder="Main Lobby Room B, Elevators..."
                          value={locationOfIncident}
                          onChange={(e) =>
                            setLocationOfIncident(e.target.value)
                          }
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="incidentWardDept"
                          className={labelClassName}
                        >
                          Incident Ward / Dept{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="incidentWardDept"
                          placeholder="Emergency Department, Pediatrics..."
                          value={incidentWardDept}
                          onChange={(e) => setIncidentWardDept(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="severityLevel"
                          className={labelClassName}
                        >
                          Assessed Severity Level{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={severityLevel}
                          onValueChange={(value) => setSeverityLevel(value)}
                          disabled={isLoading}
                          required
                        >
                          <SelectTrigger
                            id="severityLevel"
                            className={inputClassName}
                          >
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="near miss">Near Miss</SelectItem>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="major">Major</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="incidentStatus"
                          className={labelClassName}
                        >
                          Initial Handling Status{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={incidentStatus}
                          onValueChange={(value) => setIncidentStatus(value)}
                          disabled={isLoading}
                          required
                        >
                          <SelectTrigger
                            id="incidentStatus"
                            className={inputClassName}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unresolved">
                              Unresolved
                            </SelectItem>
                            <SelectItem value="inprogress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-3 pt-2">
                        <input
                          id="isNearMiss"
                          type="checkbox"
                          checked={isNearMiss}
                          onChange={(e) => setIsNearMiss(e.target.checked)}
                          disabled={isLoading}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <Label
                          htmlFor="isNearMiss"
                          className="text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                          Classify definitively as a Near-Miss scenario
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Witnesses Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="witnesses" className={labelClassName}>
                          Witness Name(s)
                        </Label>
                        <Input
                          id="witnesses"
                          placeholder="Separate names with commas if multiple"
                          value={witnesses}
                          onChange={(e) => setWitnesses(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="witnessType" className={labelClassName}>
                          Witness Category / Type
                        </Label>
                        <Input
                          id="witnessType"
                          placeholder="Visitor, Colleague, Patient relative..."
                          value={witnessType}
                          onChange={(e) => setWitnessType(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="witnessWardDept"
                          className={labelClassName}
                        >
                          Witness Ward / Department
                        </Label>
                        <Input
                          id="witnessWardDept"
                          placeholder="Radiology, Outpatient clinic..."
                          value={witnessWardDept}
                          onChange={(e) => setWitnessWardDept(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="witnessJobTitle"
                          className={labelClassName}
                        >
                          Witness Designation / Job
                        </Label>
                        <Input
                          id="witnessJobTitle"
                          placeholder="Security Guard, Resident Physician..."
                          value={witnessJobTitle}
                          onChange={(e) => setWitnessJobTitle(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="witnessPhone"
                          className={labelClassName}
                        >
                          Witness Phone / Contact
                        </Label>
                        <Input
                          id="witnessPhone"
                          placeholder="Phone extension or cell details"
                          value={witnessPhone}
                          onChange={(e) => setWitnessPhone(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
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
                        <div className="space-y-2">
                          <Label
                            htmlFor="causeGroup"
                            className={labelClassName}
                          >
                            Cause Classification Group{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="causeGroup"
                            placeholder="Clinical Error, Operational Hazard, Technical Fault..."
                            value={causeGroup}
                            onChange={(e) => setCauseGroup(e.target.value)}
                            disabled={isLoading}
                            required
                            className={inputClassName}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="prescribingDoctor"
                            className={labelClassName}
                          >
                            Prescribing Doctor{" "}
                            <span className="text-xs text-muted-foreground">
                              (If applicable)
                            </span>
                          </Label>
                          <Input
                            id="prescribingDoctor"
                            placeholder="Dr. Alexander Pierce"
                            value={prescribingDoctor}
                            onChange={(e) =>
                              setPrescribingDoctor(e.target.value)
                            }
                            disabled={isLoading}
                            className={inputClassName}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="causes" className={labelClassName}>
                          Factual Description of Causes / Incident Details{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="causes"
                          rows={4}
                          placeholder="Provide a precise, factual and chronological timeline outlining exactly what happened..."
                          value={causes}
                          onChange={(e) => setCauses(e.target.value)}
                          disabled={isLoading}
                          required
                          className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="treatmentReceived"
                          className={labelClassName}
                        >
                          Immediate Medical Treatment Received / Care Actions
                          Provided <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="treatmentReceived"
                          placeholder="First aid given, transferred to trauma unit, nil required..."
                          value={treatmentReceived}
                          onChange={(e) => setTreatmentReceived(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="peopleInvolved"
                          className={labelClassName}
                        >
                          Other People Involved / Affected{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="peopleInvolved"
                          placeholder="Names or identifying details of other persons involved"
                          value={peopleInvolved}
                          onChange={(e) => setPeopleInvolved(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                      Asset & Equipment Management
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="equipmentInvolved"
                          className={labelClassName}
                        >
                          Equipment Involved Name / Context{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="equipmentInvolved"
                          placeholder="Infusion Pump, Defibrillator, None..."
                          value={equipmentInvolved}
                          onChange={(e) => setEquipmentInvolved(e.target.value)}
                          disabled={isLoading}
                          required
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="equipmentModel"
                          className={labelClassName}
                        >
                          Equipment Model
                        </Label>
                        <Input
                          id="equipmentModel"
                          placeholder="Model series / manufacturer info"
                          value={equipmentModel}
                          onChange={(e) => setEquipmentModel(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="equipmentNumber"
                          className={labelClassName}
                        >
                          Equipment Serial / Asset ID Number
                        </Label>
                        <Input
                          id="equipmentNumber"
                          placeholder="ASN-992182"
                          value={equipmentNumber}
                          onChange={(e) => setEquipmentNumber(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="isMedicalDevice"
                          className={labelClassName}
                        >
                          Is this a certified medical device?
                        </Label>
                        <Input
                          id="isMedicalDevice"
                          placeholder="Yes / No / Unsure"
                          value={isMedicalDevice}
                          onChange={(e) => setIsMedicalDevice(e.target.value)}
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-3 pt-2 border-t border-dashed mt-2">
                        <Label className={labelClassName}>
                          Current Equipment Status Actions
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                          <div className="flex items-center space-x-3">
                            <input
                              id="equipmentSentForRepair"
                              type="checkbox"
                              checked={equipmentSentForRepair}
                              onChange={(e) =>
                                setEquipmentSentForRepair(e.target.checked)
                              }
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                            />
                            <Label
                              htmlFor="equipmentSentForRepair"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              Sent for Repair
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              id="equipmentWithdrawn"
                              type="checkbox"
                              checked={equipmentWithdrawn}
                              onChange={(e) =>
                                setEquipmentWithdrawn(e.target.checked)
                              }
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                            />
                            <Label
                              htmlFor="equipmentWithdrawn"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              Withdrawn from Use
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              id="equipmentRetained"
                              type="checkbox"
                              checked={equipmentRetained}
                              onChange={(e) =>
                                setEquipmentRetained(e.target.checked)
                              }
                              disabled={isLoading}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-900"
                            />
                            <Label
                              htmlFor="equipmentRetained"
                              className="text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                              Retained for Audit
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between gap-3 border-t bg-muted/10 py-4 px-6">
              <div className="flex gap-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                  >
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
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
