"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeseriesChart } from "@/components/charts/TimeseriesChart";
import { EventBreakdownChart } from "@/components/charts/EventBreakdownChart";
import {
  Users,
  MousePointer2,
  CreditCard,
  Eye,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProjectAnalyticsProps,
  OverviewData,
  TimeseriesData,
  BreakdownData,
} from "@/types";

export function ProjectAnalytics({
  projectId,
  orgPlan,
}: ProjectAnalyticsProps) {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesData[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ovRes, tsRes, bdRes] = await Promise.all([
          fetch(`/api/analytics/${projectId}/overview`),
          fetch(`/api/analytics/${projectId}/timeseries`),
          fetch(`/api/analytics/${projectId}/breakdown`),
        ]);

        if (!ovRes.ok || !tsRes.ok || !bdRes.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const [ovData, tsData, bdData] = await Promise.all([
          ovRes.json(),
          tsRes.json(),
          bdRes.json(),
        ]);

        setOverview(ovData);
        setTimeseries(tsData);
        setBreakdown(bdData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId]);

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">Error loading analytics: {error}</p>
      </div>
    );
  }

  const isFreePlan = orgPlan.toLowerCase() === "free";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Pageviews"
          value={overview?.pageviews.value.toLocaleString() || "0"}
          delta={overview?.pageviews.delta}
          icon={<Eye className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Unique Sessions"
          value={overview?.sessions.value.toLocaleString() || "0"}
          delta={overview?.sessions.delta}
          icon={<Users className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Conversion (Signups)"
          value={overview?.signups.value.toLocaleString() || "0"}
          delta={overview?.signups.delta}
          icon={<MousePointer2 className="w-5 h-5" />}
          loading={loading}
        />
        <MetricCard
          title="Total Revenue"
          value={`₹${overview?.revenue.value.toLocaleString() || "0"}`}
          delta={overview?.revenue.delta}
          icon={<CreditCard className="w-5 h-5" />}
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TimeseriesChart data={timeseries} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <EventBreakdownChart data={breakdown} loading={loading} />
        </div>
      </div>

      {/* Upgrade Banner for FREE users */}
      {isFreePlan && !loading && (
        <Card className="bg-indigo-600 border-none shadow-xl overflow-hidden relative group cursor-pointer hover:bg-indigo-700 transition-colors duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ArrowUpRight className="w-40 h-40 text-white" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Unlock 90-day Data History
              </h3>
              <p className="text-indigo-100 font-medium text-lg leading-relaxed">
                You are currently viewing data for the last{" "}
                <span className="text-white font-black underline decoration-indigo-300">
                  7 days
                </span>
                . Upgrade to Pro to unlock full 90-day analytics and funnel
                insights.
              </p>
            </div>
            <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-black px-10 h-14 text-lg rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
