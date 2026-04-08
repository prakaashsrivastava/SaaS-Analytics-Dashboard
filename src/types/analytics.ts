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

export interface FunnelData {
  step: string;
  count: number;
  percentage: number;
}

export interface RetentionData {
  name: string;
  value: number;
}

export interface FunnelChartProps {
  data: FunnelData[];
  loading?: boolean;
}

export interface FunnelTooltipProps {
  active?: boolean;
  payload?: {
    payload: FunnelData;
    value: number;
    name: string;
  }[];
}

export interface RetentionChartProps {
  data: RetentionData[];
  loading?: boolean;
}

export interface RetentionTooltipProps {
  active?: boolean;
  payload?: {
    payload: RetentionData;
    value: number;
    name: string;
  }[];
}

export interface RealtimeEvent {
  id: string;
  projectId: string;
  eventType: string;
  properties: Record<string, string | number | boolean | null>;
  revenue: string | number;
  occurredAt: string;
}

export interface RealtimeStreamProps {
  projectId: string;
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
