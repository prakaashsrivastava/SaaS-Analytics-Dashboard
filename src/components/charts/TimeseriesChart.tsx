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
      <Card className="shadow-sm border-slate-200 bg-white/50 animate-pulse">
        <CardHeader className="h-20 bg-slate-50 opacity-50" />
        <CardContent className="h-64 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-slate-100 rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map((item: TimeseriesData) => ({
    ...item,
    formattedDate: format(parseISO(item.day), "MMM d"),
  }));

  return (
    <Card className="shadow-sm border-slate-200 bg-white overflow-hidden group">
      <CardHeader className="pb-2 border-b border-slate-50">
        <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
          Event Activity
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium tracking-tight">
          Total actions tracked across your application daily.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  padding: "12px",
                }}
                itemStyle={{ color: "#4f46e5", fontWeight: "bold" }}
                labelStyle={{
                  marginBottom: "4px",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              />
              <Area
                type="monotone"
                dataKey="event_count"
                name="Events"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorEvents)"
                animationDuration={1500}
                dot={{ r: 4, fill: "#fff", stroke: "#4f46e5", strokeWidth: 2 }}
                activeDot={{
                  r: 6,
                  fill: "#4f46e5",
                  stroke: "#fff",
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
