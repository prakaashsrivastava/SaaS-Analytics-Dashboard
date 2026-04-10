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

    // Simplified Retention Logic for demo purposes
    // Based on user returning in Day 1, Day 7, Day 30 windows.
    // In a real app, this would be a full cohort matrix.

    const results = await prisma.$queryRaw`
      WITH user_activity AS (
        SELECT 
          properties->>'session_id' as user_id, 
          MIN(occurred_at) as first_active,
          MAX(occurred_at) as last_active
        FROM events
        WHERE project_id = ${projectId}::uuid
          AND occurred_at > NOW() - INTERVAL '60 days'
        GROUP BY 1
      )
      SELECT 
        COUNT(*)::int as total_users,
        COUNT(*) FILTER (WHERE last_active > first_active + INTERVAL '1 day')::int as day_1,
        COUNT(*) FILTER (WHERE last_active > first_active + INTERVAL '7 days')::int as day_7,
        COUNT(*) FILTER (WHERE last_active > first_active + INTERVAL '30 days')::int as day_30
      FROM user_activity
      WHERE first_active < NOW() - INTERVAL '30 days' -- Only consider users who joined at least 30 days ago
    `;

    interface RetentionResult {
      total_users: number;
      day_1: number;
      day_7: number;
      day_30: number;
    }

    const data = (results as RetentionResult[])[0];
    const total = data.total_users || 1;

    const retentionData = [
      {
        name: "Day 1",
        value: Math.round((data.day_1 / total) * 100),
        label: "Next Day Return",
      },
      {
        name: "Day 7",
        value: Math.round((data.day_7 / total) * 100),
        label: "Weekly Retention",
      },
      {
        name: "Day 30",
        value: Math.round((data.day_30 / total) * 100),
        label: "Monthly Retention",
      },
    ];

    return NextResponse.json(retentionData);
  } catch (error) {
    console.error("Retention Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
