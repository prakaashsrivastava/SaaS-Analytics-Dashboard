import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

/**
 * GET /api/projects/[id]/stats
 * Returns the total number of events for a project.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { authorized, context, response } =
      await ensurePermission("view_analytics");

    if (!authorized || !context) return response;

    // Check project ownership
    const project = await prisma.project.findFirst({
      where: { id, orgId: context.orgId },
    });

    if (!project) {
      return NextResponse.json({ error: "PROJECT_NOT_FOUND" }, { status: 404 });
    }

    const eventCount = await prisma.event.count({
      where: { projectId: id },
    });

    return NextResponse.json({ eventCount });
  } catch (error) {
    console.error("Failed to fetch project stats:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
