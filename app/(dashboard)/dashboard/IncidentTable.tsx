"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import {
  IncidentReport,
  PaginationMeta,
  getSeverityBadgeClass,
  getStatusBadgeClass,
  formatStatusText,
} from "./types";

interface IncidentTableProps {
  incidents: IncidentReport[];
  loading: boolean;
  pagination: PaginationMeta | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewIncident: (incident: IncidentReport) => void;
}

export function IncidentTable({
  incidents,
  loading,
  pagination,
  currentPage,
  onPageChange,
  onViewIncident,
}: IncidentTableProps) {
  // Defensive key normalization: parses snake_case from Go backend, camelCase from clients, or safe fallbacks
  const current_page = pagination
    ? (pagination.current_page ?? (pagination as any).currentPage ?? currentPage ?? 1)
    : (currentPage ?? 1);

  const total_pages = pagination
    ? (pagination.total_pages ?? (pagination as any).totalPages ?? 1)
    : 1;

  const total_items = pagination
    ? (pagination.total_items ?? (pagination as any).totalItems ?? incidents.length)
    : incidents.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-sm text-foreground py-3 pl-4">
                Date
              </TableHead>
              <TableHead className="font-semibold text-sm text-foreground py-3">
                Reporter
              </TableHead>
              <TableHead className="font-semibold text-sm text-foreground py-3">
                Incident Ward / Dept
              </TableHead>
              <TableHead className="font-semibold text-sm text-foreground py-3">
                Severity
              </TableHead>
              <TableHead className="font-semibold text-sm text-foreground py-3">
                Status
              </TableHead>
              <TableHead className="font-semibold text-sm text-foreground py-3 pr-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  Loading safety records...
                </TableCell>
              </TableRow>
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground italic">
                  No incident logs discovered matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="py-3.5 pl-4 font-medium text-sm">
                    {incident.date || incident.dateOfIncident}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    <div className="font-medium text-foreground">{incident.reporterName}</div>
                    <div className="text-xs text-muted-foreground">{incident.reporterDesignation}</div>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-muted-foreground">
                    {incident.incidentWardDept}
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getSeverityBadgeClass(incident.severityLevel)}`}>
                      {incident.severityLevel}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${getStatusBadgeClass(incident.incidentStatus)}`}>
                      {formatStatusText ? formatStatusText(incident.incidentStatus) : incident.incidentStatus}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 pr-4 text-right">
                    <Button
                      onClick={() => onViewIncident(incident)}
                      size="sm"
                      variant="ghost"
                      className="text-xs h-8 font-medium gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Fixed: Guaranteed execution context block that renders footer directly below the table container */}
      {!loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 px-1">
          <div className="text-sm text-muted-foreground">
            {total_items} Incidents found
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(current_page - 1)}
              disabled={current_page <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">
              Page {current_page} of {total_pages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(current_page + 1)}
              disabled={current_page >= total_pages}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
