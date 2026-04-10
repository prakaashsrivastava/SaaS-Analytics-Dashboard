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
    <Card className="premium-card overflow-hidden group">
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
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 border uppercase tracking-tight",
                  isPositive &&
                    "bg-success-tint text-success-text border-success/10",
                  isNegative &&
                    "bg-danger-tint text-danger-text border-danger/10",
                  isNew && "bg-primary-tint/50 text-primary border-primary/10",
                  !isNew && "bg-surface-raised text-text-muted border-border"
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
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1 transition-colors">
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
