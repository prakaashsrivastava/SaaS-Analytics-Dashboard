"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { FunnelChartProps, FunnelTooltipProps } from "@/types";

const CustomTooltip = ({ active, payload }: FunnelTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none rounded-xl p-4 shadow-2xl">
        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">
          {payload[0].payload.step}
        </p>
        <p className="text-xl font-black text-white">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-slate-400 mt-1">
          {payload[0].payload.percentage}% Conversion from previous
        </p>
      </div>
    );
  }
  return null;
};

export function FunnelChart({ data, loading }: FunnelChartProps) {
  if (loading) {
    return (
      <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[400px]">
        <div className="p-6 h-full flex flex-col">
          <div className="h-6 w-32 bg-slate-100 animate-pulse rounded mb-8" />
          <div className="flex-1_space-y-4">
            <div className="h-12 w-full bg-slate-50 animate-pulse rounded-xl" />
            <div className="h-12 w-3/4 bg-slate-50 animate-pulse rounded-xl" />
            <div className="h-12 w-1/2 bg-slate-50 animate-pulse rounded-xl" />
          </div>
        </div>
      </Card>
    );
  }

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8"];

  return (
    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Filter className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-900 tracking-tight">
              CONVERSION FUNNEL
            </CardTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              LAST 30 DAYS
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 5, right: 80, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="step"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }}
                width={80}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f1f5f9" }}
              />
              <Bar dataKey="count" radius={[0, 12, 12, 0]} barSize={40}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fontSize: 12, fontWeight: 800, fill: "#1e293b" }}
                  formatter={(
                    val:
                      | string
                      | number
                      | (string | number)[]
                      | boolean
                      | null
                      | undefined
                  ) =>
                    typeof val === "number" || typeof val === "string"
                      ? Number(val).toLocaleString()
                      : "0"
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="text-center flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Drop-off Rate
            </p>
            <p className="text-xl font-black text-slate-900">
              {data.length > 2 ? 100 - data[2].percentage : 0}%
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center flex-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Top Segment
            </p>
            <p className="text-xl font-black text-indigo-600">
              {data[0]?.step || "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
