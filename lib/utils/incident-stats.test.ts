import { describe, it, expect } from "vitest";
import {
  computeStatusCounts,
  computeSeverityCounts,
  computeNearMissCount,
  computeTopBreakdown,
  computeDailyTimeSeries,
} from "./incident-stats";
import type { IncidentReport } from "@/lib/types";

function makeIncident(overrides: Partial<IncidentReport>): IncidentReport {
  return {
    id: 1,
    principalName: "John Smith",
    principalGender: "Male",
    principalDob: "1990-01-01",
    principalType: "patient",
    peopleInvolved: "None",
    dateOfIncident: "2026-07-20",
    timeOfIncident: "10:00",
    locationOfIncident: "Ward 4A",
    incidentWardDept: "ICU",
    isNearMiss: false,
    causeGroup: "Clinical Error",
    causes: "Fell out of bed",
    treatmentReceived: "First aid",
    equipmentInvolved: "None",
    equipmentSentForRepair: false,
    equipmentWithdrawn: false,
    equipmentRetained: false,
    reporterName: "Jane Doe",
    reporterDesignation: "Nurse",
    signature: true,
    reporterInfo: "jane@example.com",
    date: "2026-07-20",
    severityLevel: "minor",
    incidentStatus: "unresolved",
    ...overrides,
  };
}

describe("computeStatusCounts", () => {
  it("tallies incidents by status", () => {
    const incidents = [
      makeIncident({ incidentStatus: "unresolved" }),
      makeIncident({ incidentStatus: "unresolved" }),
      makeIncident({ incidentStatus: "inprogress" }),
      makeIncident({ incidentStatus: "resolved" }),
    ];
    expect(computeStatusCounts(incidents)).toEqual({ unresolved: 2, inprogress: 1, resolved: 1 });
  });

  it("returns all-zero counts for an empty list", () => {
    expect(computeStatusCounts([])).toEqual({ unresolved: 0, inprogress: 0, resolved: 0 });
  });
});

describe("computeSeverityCounts", () => {
  it("tallies incidents by severity", () => {
    const incidents = [
      makeIncident({ severityLevel: "critical" }),
      makeIncident({ severityLevel: "critical" }),
      makeIncident({ severityLevel: "major" }),
      makeIncident({ severityLevel: "near miss" }),
    ];
    expect(computeSeverityCounts(incidents)).toEqual({
      "near miss": 1,
      minor: 0,
      major: 1,
      critical: 2,
    });
  });
});

describe("computeNearMissCount", () => {
  it("counts only incidents flagged isNearMiss, independent of severityLevel", () => {
    const incidents = [
      makeIncident({ isNearMiss: true, severityLevel: "minor" }),
      makeIncident({ isNearMiss: false, severityLevel: "near miss" }),
      makeIncident({ isNearMiss: true, severityLevel: "critical" }),
    ];
    expect(computeNearMissCount(incidents)).toBe(2);
  });
});

describe("computeTopBreakdown", () => {
  it("ranks values by frequency, descending", () => {
    const incidents = [
      makeIncident({ incidentWardDept: "ICU" }),
      makeIncident({ incidentWardDept: "ICU" }),
      makeIncident({ incidentWardDept: "ER" }),
    ];
    expect(computeTopBreakdown(incidents, "incidentWardDept")).toEqual([
      { label: "ICU", count: 2 },
      { label: "ER", count: 1 },
    ]);
  });

  it("excludes blank/whitespace-only values", () => {
    const incidents = [makeIncident({ causeGroup: "" }), makeIncident({ causeGroup: "   " }), makeIncident({ causeGroup: "Equipment Fault" })];
    expect(computeTopBreakdown(incidents, "causeGroup")).toEqual([{ label: "Equipment Fault", count: 1 }]);
  });

  it("caps results at topN", () => {
    const incidents = ["A", "B", "C", "D"].map((w) => makeIncident({ incidentWardDept: w }));
    expect(computeTopBreakdown(incidents, "incidentWardDept", 2)).toHaveLength(2);
  });
});

describe("computeDailyTimeSeries", () => {
  it("zero-fills days with no incidents across the requested window", () => {
    const series = computeDailyTimeSeries([], 7);
    expect(series).toHaveLength(7);
    expect(series.every((d) => d.count === 0)).toBe(true);
  });

  it("buckets incidents onto their dateOfIncident", () => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const incidents = [makeIncident({ dateOfIncident: todayIso }), makeIncident({ dateOfIncident: todayIso })];
    const series = computeDailyTimeSeries(incidents, 7);
    expect(series[series.length - 1].count).toBe(2);
    expect(series[series.length - 1].date).toBe(todayIso);
  });

  it("ignores incidents outside the requested window", () => {
    const incidents = [makeIncident({ dateOfIncident: "2000-01-01" })];
    const series = computeDailyTimeSeries(incidents, 7);
    expect(series.reduce((sum, d) => sum + d.count, 0)).toBe(0);
  });
});
