import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function MetricCard({
  title,
  valuePaise,
  subtitle,
  icon: Icon,
  trend,
  className,
  formatCompact,
}: {
  title: string;
  valuePaise: number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { label: string; positive?: boolean };
  className?: string;
  formatCompact?: boolean;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">
          {formatINR(valuePaise, { compact: formatCompact })}
        </div>
        {subtitle ? (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {trend ? (
          <p
            className={cn(
              "mt-1 text-xs",
              trend.positive === true && "text-emerald-400",
              trend.positive === false && "text-rose-400",
              trend.positive === undefined && "text-muted-foreground"
            )}
          >
            {trend.label}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ScoreCard({
  title,
  score,
  subtitle,
}: {
  title: string;
  score: number;
  subtitle?: string;
}) {
  const color =
    score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-semibold tracking-tight", color)}>{score}</div>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}
