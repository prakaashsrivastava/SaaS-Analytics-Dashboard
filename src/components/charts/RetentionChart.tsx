"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users2 } from "lucide-react";
import { RetentionChartProps, RetentionTooltipProps } from "@/types";

const CustomTooltip = ({ active, payload }: RetentionTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border-none rounded-xl p-4 shadow-2xl animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-xl font-black text-white">{payload[0].value}%</p>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
          Cohort Performance
        </p>
      </div>
    );
  }
  return null;
};

export function RetentionChart({ data, loading }: RetentionChartProps) {
  if (loading) {
    return (
      <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm h-[400px]">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="w-40 h-40 bg-slate-50 animate-pulse rounded-full" />
          <div className="mt-8 space-y-2 w-full">
            <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded mx-auto" />
            <div className="h-4 w-1/3 bg-slate-50 animate-pulse rounded mx-auto" />
          </div>
        </div>
      </Card>
    );
  }

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8"];

  return (
    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
            <Users2 className="w-4 h-4 text-indigo-600 transition-colors" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-900 tracking-tight">
              RETENTION ANALYTICS
            </CardTitle>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
              COHORT PERFORMANCE
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "10px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  paddingTop: "20px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="text-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {item.name}
              </span>
              <span
                className="block text-sm font-black italic"
                style={{ color: COLORS[index % COLORS.length] }}
              >
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
