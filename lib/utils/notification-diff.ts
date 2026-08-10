import { formatStatusText, type IncidentReport, type IncidentStatus, type SeverityLevel } from "@/lib/types";

export type NotificationKind = "new_incident" | "status_change";

export interface DetectedNotification {
  id: string;
  type: NotificationKind;
  incidentId: number;
  title: string;
  description: string;
  severityLevel: SeverityLevel;
  createdAt: string;
}

export interface NotificationDiffInput {
  incidents: IncidentReport[];
  seenIncidentIds: number[];
  seenStatuses: Record<number, IncidentStatus>;
  /** True on the very first snapshot the app has ever seen — populate silently, don't flood notifications for pre-existing incidents. */
  isFirstRun: boolean;
}

export interface NotificationDiffResult {
  notifications: DetectedNotification[];
  nextSeenIncidentIds: number[];
  nextSeenStatuses: Record<number, IncidentStatus>;
}

export function diffIncidentsForNotifications(
  { incidents, seenIncidentIds, seenStatuses, isFirstRun }: NotificationDiffInput,
  now: () => string = () => new Date().toISOString()
): NotificationDiffResult {
  incidents = incidents ?? [];
  const nextSeenStatuses: Record<number, IncidentStatus> = { ...seenStatuses };

  if (isFirstRun) {
    for (const incident of incidents) {
      nextSeenStatuses[incident.id] = incident.incidentStatus;
    }
    return {
      notifications: [],
      nextSeenIncidentIds: incidents.map((i) => i.id),
      nextSeenStatuses,
    };
  }

  const seenIdSet = new Set(seenIncidentIds);
  const notifications: DetectedNotification[] = [];
  const timestamp = now();

  for (const incident of incidents) {
    if (!seenIdSet.has(incident.id)) {
      notifications.push({
        id: `new-${incident.id}`,
        type: "new_incident",
        incidentId: incident.id,
        title: "New incident reported",
        description: `${incident.incidentWardDept || "Unknown ward"} · ${incident.severityLevel}`,
        severityLevel: incident.severityLevel,
        createdAt: timestamp,
      });
    } else {
      const previousStatus = seenStatuses[incident.id];
      if (previousStatus && previousStatus !== incident.incidentStatus) {
        notifications.push({
          id: `status-${incident.id}-${incident.incidentStatus}-${timestamp}`,
          type: "status_change",
          incidentId: incident.id,
          title: "Incident status updated",
          description: `${incident.incidentWardDept || "Incident"} #${incident.id} moved to ${formatStatusText(incident.incidentStatus)}`,
          severityLevel: incident.severityLevel,
          createdAt: timestamp,
        });
      }
    }
    nextSeenStatuses[incident.id] = incident.incidentStatus;
  }

  return {
    notifications,
    nextSeenIncidentIds: incidents.map((i) => i.id),
    nextSeenStatuses,
  };
}
