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
      <div className="bg-surface border border-border rounded-[12px] p-4 shadow-card animate-in zoom-in-95 duration-200">
        <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-xl font-bold text-text-primary">
          {payload[0].value}%
        </p>
        <p className="text-[10px] font-bold text-text-muted mt-1 uppercase tracking-tight">
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
      <Card className="premium-card rounded-2xl overflow-hidden h-[400px]">
        <div className="p-6 h-full flex flex-col items-center justify-center">
          <div className="w-40 h-40 bg-surface-raised animate-pulse rounded-full" />
          <div className="mt-8 space-y-2 w-full">
            <div className="h-4 w-1/2 bg-surface-raised animate-pulse rounded mx-auto" />
            <div className="h-4 w-1/3 bg-surface-raised animate-pulse rounded mx-auto" />
          </div>
        </div>
      </Card>
    );
  }

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

  return (
    <Card className="premium-card rounded-2xl overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-subtle rounded-lg group-hover:bg-primary transition-colors duration-500">
            <Users2 className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-premium tracking-tight uppercase">
              Retention Analytics
            </CardTitle>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest leading-none mt-0.5">
              Cohort Performance
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 px-6">
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
                  fontWeight: 700,
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
              className="text-center p-3 rounded-2xl bg-surface-raised border border-border hover:bg-surface transition-colors"
            >
              <span className="block text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">
                {item.name}
              </span>
              <span
                className="block text-sm font-bold"
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
