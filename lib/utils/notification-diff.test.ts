import { describe, expect, it } from "vitest";
import { diffIncidentsForNotifications } from "./notification-diff";
import type { IncidentReport } from "@/lib/types";

function makeIncident(overrides: Partial<IncidentReport> = {}): IncidentReport {
  return {
    id: 1,
    principalName: "P",
    principalGender: "Male",
    principalDob: "1990-01-01",
    principalType: "patient",
    peopleInvolved: "None",
    dateOfIncident: "2026-07-01",
    timeOfIncident: "10:00",
    locationOfIncident: "Main",
    incidentWardDept: "ICU",
    isNearMiss: false,
    causeGroup: "Clinical Error",
    causes: "x",
    treatmentReceived: "x",
    equipmentInvolved: "None",
    equipmentSentForRepair: false,
    equipmentWithdrawn: false,
    equipmentRetained: false,
    reporterName: "R",
    reporterDesignation: "Nurse",
    signature: true,
    reporterInfo: "x@example.com",
    date: "2026-07-01",
    severityLevel: "minor",
    incidentStatus: "unresolved",
    ...overrides,
  };
}

const NOW = () => "2026-07-21T12:00:00.000Z";

describe("diffIncidentsForNotifications", () => {
  it("produces no notifications on the first run and just populates seen state", () => {
    const incidents = [makeIncident({ id: 1 }), makeIncident({ id: 2, incidentStatus: "resolved" })];
    const result = diffIncidentsForNotifications(
      { incidents, seenIncidentIds: [], seenStatuses: {}, isFirstRun: true },
      NOW
    );
    expect(result.notifications).toHaveLength(0);
    expect(result.nextSeenIncidentIds).toEqual([1, 2]);
    expect(result.nextSeenStatuses).toEqual({ 1: "unresolved", 2: "resolved" });
  });

  it("detects a brand-new incident id not previously seen", () => {
    const incidents = [makeIncident({ id: 1 }), makeIncident({ id: 2 })];
    const result = diffIncidentsForNotifications(
      { incidents, seenIncidentIds: [1], seenStatuses: { 1: "unresolved" }, isFirstRun: false },
      NOW
    );
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({ type: "new_incident", incidentId: 2 });
    expect(result.nextSeenIncidentIds).toEqual([1, 2]);
  });

  it("detects a status change on an already-seen incident", () => {
    const incidents = [makeIncident({ id: 1, incidentStatus: "resolved" })];
    const result = diffIncidentsForNotifications(
      { incidents, seenIncidentIds: [1], seenStatuses: { 1: "unresolved" }, isFirstRun: false },
      NOW
    );
    expect(result.notifications).toHaveLength(1);
    expect(result.notifications[0]).toMatchObject({ type: "status_change", incidentId: 1 });
    expect(result.notifications[0].description).toContain("Resolved");
  });

  it("emits nothing when nothing changed", () => {
    const incidents = [makeIncident({ id: 1, incidentStatus: "unresolved" })];
    const result = diffIncidentsForNotifications(
      { incidents, seenIncidentIds: [1], seenStatuses: { 1: "unresolved" }, isFirstRun: false },
      NOW
    );
    expect(result.notifications).toHaveLength(0);
  });

  it("does not flag a status change for an incident that has no prior recorded status", () => {
    // Simulates an id that was seen (e.g. via a prior partial fetch) but never had its status recorded.
    const incidents = [makeIncident({ id: 1, incidentStatus: "resolved" })];
    const result = diffIncidentsForNotifications(
      { incidents, seenIncidentIds: [1], seenStatuses: {}, isFirstRun: false },
      NOW
    );
    expect(result.notifications).toHaveLength(0);
    expect(result.nextSeenStatuses).toEqual({ 1: "resolved" });
  });

  it("handles multiple simultaneous new incidents and status changes", () => {
    const incidents = [
      makeIncident({ id: 1, incidentStatus: "inprogress" }),
      makeIncident({ id: 2 }),
      makeIncident({ id: 3, incidentStatus: "resolved" }),
    ];
    const result = diffIncidentsForNotifications(
      {
        incidents,
        seenIncidentIds: [1, 3],
        seenStatuses: { 1: "unresolved", 3: "unresolved" },
        isFirstRun: false,
      },
      NOW
    );
    expect(result.notifications).toHaveLength(3);
    const types = result.notifications.map((n) => n.type).sort();
    expect(types).toEqual(["new_incident", "status_change", "status_change"]);
  });
});
