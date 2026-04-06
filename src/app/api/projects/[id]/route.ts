import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";
import { canDo } from "@/lib/permissions";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { orgId, role } = await getTenantContext();

    // 1. RBAC Check (Owner only for deletion)
    if (!canDo(role, "delete_project")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // 2. Fetch project and verify ownership (Double-scoping)
    const project = await prisma.project.findFirst({
      where: {
        id,
        orgId, // Ensure it belongs to the current organization
      },
    });

    if (!project) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    // 3. Delete Project (Cascades to events because of prisma schema onDelete: Cascade)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error("Project deletion error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
