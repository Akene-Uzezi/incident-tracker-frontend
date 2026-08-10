export interface IncidentFilters {
  page: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const queryKeys = {
  incidents: {
    all: ["incidents"] as const,
    list: (filters: IncidentFilters) => ["incidents", "list", filters] as const,
    analytics: () => ["incidents", "analytics"] as const,
  },
  management: {
    detail: (incidentId: number) => ["management", incidentId] as const,
  },
  comments: {
    forIncident: (incidentId: number) => ["comments", incidentId] as const,
  },
  logs: {
    forIncident: (incidentId: number) => ["logs", incidentId] as const,
  },
  users: {
    all: ["users"] as const,
    list: (page: number, limit: number) => ["users", "list", page, limit] as const,
    search: (query: string) => ["users", "search", query] as const,
  },
  notifications: {
    poll: () => ["notifications", "poll"] as const,
  },
};
