import { z } from "zod";

export const incidentReportSchema = z.object({
  // Step 1 — Reporter
  reporterName: z.string().min(1, "Required"),
  reporterDesignation: z.string().min(1, "Required"),
  reporterInfo: z.string().min(1, "Required"),
  reporterDate: z.string().min(1, "Required"),
  signature: z.boolean().refine((v) => v === true, {
    message: "Please confirm the particulars are accurate",
  }),

  // Step 1 — Principal person
  principalName: z.string().min(1, "Required"),
  principalGender: z.string().min(1, "Required"),
  principalDob: z.string().min(1, "Required"),
  principalType: z.string().min(1, "Required"),
  patientId: z.string().optional(),
  patientWardDept: z.string().optional(),
  staffJobTitle: z.string().optional(),
  staffPhone: z.string().optional(),
  staffPlaceOfWork: z.string().optional(),
  staffSite: z.string().optional(),

  // Step 2 — Incident specifics
  dateOfIncident: z.string().min(1, "Required"),
  timeOfIncident: z.string().min(1, "Required"),
  locationOfIncident: z.string().min(1, "Required"),
  incidentWardDept: z.string().min(1, "Required"),
  severityLevel: z.string().min(1, "Required"),
  incidentStatus: z.string().min(1, "Required"),
  isNearMiss: z.boolean(),

  // Step 2 — Witnesses
  witnesses: z.string().optional(),
  witnessType: z.string().optional(),
  witnessWardDept: z.string().optional(),
  witnessJobTitle: z.string().optional(),
  witnessPhone: z.string().optional(),

  // Step 3 — Description & causes
  causeGroup: z.string().min(1, "Required"),
  causes: z.string().min(1, "Required"),
  prescribingDoctor: z.string().optional(),
  treatmentReceived: z.string().min(1, "Required"),
  peopleInvolved: z.string().min(1, "Required"),

  // Step 3 — Equipment
  equipmentInvolved: z.string().min(1, "Required"),
  equipmentModel: z.string().optional(),
  equipmentNumber: z.string().optional(),
  isMedicalDevice: z.string().optional(),
  equipmentSentForRepair: z.boolean(),
  equipmentWithdrawn: z.boolean(),
  equipmentRetained: z.boolean(),
});

export type IncidentReportValues = z.infer<typeof incidentReportSchema>;

export const STEP_FIELDS: Record<1 | 2 | 3, (keyof IncidentReportValues)[]> = {
  1: [
    "reporterName",
    "reporterDesignation",
    "reporterInfo",
    "signature",
    "principalName",
    "principalGender",
    "principalDob",
    "principalType",
  ],
  2: [
    "dateOfIncident",
    "timeOfIncident",
    "locationOfIncident",
    "incidentWardDept",
    "severityLevel",
    "incidentStatus",
  ],
  3: [
    "causeGroup",
    "causes",
    "treatmentReceived",
    "peopleInvolved",
    "equipmentInvolved",
  ],
};

export const INCIDENT_REPORT_DEFAULTS: IncidentReportValues = {
  reporterName: "",
  reporterDesignation: "",
  reporterInfo: "",
  reporterDate: "",
  signature: false,
  principalName: "",
  principalGender: "",
  principalDob: "",
  principalType: "",
  patientId: "",
  patientWardDept: "",
  staffJobTitle: "",
  staffPhone: "",
  staffPlaceOfWork: "",
  staffSite: "",
  dateOfIncident: "",
  timeOfIncident: "",
  locationOfIncident: "",
  incidentWardDept: "",
  severityLevel: "",
  incidentStatus: "unresolved",
  isNearMiss: false,
  witnesses: "",
  witnessType: "",
  witnessWardDept: "",
  witnessJobTitle: "",
  witnessPhone: "",
  causeGroup: "",
  causes: "",
  prescribingDoctor: "",
  treatmentReceived: "",
  peopleInvolved: "",
  equipmentInvolved: "",
  equipmentModel: "",
  equipmentNumber: "",
  isMedicalDevice: "",
  equipmentSentForRepair: false,
  equipmentWithdrawn: false,
  equipmentRetained: false,
};
