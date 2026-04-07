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
    <Card className="shadow-sm border-slate-200 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-indigo-50 transition-colors duration-300">
            <span className="text-slate-600 group-hover:text-indigo-600 transition-colors duration-300">
              {icon}
            </span>
          </div>
          {loading ? (
            <div className="h-6 w-12 bg-slate-100 animate-pulse rounded-full" />
          ) : (
            delta !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300",
                  isPositive && "bg-emerald-50 text-emerald-600",
                  isNegative && "bg-rose-50 text-rose-600",
                  isNew && "bg-indigo-50 text-indigo-600",
                  !isPositive &&
                    !isNegative &&
                    !isNew &&
                    "bg-slate-100 text-slate-500"
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
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-700 transition-colors">
            {title}
          </p>
          {loading ? (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg mt-1" />
          ) : (
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors duration-300">
              {value}
            </h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
