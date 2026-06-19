"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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

  const [reporterName, setReporterName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [dateOfIncident, setDateOfIncident] = useState("");
  const [timeOfIncident, setTimeOfIncident] = useState("");
  const [locationOfIncident, setLocationOfIncident] = useState("");
  const [typeOfIncident, setTypeOfIncident] = useState("");
  const [severityLevel, setSeverityLevel] = useState("");
  const [incidentStatus, setIncidentStatus] = useState("unresolved");

  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [descriptionOfIncident, setDescriptionOfIncident] = useState("");
  const [immediateActionTaken, setImmediateActionTaken] = useState("");
  const [injuryOrDamage, setInjuryOrDamage] = useState("");
  const [supervisorNotified, setSupervisorNotified] = useState("");
  const [recommendedPreventiveAction, setRecommendedPreventiveAction] =
    useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!reporterName || !department) {
        setError("Please complete all required fields.");
        return false;
      }
    }
    if (step === 2) {
      if (
        !dateOfIncident ||
        !locationOfIncident ||
        !typeOfIncident ||
        !severityLevel ||
        !incidentStatus
      ) {
        setError("Please complete all required fields.");
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
            reporterName,
            department,
            position,
            contactInfo,
            dateOfIncident,
            timeOfIncident,
            locationOfIncident,
            typeOfIncident,
            peopleInvolved,
            descriptionOfIncident,
            immediateActionTaken,
            injuryOrDamage,
            severityLevel,
            supervisorNotified,
            recommendedPreventiveAction,
            incidentStatus,
          }),
        },
      );

      if (response.ok) {
        setSuccess(true);
        resetForm();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to submit report. Please try again.");
      }
    } catch (err) {
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
    setDepartment("");
    setPosition("");
    setContactInfo("");
    setDateOfIncident("");
    setTimeOfIncident("");
    setLocationOfIncident("");
    setTypeOfIncident("");
    setSeverityLevel("");
    setIncidentStatus("unresolved");
    setPeopleInvolved("");
    setDescriptionOfIncident("");
    setImmediateActionTaken("");
    setInjuryOrDamage("");
    setSupervisorNotified("");
    setRecommendedPreventiveAction("");
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
            width={120}
            height={32}
            className="h-8 w-auto"
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
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step <= currentStep
                        ? "bg-blue-600 w-8"
                        : "bg-slate-200 dark:bg-slate-700 w-2"
                    }`}
                  />
                ))}
              </div>

              {currentStep === 1 && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                    Step 1: Reporter Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reporterName" className={labelClassName}>
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
                      <Label htmlFor="department" className={labelClassName}>
                        Department <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="department"
                        placeholder="Emergency Room, Pediatrics..."
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className={labelClassName}>
                        Position / Job Title
                      </Label>
                      <Input
                        id="position"
                        placeholder="Registered Nurse, Staff Physician..."
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        disabled={isLoading}
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo" className={labelClassName}>
                        Contact Information
                      </Label>
                      <Input
                        id="contactInfo"
                        placeholder="Phone extension or email address"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        disabled={isLoading}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                    Step 2: Incident Specifics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        Time of Incident
                      </Label>
                      <Input
                        id="timeOfIncident"
                        type="time"
                        value={timeOfIncident}
                        onChange={(e) => setTimeOfIncident(e.target.value)}
                        disabled={isLoading}
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="locationOfIncident"
                        className={labelClassName}
                      >
                        Location of Incident{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="locationOfIncident"
                        placeholder="Ward 3B, Main Lobby..."
                        value={locationOfIncident}
                        onChange={(e) => setLocationOfIncident(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClassName}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="typeOfIncident"
                        className={labelClassName}
                      >
                        Type of Incident{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="typeOfIncident"
                        placeholder="Patient Fall, Equipment Malfunction..."
                        value={typeOfIncident}
                        onChange={(e) => setTypeOfIncident(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severityLevel" className={labelClassName}>
                        Severity Level{" "}
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
                          <SelectValue placeholder="Select assessed severity" />
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
                        Incident Status{" "}
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
                          <SelectValue placeholder="Select current status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unresolved">Unresolved</SelectItem>
                          <SelectItem value="inprogress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                    Step 3: Situational Description & Actions Taken
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="peopleInvolved"
                        className={labelClassName}
                      >
                        People Involved
                      </Label>
                      <Input
                        id="peopleInvolved"
                        placeholder="Names or identifying context of personnel, witnesses..."
                        value={peopleInvolved}
                        onChange={(e) => setPeopleInvolved(e.target.value)}
                        disabled={isLoading}
                        className={inputClassName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="descriptionOfIncident"
                        className={labelClassName}
                      >
                        Description of Incident{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="descriptionOfIncident"
                        rows={4}
                        placeholder="Provide a factual chronological summary of exactly what transpired..."
                        value={descriptionOfIncident}
                        onChange={(e) =>
                          setDescriptionOfIncident(e.target.value)
                        }
                        disabled={isLoading}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="immediateActionTaken"
                        className={labelClassName}
                      >
                        Immediate Action Taken
                      </Label>
                      <Textarea
                        id="immediateActionTaken"
                        rows={2}
                        placeholder="What was done right away to handle the scene or protect patients?"
                        value={immediateActionTaken}
                        onChange={(e) =>
                          setImmediateActionTaken(e.target.value)
                        }
                        disabled={isLoading}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="injuryOrDamage"
                        className={labelClassName}
                      >
                        Injury or Damage Reported
                      </Label>
                      <Textarea
                        id="injuryOrDamage"
                        rows={2}
                        placeholder="Describe any injuries sustained or equipment assets damaged..."
                        value={injuryOrDamage}
                        onChange={(e) => setInjuryOrDamage(e.target.value)}
                        disabled={isLoading}
                        className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 focus-visible:ring-blue-600 focus-visible:border-blue-600 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="supervisorNotified"
                          className={labelClassName}
                        >
                          Supervisor Notified
                        </Label>
                        <Input
                          id="supervisorNotified"
                          placeholder="Name of supervisor informed"
                          value={supervisorNotified}
                          onChange={(e) =>
                            setSupervisorNotified(e.target.value)
                          }
                          disabled={isLoading}
                          className={inputClassName}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="recommendedPreventiveAction"
                          className={labelClassName}
                        >
                          Recommended Preventive Action
                        </Label>
                        <Input
                          id="recommendedPreventiveAction"
                          placeholder="Suggestions to prevent future reoccurrences"
                          value={recommendedPreventiveAction}
                          onChange={(e) =>
                            setRecommendedPreventiveAction(e.target.value)
                          }
                          disabled={isLoading}
                          className={inputClassName}
                        />
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
