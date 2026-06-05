"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import directly from sonner
import { ChevronLeft, ChevronRight, PlusCircle, Loader2 } from "lucide-react";

// --- Type Definitions matching Go Backend ---
export type SeverityLevel = "near miss" | "minor" | "major" | "critical";

export interface IncidentReport {
  reporterName: string;
  department: string;
  position: string;
  contactInfo: string;
  dateOfIncident: string;
  timeOfIncident: string;
  locationOfIncident: string;
  typeOfIncident: string;
  peopleInvolved: string;
  descriptionOfIncident: string;
  immediateActionTaken: string;
  injuryOrDamage: string;
  severityLevel: SeverityLevel;
  supervisorNotified: string;
  recommendedPreventiveAction: string;
}

interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

interface PaginatedIncidentResponse {
  data: IncidentReport[] | null;
  pagination: PaginationMeta;
}

export default function IncidentTracker() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<IncidentReport>({
    reporterName: "",
    department: "",
    position: "",
    contactInfo: "",
    dateOfIncident: "",
    timeOfIncident: "",
    locationOfIncident: "",
    typeOfIncident: "",
    peopleInvolved: "",
    descriptionOfIncident: "",
    immediateActionTaken: "",
    injuryOrDamage: "",
    severityLevel: "minor",
    supervisorNotified: "",
    recommendedPreventiveAction: "",
  });

  // Fetch Incidents from Backend
  const fetchIncidents = async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_apiurl}/incidents?page=${page}&limit=${pagination.page_size}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!res.ok) throw new Error("Failed to fetch data");

      const result: PaginatedIncidentResponse = await res.json();
      setIncidents(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      toast.error("Could not load incidents from server."); // Elegant fallback error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents(pagination.current_page);
  }, [pagination.current_page]);

  // Handle Form Inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeverityChange = (value: SeverityLevel) => {
    setFormData((prev) => ({ ...prev, severityLevel: value }));
  };

  // Submit Incident using modern Sonner Promises
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Define the backend request promise
    const submitPromise = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/incidents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to report incident");
      }
      return await res.json();
    };

    // 2. Feed the promise to Sonner to manage the notification states flawlessly
    toast.promise(submitPromise(), {
      loading: "Submitting report to system...",
      success: () => {
        setIsDialogOpen(false);
        // Reset Form
        setFormData({
          reporterName: "",
          department: "",
          position: "",
          contactInfo: "",
          dateOfIncident: "",
          timeOfIncident: "",
          locationOfIncident: "",
          typeOfIncident: "",
          peopleInvolved: "",
          descriptionOfIncident: "",
          immediateActionTaken: "",
          injuryOrDamage: "",
          severityLevel: "minor",
          supervisorNotified: "",
          recommendedPreventiveAction: "",
        });
        // Refresh Current View
        fetchIncidents(pagination.current_page);
        return "Incident report submitted successfully.";
      },
      error: (err) => err.message || "An unknown submission error occurred.",
    });
  };

  const getSeverityBadgeClass = (level: SeverityLevel) => {
    switch (level) {
      case "near miss":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "minor":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "major":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "critical":
        return "bg-destructive/10 text-destructive dark:bg-destructive/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Incident Tracker
          </h1>
          <p className="text-muted-foreground">
            Manage, view, and report workplace safety and technical incidents.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" /> Report Incident
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>File New Incident Report</DialogTitle>
              <DialogDescription>
                Ensure all mandatory workplace incident fields are accurately
                documented.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reporter Name</label>
                  <Input
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <Input
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contact Info</label>
                  <Input
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Date of Incident
                  </label>
                  <Input
                    type="date"
                    name="dateOfIncident"
                    value={formData.dateOfIncident}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Time of Incident
                  </label>
                  <Input
                    type="time"
                    name="timeOfIncident"
                    value={formData.timeOfIncident}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    name="locationOfIncident"
                    value={formData.locationOfIncident}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Type of Incident
                  </label>
                  <Input
                    name="typeOfIncident"
                    placeholder="e.g. Injury, Equipment Failure"
                    value={formData.typeOfIncident}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity Level</label>
                <Select
                  value={formData.severityLevel}
                  onValueChange={handleSeverityChange}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium">People Involved</label>
                <Input
                  name="peopleInvolved"
                  placeholder="Names or count"
                  value={formData.peopleInvolved}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Description of Incident
                </label>
                <Textarea
                  name="descriptionOfIncident"
                  value={formData.descriptionOfIncident}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Immediate Action Taken
                </label>
                <Textarea
                  name="immediateActionTaken"
                  value={formData.immediateActionTaken}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Injury or Damage Details
                </label>
                <Input
                  name="injuryOrDamage"
                  value={formData.injuryOrDamage}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Supervisor Notified
                  </label>
                  <Input
                    name="supervisorNotified"
                    value={formData.supervisorNotified}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Recommended Preventive Action
                  </label>
                  <Input
                    name="recommendedPreventiveAction"
                    value={formData.recommendedPreventiveAction}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date / Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Reporter</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading
                        data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : incidents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No incidents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  incidents.map((incident, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {incident.dateOfIncident}{" "}
                        <span className="text-xs text-muted-foreground ml-1">
                          {incident.timeOfIncident}
                        </span>
                      </TableCell>
                      <TableCell>{incident.typeOfIncident}</TableCell>
                      <TableCell>{incident.department}</TableCell>
                      <TableCell>{incident.locationOfIncident}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getSeverityBadgeClass(incident.severityLevel)}`}
                        >
                          {incident.severityLevel}
                        </span>
                      </TableCell>
                      <TableCell>{incident.reporterName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between space-x-2 py-4 px-4 sm:px-0">
            <div className="text-sm text-muted-foreground">
              Total items:{" "}
              <span className="font-medium">{pagination.total_items}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page - 1,
                  }))
                }
                disabled={pagination.current_page <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    current_page: prev.current_page + 1,
                  }))
                }
                disabled={
                  pagination.current_page >= pagination.total_pages || isLoading
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
