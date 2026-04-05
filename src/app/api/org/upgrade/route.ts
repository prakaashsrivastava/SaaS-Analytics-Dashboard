import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { canDo } from "@/lib/permissions";

/**
 * POST /api/org/upgrade
 * Sets the current organization's plan to 'pro'.
 * This is a mock implementation for demonstration purposes.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { orgId, role } = session.user;

    if (!orgId || !role) {
      return NextResponse.json({ error: "MISSING_CONTEXT" }, { status: 400 });
    }

    // RBAC: Only OWNER can upgrade the plan
    if (!canDo(role, "upgrade_plan")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // Perform the mock upgrade
    const updatedOrg = await prisma.organisation.update({
      where: { id: orgId },
      data: { plan: "pro" },
    });

    return NextResponse.json({
      success: true,
      plan: updatedOrg.plan,
      message: "Organization successfully upgraded to PRO plan.",
    });
  } catch (error: unknown) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
