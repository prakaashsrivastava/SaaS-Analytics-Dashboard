"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/charts/MetricCard";
import { TimeseriesChart } from "@/components/charts/TimeseriesChart";
import { EventBreakdownChart } from "@/components/charts/EventBreakdownChart";
import { FunnelChart } from "@/components/charts/FunnelChart";
import { RetentionChart } from "@/components/charts/RetentionChart";
import {
  Users,
  MousePointer2,
  CreditCard,
  Eye,
  AlertCircle,
  ArrowUpRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingGuide } from "@/components/projects/TrackingGuide";
import { Card, CardContent } from "@/components/ui/card";
import {
  ProjectAnalyticsProps,
  OverviewData,
  TimeseriesData,
  BreakdownData,
  FunnelData,
  RetentionData,
} from "@/types";

export function ProjectAnalytics({
  projectId,
  orgPlan,
}: ProjectAnalyticsProps) {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesData[]>([]);
  const [breakdown, setBreakdown] = useState<BreakdownData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [retention, setRetention] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const isPro = orgPlan.toLowerCase() === "pro";

        const requests = [
          fetch(`/api/analytics/${projectId}/overview`),
          fetch(`/api/analytics/${projectId}/timeseries`),
          fetch(`/api/analytics/${projectId}/breakdown`),
        ];

        if (isPro) {
          requests.push(fetch(`/api/analytics/${projectId}/funnel`));
          requests.push(fetch(`/api/analytics/${projectId}/retention`));
        }

        const responses = await Promise.all(requests);

        if (responses.some((r) => !r.ok)) {
          throw new Error("Failed to fetch some analytics data");
        }

        const data = await Promise.all(responses.map((r) => r.json()));

        setOverview(data[0]);
        setTimeseries(data[1]);
        setBreakdown(data[2]);

        if (isPro) {
          setFunnel(data[3]);
          setRetention(data[4]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, orgPlan]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/analytics/${projectId}/export`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-export-${projectId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600">
        <AlertCircle className="w-6 h-6" />
        <p className="font-bold">Error loading analytics: {error}</p>
      </div>
    );
  }

  const isPro = orgPlan?.toLowerCase() === "pro";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-600 gap-2"
        >
          {isExporting ? (
            <AlertCircle className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export CSV
        </Button>
      </div>

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

      {/* Charts Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TimeseriesChart data={timeseries} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <EventBreakdownChart data={breakdown} loading={loading} />
        </div>
      </div>

      {isPro && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-1000">
          <FunnelChart data={funnel} />
          <RetentionChart data={retention} />
        </div>
      )}

      {/* Upgrade Banner for FREE users */}
      {!isPro &&
        !loading &&
        overview &&
        Number(overview.pageviews.value) > 0 && (
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
                  . Upgrade to Pro to unlock full 90-day analytics, funnel
                  insights, and retention metrics.
                </p>
              </div>
              <Button className="bg-white text-indigo-600 hover:bg-slate-50 font-black px-10 h-14 text-lg rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Onboarding Guide if no data */}
      {!loading && overview && overview.pageviews.value === 0 && (
        <div className="pt-8 border-t border-slate-100 italic">
          <TrackingGuide projectId={projectId} />
        </div>
      )}
    </div>
  );
}
