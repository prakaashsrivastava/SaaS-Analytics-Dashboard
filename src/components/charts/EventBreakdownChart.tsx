"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { EventBreakdownChartProps } from "@/types";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function EventBreakdownChart({
  data,
  loading,
}: EventBreakdownChartProps) {
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

  // Pre-process data
  const formattedData = data.slice(0, 6);

  return (
    <Card className="premium-card overflow-hidden group">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-xl font-bold text-premium tracking-tight">
          Event Breakdown
        </CardTitle>
        <CardDescription className="text-text-secondary font-medium tracking-tight">
          Distribution of different event types tracked.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ left: 60, right: 30, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis type="number" axisLine={false} tickLine={false} hide />
              <YAxis
                dataKey="eventType"
                type="category"
                axisLine={false}
                tickLine={false}
                width={120}
                tick={{
                  fill: "var(--color-text-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                  textAnchor: "start",
                }}
                dx={-110}
              />
              <Tooltip
                cursor={{ fill: "var(--color-surface-raised)" }}
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
              <Bar
                dataKey="count"
                name="Total"
                radius={[0, 6, 6, 0]}
                barSize={20}
                animationDuration={1500}
              >
                {formattedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
