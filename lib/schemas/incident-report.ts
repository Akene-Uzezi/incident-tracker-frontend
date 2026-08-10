import { z } from "zod";

const SHORT_MAX = 200;
const LONG_MAX = 5000;
const DATE_MAX = 40;

const requiredShortText = z.string().min(1, "Required").max(SHORT_MAX, `Must be ${SHORT_MAX} characters or fewer`);
const optionalShortText = z.string().max(SHORT_MAX, `Must be ${SHORT_MAX} characters or fewer`).optional();
const requiredLongText = z.string().min(1, "Required").max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`);
const requiredDateText = z.string().min(1, "Required").max(DATE_MAX, "Invalid date");

export const incidentReportSchema = z.object({
  // Step 1 — Reporter
  reporterName: requiredShortText,
  reporterDesignation: requiredShortText,
  reporterInfo: requiredShortText,
  reporterDate: requiredDateText,
  signature: z.boolean().refine((v) => v === true, {
    message: "Please confirm the particulars are accurate",
  }),

  // Step 1 — Principal person
  principalName: requiredShortText,
  principalGender: requiredShortText,
  principalDob: requiredDateText,
  principalType: requiredShortText,
  patientId: optionalShortText,
  patientWardDept: optionalShortText,
  staffJobTitle: optionalShortText,
  staffPhone: optionalShortText,
  staffPlaceOfWork: optionalShortText,
  staffSite: optionalShortText,

  // Step 2 — Incident specifics
  dateOfIncident: requiredDateText,
  timeOfIncident: requiredDateText,
  locationOfIncident: requiredShortText,
  incidentWardDept: requiredShortText,
  severityLevel: requiredShortText,
  incidentStatus: requiredShortText,
  isNearMiss: z.boolean(),

  // Step 2 — Witnesses
  witnesses: optionalShortText,
  witnessType: optionalShortText,
  witnessWardDept: optionalShortText,
  witnessJobTitle: optionalShortText,
  witnessPhone: optionalShortText,

  // Step 3 — Description & causes
  causeGroup: requiredShortText,
  causes: requiredLongText,
  prescribingDoctor: optionalShortText,
  treatmentReceived: requiredLongText,
  peopleInvolved: requiredLongText,

  // Step 3 — Equipment
  equipmentInvolved: requiredShortText,
  equipmentModel: optionalShortText,
  equipmentNumber: optionalShortText,
  isMedicalDevice: optionalShortText,
  equipmentSentForRepair: z.boolean(),
  equipmentWithdrawn: z.boolean(),
  equipmentRetained: z.boolean(),

  // Honeypot — real users never see or fill this field. Any value here means a bot submitted the form.
  website: z.string().max(0, "").optional(),
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
  website: "",
};
