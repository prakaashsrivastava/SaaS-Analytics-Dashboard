import { MetricCardProps } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  delta,
  icon,
  loading,
}: MetricCardProps) {
  const isPositive = typeof delta === "number" && delta > 0;
  const isNegative = typeof delta === "number" && delta < 0;
  const isNew = delta === "NEW";

  return (
    <Card className="shadow-card border-border overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="p-2.5 bg-primary-subtle rounded-xl group-hover:bg-primary-tint transition-colors duration-300">
            <span className="text-primary group-hover:text-primary-dark transition-colors duration-300">
              {icon}
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-12 bg-surface-raised animate-pulse rounded-full" />
          ) : (
            delta !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300",
                  isPositive && "bg-success-tint text-success",
                  isNegative && "bg-danger-tint text-danger",
                  isNew && "bg-primary-tint text-primary",
                  !isPositive &&
                    !isNegative &&
                    !isNew &&
                    "bg-surface-raised text-text-muted"
                )}
              >
                {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
                {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
                {!isNew && delta !== 0 && (
                  <span>{Math.abs(delta as number)}%</span>
                )}
                {isNew && <span className="tracking-tight px-0.5">NEW</span>}
                {delta === 0 && <Minus className="w-3.5 h-3.5" />}
              </div>
            )
          )}
        </div>
        <div>
          <p className="text-[13px] font-medium text-text-secondary uppercase tracking-widest mb-1 transition-colors">
            {title}
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-surface-raised animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-[28px] font-semibold text-text-primary tracking-tight transition-colors duration-300">
              {value}
            </h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
