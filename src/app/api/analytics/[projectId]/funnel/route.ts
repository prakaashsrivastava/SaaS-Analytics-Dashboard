import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
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

    // --- Double-Scoping Security Check ---
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: context.orgId },
    });

    if (!project) {
      return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });
    }

    // Hardcoded demo funnel: page_view -> signup -> revenue (using events with revenue > 0 as proxy)
    // In a real app, this would be more complex (tracking unique users through steps)
    // For this demo, we'll use total volume of these events in the last 30 days
    const results = await prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'page_view')::int AS page_views,
        COUNT(*) FILTER (WHERE event_type = 'signup')::int AS signups,
        COUNT(*) FILTER (WHERE event_type = 'purchase' OR revenue > 0)::int AS conversions
      FROM events
      WHERE project_id = ${projectId}::uuid
        AND occurred_at > NOW() - INTERVAL '30 days'
    `;

    interface FunnelResult {
      page_views: number;
      signups: number;
      conversions: number;
    }

    const data = results as FunnelResult[];
    const stats = data[0];

    const funnelData = [
      { step: "Page Views", count: stats.page_views, percentage: 100 },
      {
        step: "Signups",
        count: stats.signups,
        percentage:
          stats.page_views > 0
            ? Math.round((stats.signups / stats.page_views) * 100)
            : 0,
      },
      {
        step: "Revenue",
        count: stats.conversions,
        percentage:
          stats.signups > 0
            ? Math.round((stats.conversions / stats.signups) * 100)
            : 0,
      },
    ];

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error("Funnel Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
