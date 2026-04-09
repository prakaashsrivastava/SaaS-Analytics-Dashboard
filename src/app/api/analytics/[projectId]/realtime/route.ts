import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";
import { canDo } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const { orgId, role } = await getTenantContext();

    // 1. RBAC Check
    if (!canDo(role, "view_analytics")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // 2. Double-scoping check
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        orgId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // 3. Fetch latest 50 events
    const events = await prisma.event.findMany({
      where: { projectId },
      orderBy: { occurredAt: "desc" },
      take: 50,
    });

    // Convert BigInt to string for JSON serialization
    const serializedEvents = events.map((event) => ({
      ...event,
      id: event.id.toString(),
    }));

    return NextResponse.json(serializedEvents);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error("Realtime analytics error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
