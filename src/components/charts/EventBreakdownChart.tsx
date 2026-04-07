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
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

export function EventBreakdownChart({
  data,
  loading,
}: EventBreakdownChartProps) {
  if (loading) {
    return (
      <Card className="shadow-sm border-slate-200 bg-white/50 animate-pulse">
        <CardHeader className="h-20 bg-slate-50 opacity-50" />
        <CardContent className="h-64 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-slate-100 rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  // Pre-process data
  const formattedData = data.slice(0, 6);

  return (
    <Card className="shadow-sm border-slate-200 bg-white overflow-hidden group">
      <CardHeader className="pb-2 border-b border-slate-50">
        <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
          Event Breakdown
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium tracking-tight">
          Distribution of different event types tracked.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis type="number" axisLine={false} tickLine={false} hide />
              <YAxis
                dataKey="eventType"
                type="category"
                axisLine={false}
                tickLine={false}
                width={100}
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                  fontWeight: 700,
                  textAnchor: "start",
                }}
                dx={-90}
                y={0}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
                itemStyle={{ fontWeight: "bold" }}
                labelStyle={{
                  marginBottom: "4px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              />
              <Bar
                dataKey="count"
                name="Total"
                radius={[0, 8, 8, 0]}
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
