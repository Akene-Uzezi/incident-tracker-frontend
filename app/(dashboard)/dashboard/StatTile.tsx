import { type ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "unresolved" | "inprogress" | "resolved" | "critical" | "info";
  loading?: boolean;
}

const TONE_CLASSES: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  unresolved: "bg-chart-status-unresolved/10 text-chart-status-unresolved",
  inprogress: "bg-chart-status-inprogress/10 text-chart-status-inprogress",
  resolved: "bg-chart-status-resolved/10 text-chart-status-resolved",
  critical: "bg-chart-severity-critical/10 text-chart-severity-critical",
  info: "bg-chart-severity-minor/10 text-chart-severity-minor",
};

export function StatTile({ label, value, icon: Icon, tone = "default", loading }: StatTileProps) {
  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-sm">
      <CardContent className="flex items-center gap-3.5 p-4">
        <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</span>
          {loading ? (
            <Skeleton className="mt-1 h-7 w-14" />
          ) : (
            <span className="font-heading text-2xl font-bold tabular-nums text-foreground">{value}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
