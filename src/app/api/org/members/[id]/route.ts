import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

/**
 * DELETE /api/org/members/[id]
 * Removes a member from the organization.
 * id is the OrgMember id, not the user id.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { authorized, context, response } =
    await ensurePermission("remove_member");

  if (!authorized) {
    return response;
  }

  const orgId = context!.orgId;

  try {
    // 1. Check if the member exists in the user's organization
    const member = await prisma.orgMember.findUnique({
      where: { id },
    });

    if (!member || member.orgId !== orgId) {
      return NextResponse.json({ error: "MEMBER_NOT_FOUND" }, { status: 404 });
    }

    // 2. Protections
    // - Prevent removing the last owner
    if (member.role === "owner") {
      const ownerCount = await prisma.orgMember.count({
        where: { orgId, role: "owner" },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            error: "LAST_OWNER",
            message: "Cannot remove the only owner of the organization.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Delete the record
    await prisma.orgMember.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Member removed successfully.`,
    });
  } catch (error) {
    console.error("Failed to delete member:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
