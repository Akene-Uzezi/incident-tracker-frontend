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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { IncidentReport, PaginationMeta } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/ui/status-badge";

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
  const current_page = pagination?.current_page ?? currentPage ?? 1;
  const total_pages = pagination?.total_pages ?? 1;
  const total_items = pagination?.total_items ?? incidents.length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="py-3 pl-4 text-sm font-semibold text-foreground">Date</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Reporter</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Incident Ward / Dept</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Severity</TableHead>
              <TableHead className="py-3 text-sm font-semibold text-foreground">Status</TableHead>
              <TableHead className="py-3 pr-4 text-right text-sm font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="py-3.5 pl-4"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="py-3.5">
                    <Skeleton className="h-4 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-20" />
                  </TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="py-3.5 pr-4 text-right"><Skeleton className="ml-auto h-7 w-14" /></TableCell>
                </TableRow>
              ))
            ) : incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-sm italic text-muted-foreground">
                  No incident logs discovered matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((incident) => (
                <TableRow key={incident.id} className="transition-colors hover:bg-muted/30">
                  <TableCell className="py-3.5 pl-4 text-sm font-medium">
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
                    <SeverityBadge severity={incident.severityLevel} />
                  </TableCell>
                  <TableCell className="py-3.5 text-sm">
                    <StatusBadge status={incident.incidentStatus} />
                  </TableCell>
                  <TableCell className="py-3.5 pr-4 text-right">
                    <Button
                      onClick={() => onViewIncident(incident)}
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 text-xs font-medium text-primary hover:bg-primary/5 hover:text-primary"
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

      {!loading && (
        <div className="flex flex-col items-center justify-between gap-4 px-1 pt-2 sm:flex-row">
          <div className="text-sm text-muted-foreground">{total_items} Incidents found</div>
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
            <span className="px-2 text-sm">
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
