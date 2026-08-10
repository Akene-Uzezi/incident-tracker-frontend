import { describe, it, expect } from "vitest";
import { incidentReportSchema, INCIDENT_REPORT_DEFAULTS } from "./incident-report";

const validValues = {
  ...INCIDENT_REPORT_DEFAULTS,
  reporterName: "Jane Doe",
  reporterDesignation: "Nurse",
  reporterInfo: "jane@example.com",
  reporterDate: "2026-07-21",
  signature: true,
  principalName: "John Smith",
  principalGender: "Male",
  principalDob: "1990-01-01",
  principalType: "patient",
  dateOfIncident: "2026-07-21",
  timeOfIncident: "10:30",
  locationOfIncident: "Ward 4A",
  incidentWardDept: "ICU",
  severityLevel: "minor",
  incidentStatus: "unresolved",
  causeGroup: "Clinical Error",
  causes: "Fell out of bed",
  treatmentReceived: "First aid",
  peopleInvolved: "None",
  equipmentInvolved: "None",
};

describe("incidentReportSchema", () => {
  it("accepts a fully valid report", () => {
    expect(incidentReportSchema.safeParse(validValues).success).toBe(true);
  });

  it("rejects missing required fields", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructured only to omit it below
    const { reporterName, ...rest } = validValues;
    const result = incidentReportSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an unchecked signature confirmation", () => {
    const result = incidentReportSchema.safeParse({ ...validValues, signature: false });
    expect(result.success).toBe(false);
  });

  it("rejects free-text fields over the max length (abuse protection)", () => {
    const result = incidentReportSchema.safeParse({
      ...validValues,
      causes: "a".repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts free-text fields right at the max length", () => {
    const result = incidentReportSchema.safeParse({
      ...validValues,
      causes: "a".repeat(5000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects short-text fields over their max length", () => {
    const result = incidentReportSchema.safeParse({
      ...validValues,
      reporterName: "a".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("does not reject a submission just because the honeypot field is present and empty", () => {
    const result = incidentReportSchema.safeParse({ ...validValues, website: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a submission where the honeypot field has been filled in", () => {
    const result = incidentReportSchema.safeParse({ ...validValues, website: "http://spam.example" });
    expect(result.success).toBe(false);
  });
});
