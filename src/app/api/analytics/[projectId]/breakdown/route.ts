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

    const results = await prisma.event.groupBy({
      by: ["eventType"],
      where: {
        projectId,
        occurredAt: {
          gt: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          eventType: "desc",
        },
      },
    });

    // Format for frontend
    const formatted = results.map((r) => ({
      eventType: r.eventType,
      count: r._count._all,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Breakdown Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
