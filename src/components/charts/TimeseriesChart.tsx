"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TimeseriesChartProps, TimeseriesData } from "@/types";

export function TimeseriesChart({ data, loading }: TimeseriesChartProps) {
  if (loading) {
    return (
      <Card className="premium-card bg-surface-raised animate-pulse">
        <CardHeader className="h-20 bg-surface-raised opacity-50" />
        <CardContent className="h-64 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-surface rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item: TimeseriesData) => ({
    ...item,
    formattedDate: format(parseISO(item.day), "MMM d"),
  }));

  return (
    <Card className="premium-card overflow-hidden group">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-xl font-bold text-premium tracking-tight">
          Event Activity
        </CardTitle>
        <CardDescription className="text-text-secondary font-medium tracking-tight">
          Total actions tracked across your application daily.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  boxShadow: "var(--shadow-card)",
                  padding: "12px",
                  backgroundColor: "var(--color-surface)",
                }}
                itemStyle={{
                  color: "var(--color-primary)",
                  fontWeight: "bold",
                }}
                labelStyle={{
                  marginBottom: "6px",
                  fontWeight: "700",
                  fontSize: "13px",
                  color: "var(--color-text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              />
              <Area
                type="monotone"
                dataKey="event_count"
                name="Events"
                stroke="var(--color-primary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEvents)"
                animationDuration={1500}
                dot={{
                  r: 4,
                  fill: "var(--color-surface)",
                  stroke: "var(--color-primary)",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "var(--color-primary)",
                  stroke: "var(--color-surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
