"use client";

import React, { useState } from "react";
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
import { ShieldAlert, LogIn, CheckCircle2, AlertCircle } from "lucide-react";

export default function LandingReportPage() {
  const [reporterName, setReporterName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [dateOfIncident, setDateOfIncident] = useState("");
  const [timeOfIncident, setTimeOfIncident] = useState("");
  const [locationOfIncident, setLocationOfIncident] = useState("");
  const [typeOfIncident, setTypeOfIncident] = useState("");
  const [peopleInvolved, setPeopleInvolved] = useState("");
  const [descriptionOfIncident, setDescriptionOfIncident] = useState("");
  const [immediateActionTaken, setImmediateActionTaken] = useState("");
  const [injuryOrDamage, setInjuryOrDamage] = useState("");
  const [severityLevel, setSeverityLevel] = useState("");
  const [supervisorNotified, setSupervisorNotified] = useState("");
  const [recommendedPreventiveAction, setRecommendedPreventiveAction] =
    useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (
      !reporterName ||
      !department ||
      !dateOfIncident ||
      !locationOfIncident ||
      !typeOfIncident ||
      !descriptionOfIncident ||
      !severityLevel
    ) {
      setError("Please complete all required fields (*).");
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
          // Maps cleanly to the IncidentReport struct fields in types.go
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
            severityLevel, // "near miss", "minor", "major", or "critical"
            supervisorNotified,
            recommendedPreventiveAction,
          }),
        },
      );

      if (response.ok) {
        setSuccess(true);
        // Clear all form inputs
        setReporterName("");
        setDepartment("");
        setPosition("");
        setContactInfo("");
        setDateOfIncident("");
        setTimeOfIncident("");
        setLocationOfIncident("");
        setTypeOfIncident("");
        setPeopleInvolved("");
        setDescriptionOfIncident("");
        setImmediateActionTaken("");
        setInjuryOrDamage("");
        setSeverityLevel("");
        setSupervisorNotified("");
        setRecommendedPreventiveAction("");
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

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* 1. Global Navigation Top Bar */}
      <header className="w-full bg-background border-b sticky top-0 z-50 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <ShieldAlert className="h-6 w-6 text-destructive" />
          <span>IncidentTracker</span>
        </div>
        <Link href="/login" passHref>
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Personnel Login
          </Button>
        </Link>
      </header>

      {/* 2. Main Layout Viewport Form Container */}
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
                    Your incident report has been securely logged into the
                    system. Thank you for helping keep our infrastructure safe.
                  </AlertDescription>
                </Alert>
              )}

              {/* SECTION: Reporter Information */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                  1. Reporter Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reporterName">
                      Reporter Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="reporterName"
                      placeholder="Jane Doe"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">
                      Department <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="department"
                      placeholder="Emergency Room, Pediatrics..."
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position / Job Title</Label>
                    <Input
                      id="position"
                      placeholder="Registered Nurse, Staff Physician..."
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Contact Information</Label>
                    <Input
                      id="contactInfo"
                      placeholder="Phone extension or email address"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Incident Metadata Details */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                  2. Incident Specifics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfIncident">
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeOfIncident">Time of Incident</Label>
                    <Input
                      id="timeOfIncident"
                      type="time"
                      value={timeOfIncident}
                      onChange={(e) => setTimeOfIncident(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="locationOfIncident">
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
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="typeOfIncident">
                      Type of Incident{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="typeOfIncident"
                      placeholder="Patient Fall, Equipment Malfunction, Needle stick..."
                      value={typeOfIncident}
                      onChange={(e) => setTypeOfIncident(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="severityLevel">
                      Severity Level <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={severityLevel}
                      onValueChange={(value) => setSeverityLevel(value)}
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger id="severityLevel">
                        <SelectValue placeholder="Select assessed severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Values explicitly configured to support SeverityLevel enum in Go backend */}
                        <SelectItem value="near miss">Near Miss</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* SECTION: Situational Assessment Narrative Descriptions */}
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-muted-foreground">
                  3. Situational Description &amp; Actions Taken
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="peopleInvolved">People Involved</Label>
                    <Input
                      id="peopleInvolved"
                      placeholder="Names or identifying context of personnel, witnesses, or patient references"
                      value={peopleInvolved}
                      onChange={(e) => setPeopleInvolved(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descriptionOfIncident">
                      Description of Incident{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="descriptionOfIncident"
                      rows={4}
                      placeholder="Provide a factual chronological summary of exactly what transpired..."
                      value={descriptionOfIncident}
                      onChange={(e) => setDescriptionOfIncident(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="immediateActionTaken">
                      Immediate Action Taken
                    </Label>
                    <Textarea
                      id="immediateActionTaken"
                      rows={2}
                      placeholder="What was done right away to handle the scene or protect patients?"
                      value={immediateActionTaken}
                      onChange={(e) => setImmediateActionTaken(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injuryOrDamage">
                      Injury or Damage Reported
                    </Label>
                    <Textarea
                      id="injuryOrDamage"
                      rows={2}
                      placeholder="Describe any injuries sustained or equipment assets damaged, if applicable..."
                      value={injuryOrDamage}
                      onChange={(e) => setInjuryOrDamage(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supervisorNotified">
                        Supervisor Notified
                      </Label>
                      <Input
                        id="supervisorNotified"
                        placeholder="Name of supervisor informed"
                        value={supervisorNotified}
                        onChange={(e) => setSupervisorNotified(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recommendedPreventiveAction">
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
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t bg-muted/10 py-4 px-6">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                {isLoading ? "Submitting Report..." : "Submit Incident Report"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
