import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
import prisma from "@/lib/prisma";

/**
 * GET /api/invitations/[id]
 * Validates an invitation token (the 'id' in path) and returns details.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: token } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organisation: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "INVITATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (invitation.accepted) {
      return NextResponse.json({ error: "ALREADY_ACCEPTED" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "EXPIRED" }, { status: 400 });
    }

    // Check if user already exists
    const user = await prisma.user.findUnique({
      where: { email: invitation.email },
      select: { id: true, name: true },
    });

    return NextResponse.json({
      orgName: invitation.organisation.name,
      email: invitation.email,
      role: invitation.role,
      userExists: !!user,
      userName: user?.name || null,
    });
  } catch (error) {
    console.error("Failed to validate invitation:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invitations/[id]
 * Revokes a pending invitation by ID.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { authorized, context, response } =
    await ensurePermission("invite_member");

  if (!authorized) {
    return response;
  }

  const orgId = context!.orgId;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation || invitation.orgId !== orgId) {
      return NextResponse.json(
        { error: "INVITATION_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (invitation.accepted) {
      return NextResponse.json(
        {
          error: "ALREADY_ACCEPTED",
          message:
            "Cannot revoke an invitation that has already been accepted.",
        },
        { status: 400 }
      );
    }

    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation revoked successfully.",
    });
  } catch (error) {
    console.error("Failed to revoke invitation:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
