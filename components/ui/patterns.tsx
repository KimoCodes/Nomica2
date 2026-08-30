import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : ""}{trend.value}% from last week
              </p>
            )}
          </div>
          {icon && (
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

type MetricCardProps = {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: string;
  className?: string;
};

export function MetricCard({ label, value, max, unit = "", color = "bg-primary", className }: MetricCardProps) {
  const percentage = Math.min(100, Math.round((value / max) * 100));

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">
              {value}{unit}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full transition-all", color)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {percentage}% of {max}{unit}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

type ProgressCardProps = {
  title: string;
  current: number;
  target: number;
  description?: string;
  className?: string;
};

export function ProgressCard({ title, current, target, description, className }: ProgressCardProps) {
  const progress = Math.min(100, Math.round((current / target) * 100));
  const isComplete = progress >= 100;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <p className="text-sm font-medium">
              {current}/{target}
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all",
                isComplete ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type InfoCardProps = {
  title: string;
  content: string;
  variant?: "default" | "success" | "warning" | "error";
  className?: string;
};

export function InfoCard({ title, content, variant = "default", className }: InfoCardProps) {
  const variantStyles = {
    default: "border-primary/20 bg-primary/5",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    error: "border-red-200 bg-red-50",
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardContent className="p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{content}</p>
        </div>
      </CardContent>
    </Card>
  );
}
