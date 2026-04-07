import { ReactNode } from "react";

export interface AnalyticsMetric {
  value: number | string;
  delta: number | "NEW";
}

export interface OverviewData {
  pageviews: AnalyticsMetric;
  signups: AnalyticsMetric;
  revenue: AnalyticsMetric;
  sessions: AnalyticsMetric;
  windowDays: number;
}

export interface TimeseriesData {
  day: string;
  event_count: number;
  daily_revenue: number;
  formattedDate?: string;
}

export interface BreakdownData {
  eventType: string;
  count: number;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  delta?: number | "NEW";
  icon?: ReactNode;
  loading?: boolean;
}

export interface TimeseriesChartProps {
  data: TimeseriesData[];
  loading?: boolean;
}

export interface EventBreakdownChartProps {
  data: BreakdownData[];
  loading?: boolean;
}

export interface ProjectAnalyticsProps {
  projectId: string;
  orgPlan: string;
}
