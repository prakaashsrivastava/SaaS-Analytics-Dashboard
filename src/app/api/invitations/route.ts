import { NextRequest, NextResponse } from "next/server";
import { ensurePermission } from "@/lib/api-utils";
import { getPlanLimits } from "@/lib/plan";
import { sendInvitationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { inviteSchema } from "@/types";
import { z } from "zod";

/**
 * POST /api/invitations
 * Creates a new member invitation.
 */
export async function POST(req: NextRequest) {
  try {
    const { authorized, context, response } =
      await ensurePermission("invite_member");

    if (!authorized) {
      return response;
    }

    const body = await req.json();
    const validatedData = inviteSchema.parse(body);
    const { email, role } = validatedData;

    const orgId = context!.orgId;

    // 1. Check if user is already a member
    const existingMember = await prisma.orgMember.findFirst({
      where: {
        orgId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "ALREADY_MEMBER", message: "User is already a member." },
        { status: 409 }
      );
    }

    // 2. Check if an active invitation exists
    const existingInvite = await prisma.invitation.findFirst({
      where: {
        orgId,
        email,
        accepted: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        {
          error: "INVITE_PENDING",
          message: "An active invitation already exists for this email.",
        },
        { status: 409 }
      );
    }

    // 3. Check plan limits
    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { plan: true, name: true },
    });

    if (!org) {
      return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });
    }

    const limits = getPlanLimits(org.plan);
    const memberCount = await prisma.orgMember.count({
      where: { orgId },
    });

    if (memberCount >= limits.maxMembers) {
      return NextResponse.json(
        {
          error: "LIMIT_REACHED",
          message:
            "You have reached the maximum number of members for your plan.",
        },
        { status: 403 }
      );
    }

    // 4. Generate token and insert invitation
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

    const invitation = await prisma.invitation.create({
      data: {
        orgId,
        email,
        role,
        token,
        expiresAt,
      },
    });

    // 5. Send email
    await sendInvitationEmail(email, org.name, role, token);

    return NextResponse.json({
      success: true,
      invitationId: invitation.id,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to create invitation:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
