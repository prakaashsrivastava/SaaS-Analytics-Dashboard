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
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
      <div className="p-8 bg-danger-tint border border-danger/10 rounded-2xl flex items-center gap-4 text-danger-text animate-in fade-in duration-500">
        <AlertCircle className="w-6 h-6" />
        <div className="space-y-1">
          <p className="font-black uppercase tracking-tight">Error loading analytics</p>
          <p className="text-sm font-medium opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const isPro = orgPlan?.toLowerCase() === "pro";

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Header Actions */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="h-9 px-6 border-border bg-surface hover:bg-surface-hover font-black text-text-secondary gap-3 rounded-2xl transition-all hover:shadow-lg active:scale-95"
        >
          {isExporting ? (
            <AlertCircle className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
          )}
          <span className="uppercase tracking-widest text-[10px]">Export CSV</span>
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
          <Card className="bg-primary border-none shadow-2xl overflow-hidden relative group cursor-pointer hover:bg-primary-dark transition-all duration-700 rounded-3xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <ArrowUpRight className="w-48 h-48 text-white" />
            </div>
            <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              <div className="space-y-3 text-center md:text-left">
                <h3 className="text-3xl font-black text-white">
                  Unlock 90-day Data History
                </h3>
                <p className="text-primary-tint font-medium text-lg leading-relaxed max-w-xl">
                  You are currently viewing data for the last{" "}
                  <span className="text-white font-black underline decoration-primary-light decoration-4 underline-offset-4">
                    7 days
                  </span>
                  . Upgrade to Pro to unlock full 90-day analytics, funnel
                  insights, and retention metrics.
                </p>
              </div>
              <Button className="bg-surface text-primary hover:bg-surface-raised font-black px-12 h-16 text-lg rounded-2xl shadow-2xl hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-2 group">
                Upgrade Now
                <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Onboarding Guide if no data */}
      {!loading && overview && overview.pageviews.value === 0 && (
        <div className="pt-12 border-t border-border">
          <TrackingGuide projectId={projectId} />
        </div>
      )}
    </div>
  );
}
