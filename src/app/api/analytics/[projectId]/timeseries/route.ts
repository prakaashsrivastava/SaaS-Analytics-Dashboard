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
      select: { plan: true, timezone: true },
    });

    if (!org)
      return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });

    const limits = getPlanLimits(org.plan);
    const days = limits.dataWindowDays;
    // Hardcoded Asia/Kolkata as requested, or fallback to org.timezone if available
    const timezone = "Asia/Kolkata";

    // Use raw query for date_trunc with timezone (PostgreSQL)
    const results = await prisma.$queryRaw`
      SELECT
        date_trunc('day', occurred_at AT TIME ZONE 'UTC' AT TIME ZONE ${timezone}) AS day,
        COUNT(*)::int AS event_count,
        COALESCE(SUM(revenue), 0)::float AS daily_revenue
      FROM events
      WHERE project_id = ${projectId}::uuid
        AND occurred_at > NOW() - (INTERVAL '1 day' * ${days})
      GROUP BY day
      ORDER BY day ASC
    `;

    return NextResponse.json(results);
  } catch (error) {
    console.error("Timeseries Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
