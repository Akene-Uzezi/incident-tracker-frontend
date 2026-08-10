import type { IncidentReport, IncidentStatus, SeverityLevel } from "@/lib/types";
import { toIsoDate, parseIsoDate } from "@/lib/utils/date";

export interface CountBreakdown {
  label: string;
  count: number;
}

const STATUS_ORDER: IncidentStatus[] = ["unresolved", "inprogress", "resolved"];
const SEVERITY_ORDER: SeverityLevel[] = ["near miss", "minor", "major", "critical"];

export function computeStatusCounts(incidents: IncidentReport[]): Record<IncidentStatus, number> {
  const counts: Record<IncidentStatus, number> = { unresolved: 0, inprogress: 0, resolved: 0 };
  for (const incident of incidents) {
    if (incident.incidentStatus in counts) counts[incident.incidentStatus] += 1;
  }
  return counts;
}

export function computeSeverityCounts(incidents: IncidentReport[]): Record<SeverityLevel, number> {
  const counts: Record<SeverityLevel, number> = { "near miss": 0, minor: 0, major: 0, critical: 0 };
  for (const incident of incidents) {
    if (incident.severityLevel in counts) counts[incident.severityLevel] += 1;
  }
  return counts;
}

export function computeNearMissCount(incidents: IncidentReport[]): number {
  return incidents.filter((incident) => incident.isNearMiss).length;
}

export { STATUS_ORDER, SEVERITY_ORDER };

/** Top N values of a free-text field, ranked by frequency, blank/missing entries excluded. */
export function computeTopBreakdown(
  incidents: IncidentReport[],
  field: "incidentWardDept" | "causeGroup",
  topN = 6
): CountBreakdown[] {
  const counts = new Map<string, number>();
  for (const incident of incidents) {
    const raw = incident[field]?.trim();
    if (!raw) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

export interface DailyCount {
  date: string; // ISO yyyy-mm-dd
  label: string; // short display label, e.g. "Jul 21"
  count: number;
}

/** Daily incident counts for the trailing `days` days (today inclusive), zero-filled. */
export function computeDailyTimeSeries(incidents: IncidentReport[], days = 30): DailyCount[] {
  const counts = new Map<string, number>();
  for (const incident of incidents) {
    const occurred = parseIsoDate(incident.dateOfIncident);
    if (!occurred) continue;
    const key = toIsoDate(occurred);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: DailyCount[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = toIsoDate(d);
    series.push({
      date: key,
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      count: counts.get(key) ?? 0,
    });
  }
  return series;
}
