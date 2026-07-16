import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentStatus, SeverityLevel } from "@/lib/types";
import { formatStatusText } from "@/lib/types";

const SEVERITY_CLASSES: Record<SeverityLevel, string> = {
  critical:
    "bg-red-50 text-red-700 border-red-200/70 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  major:
    "bg-orange-50 text-orange-700 border-orange-200/70 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  minor:
    "bg-blue-50 text-blue-700 border-blue-200/70 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "near miss":
    "bg-zinc-100 text-zinc-600 border-zinc-200/70 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20",
};

const STATUS_CLASSES: Record<IncidentStatus, string> = {
  resolved:
    "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  inprogress:
    "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  unresolved:
    "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: SeverityLevel;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize", SEVERITY_CLASSES[severity], className)}
    >
      {severity}
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: IncidentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSES[status], className)}>
      {formatStatusText(status)}
    </Badge>
  );
}
