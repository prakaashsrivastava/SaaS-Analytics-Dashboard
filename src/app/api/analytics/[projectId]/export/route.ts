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

    // Fetch raw event data for the last 30 days
    const events = await prisma.event.findMany({
      where: {
        projectId,
        occurredAt: {
          gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { occurredAt: "desc" },
    });

    // Generate CSV Header
    let csv = "ID,Event Type,Revenue,Timestamp,Properties\n";

    // Add rows
    events.forEach((event) => {
      // Escape and wrap fields properly
      const escapedType = `"${(event.eventType || "").replace(/"/g, '""')}"`;
      const properties = `"${JSON.stringify(event.properties || {}).replace(/"/g, '""')}"`;
      const id = `"${event.id}"`;
      const timestamp = `"${event.occurredAt.toISOString()}"`;

      const row = [
        id,
        escapedType,
        event.revenue || 0,
        timestamp,
        properties,
      ].join(",");
      csv += row + "\n";
    });

    // Return as a downloadable file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-export-${projectId}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Analytics Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
