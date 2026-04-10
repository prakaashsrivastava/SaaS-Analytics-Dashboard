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
      <div className="bg-surface border border-border rounded-[12px] p-4 shadow-card">
        <p className="text-[10px] font-bold uppercase text-primary tracking-widest mb-1">
          {payload[0].payload.step}
        </p>
        <p className="text-xl font-bold text-text-primary">
          {payload[0].value.toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-text-muted mt-1">
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
      <Card className="premium-card rounded-2xl overflow-hidden h-[400px]">
        <div className="p-6 h-full flex flex-col">
          <div className="h-6 w-32 bg-surface-raised animate-pulse rounded mb-8" />
          <div className="flex-1 space-y-4">
            <div className="h-12 w-full bg-surface-raised animate-pulse rounded-xl" />
            <div className="h-12 w-3/4 bg-surface-raised animate-pulse rounded-xl" />
            <div className="h-12 w-1/2 bg-surface-raised animate-pulse rounded-xl" />
          </div>
        </div>
      </Card>
    );
  }

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

  return (
    <Card className="premium-card rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-subtle rounded-lg">
            <Filter className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-premium tracking-tight uppercase">
              Conversion Funnel
            </CardTitle>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest leading-none mt-0.5">
              Last 30 Days
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
              margin={{ top: 5, right: 80, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="step"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "var(--color-text-muted)",
                }}
                width={100}
                dx={-20}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "var(--color-surface-hover)" }}
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
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fill: "var(--color-text-primary)",
                  }}
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

        <div className="mt-6 flex justify-between items-center bg-surface-raised p-4 rounded-2xl border border-border">
          <div className="text-center flex-1">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">
              Drop-off Rate
            </p>
            <p className="text-xl font-bold text-text-primary">
              {data.length > 2 ? 100 - data[2].percentage : 0}%
            </p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center flex-1">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1">
              Top Segment
            </p>
            <p className="text-xl font-bold text-primary">
              {data[0]?.step || "N/A"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
