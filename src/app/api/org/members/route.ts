import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/tenant";
import prisma from "@/lib/prisma";
import { Member } from "@/types";

/**
 * GET /api/org/members
 * Lists all members of the current organization.
 */
export async function GET() {
  try {
    const { orgId } = await getTenantContext();

    const members = await prisma.orgMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });

    // 2. Fetch pending invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        orgId,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 3. Format the response
    const formattedMembers = members.map((membership) => ({
      id: membership.id,
      userId: membership.user.id,
      email: membership.user.email,
      name: membership.user.name,
      role: membership.role,
      joinedAt: membership.user.createdAt.toISOString(),
      status: "active",
    }));

    const formattedInvites = invitations.map((invite) => ({
      id: invite.id,
      userId: null,
      email: invite.email,
      name: null,
      role: invite.role,
      joinedAt: invite.createdAt.toISOString(),
      status: "pending",
    }));

    return NextResponse.json([
      ...formattedMembers,
      ...formattedInvites,
    ] as Member[]);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error("Failed to fetch members:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
