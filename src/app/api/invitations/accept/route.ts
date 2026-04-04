import { NextRequest, NextResponse } from "next/server";
import * as bcryptjs from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

const acceptSchema = z.object({
  token: z.string(),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/invitations/accept
 * Accepts an invitation, creates/links a user, and adds them to the organisation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = acceptSchema.parse(body);
    const { token, name, password } = validatedData;

    // 1. Validate invitation token again
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organisation: {
          select: {
            slug: true,
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

    // 2. Transactional account creation / linking
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      let user = await tx.user.findUnique({
        where: { email: invitation.email },
      });

      if (!user) {
        // Create new user if they don't exist
        const passwordHash = await bcryptjs.hash(password, 10);
        user = await tx.user.create({
          data: {
            email: invitation.email,
            name,
            passwordHash,
          },
        });
      } else {
        // User exists, but we might want to update their name if it was empty
        if (!user.name) {
          await tx.user.update({
            where: { id: user.id },
            data: { name },
          });
        }
      }

      // Check if user is already a member (safety check)
      const existingMembership = await tx.orgMember.findUnique({
        where: {
          orgId_userId: {
            orgId: invitation.orgId,
            userId: user.id,
          },
        },
      });

      if (!existingMembership) {
        // Create membership
        await tx.orgMember.create({
          data: {
            orgId: invitation.orgId,
            userId: user.id,
            role: invitation.role,
          },
        });
      }

      // Mark invitation as accepted
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { accepted: true },
      });

      return {
        email: user.email,
        orgSlug: invitation.organisation.slug,
      };
    });

    return NextResponse.json({
      success: true,
      email: result.email,
      orgSlug: result.orgSlug,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Failed to accept invitation:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
