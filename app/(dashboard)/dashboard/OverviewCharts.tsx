"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts";
import type { IncidentStatus, SeverityLevel } from "@/lib/types";
import { formatStatusText } from "@/lib/types";
import type { CountBreakdown, DailyCount } from "@/lib/utils/incident-stats";

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
const GRID_STROKE = "var(--border)";

function TooltipCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10">
      {children}
    </div>
  );
}

export function IncidentsTrendChart({ data }: { data: DailyCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) {
    return <EmptyChartState message="No incidents recorded in this window yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="label"
          tick={AXIS_TICK}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
        <Tooltip
          cursor={{ stroke: "var(--chart-1)", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <TooltipCard>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-muted-foreground">{payload[0].value} incident{payload[0].value === 1 ? "" : "s"}</div>
              </TooltipCard>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="var(--chart-1)"
          strokeWidth={2}
          fill="url(#trendFill)"
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const SEVERITY_COLOR: Record<SeverityLevel, string> = {
  "near miss": "var(--chart-severity-near-miss)",
  minor: "var(--chart-severity-minor)",
  major: "var(--chart-severity-major)",
  critical: "var(--chart-severity-critical)",
};

const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  "near miss": "Near Miss",
  minor: "Minor",
  major: "Major",
  critical: "Critical",
};

export function SeverityBreakdownChart({ counts }: { counts: Record<SeverityLevel, number> }) {
  const data = (["near miss", "minor", "major", "critical"] as SeverityLevel[]).map((level) => ({
    level,
    label: SEVERITY_LABEL[level],
    count: counts[level],
    fill: SEVERITY_COLOR[level],
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return <EmptyChartState message="No severity data yet." />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { label: string; count: number };
            return (
              <TooltipCard>
                <div className="font-medium text-foreground">{p.label}</div>
                <div className="text-muted-foreground">{p.count} incident{p.count === 1 ? "" : "s"}</div>
              </TooltipCard>
            );
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((d) => (
            <Cell key={d.level} fill={d.fill} />
          ))}
          <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const STATUS_COLOR: Record<IncidentStatus, string> = {
  resolved: "var(--chart-status-resolved)",
  inprogress: "var(--chart-status-inprogress)",
  unresolved: "var(--chart-status-unresolved)",
};

export function StatusBreakdownChart({ counts }: { counts: Record<IncidentStatus, number> }) {
  const data = (["unresolved", "inprogress", "resolved"] as IncidentStatus[]).map((status) => ({
    status,
    label: formatStatusText(status),
    count: counts[status],
    fill: STATUS_COLOR[status],
  }));
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (total === 0) return <EmptyChartState message="No status data yet." />;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis type="category" dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} width={72} />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as { label: string; count: number };
            return (
              <TooltipCard>
                <div className="font-medium text-foreground">{p.label}</div>
                <div className="text-muted-foreground">{p.count} incident{p.count === 1 ? "" : "s"}</div>
              </TooltipCard>
            );
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((d) => (
            <Cell key={d.status} fill={d.fill} />
          ))}
          <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopBreakdownChart({ data, emptyMessage }: { data: CountBreakdown[]; emptyMessage: string }) {
  if (data.length === 0) return <EmptyChartState message={emptyMessage} />;

  const height = Math.max(160, data.length * 34);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          cursor={{ fill: "var(--muted)" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as CountBreakdown;
            return (
              <TooltipCard>
                <div className="font-medium text-foreground">{p.label}</div>
                <div className="text-muted-foreground">{p.count} incident{p.count === 1 ? "" : "s"}</div>
              </TooltipCard>
            );
          }}
        />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={18}>
          <LabelList dataKey="count" position="right" fill="var(--foreground)" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
