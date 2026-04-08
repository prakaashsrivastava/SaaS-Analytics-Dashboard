import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
import { getPlanLimits } from "@/lib/plan";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { authorized, context, response } =
      await ensurePermission("view_analytics");

    if (!authorized || !context) return response;

    const org = await prisma.organisation.findUnique({
      where: { id: context.orgId },
      select: { plan: true },
    });

    if (!org)
      return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });

    const limits = getPlanLimits(org.plan);
    const days = limits.dataWindowDays;

    // --- Double-Scoping Security Check ---
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: context.orgId },
    });

    if (!project) {
      return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });
    }
    // -------------------------------------

    // Use raw query for conditional aggregation (PostgreSQL)
    // We run two queries: one for the current period and one for the previous period to calculate delta
    const currentPeriodQuery = prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS total_pageviews,
        COUNT(*) FILTER (WHERE event_type = 'signup')::int AS total_signups,
        COALESCE(SUM(revenue), 0)::float AS total_revenue,
        COUNT(DISTINCT properties->>'session_id')::int AS unique_sessions
      FROM events
      WHERE project_id = ${projectId}::uuid
        AND occurred_at > NOW() - (INTERVAL '1 day' * ${days})
    `;

    const previousPeriodQuery = prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS total_pageviews,
        COUNT(*) FILTER (WHERE event_type = 'signup')::int AS total_signups,
        COALESCE(SUM(revenue), 0)::float AS total_revenue,
        COUNT(DISTINCT properties->>'session_id')::int AS unique_sessions
      FROM events
      WHERE project_id = ${projectId}::uuid
        AND occurred_at <= NOW() - (INTERVAL '1 day' * ${days})
        AND occurred_at > NOW() - (INTERVAL '1 day' * ${days * 2})
    `;

    interface QueryResult {
      total_pageviews: number;
      total_signups: number;
      total_revenue: number;
      unique_sessions: number;
    }

    const [currentResults, previousResults] = await Promise.all([
      currentPeriodQuery as Promise<QueryResult[]>,
      previousPeriodQuery as Promise<QueryResult[]>,
    ]);

    const current = currentResults[0];
    const previous = previousResults[0];

    const calculateDelta = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "NEW" : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return NextResponse.json({
      pageviews: {
        value: current.total_pageviews,
        delta: calculateDelta(
          current.total_pageviews,
          previous.total_pageviews
        ),
      },
      signups: {
        value: current.total_signups,
        delta: calculateDelta(current.total_signups, previous.total_signups),
      },
      revenue: {
        value: current.total_revenue,
        delta: calculateDelta(current.total_revenue, previous.total_revenue),
      },
      sessions: {
        value: current.unique_sessions,
        delta: calculateDelta(
          current.unique_sessions,
          previous.unique_sessions
        ),
      },
      windowDays: days,
    });
  } catch (error) {
    console.error("Overview Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
