import { NextResponse } from "next/server";
import * as bcryptjs from "bcryptjs";
import prisma, { Prisma } from "@/lib/prisma";
import { generateBaseSlug, generateRandomSuffix } from "@/lib/slug";
import { sendWelcomeEmail } from "@/lib/email";
import { z } from "zod";

import { registerSchema } from "@/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const { orgName, name, email, password } = validatedData;

    // Atomic transaction for Org + User creation
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Check if email already exists
        const existingUser = await tx.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new Error("USER_EXISTS");
        }

        // 2. Hash password
        const passwordHash = await bcryptjs.hash(password, 10);

        // 3. Generate unique slug with retries
        let slug = "";
        let isUnique = false;
        let attempts = 0;
        const baseSlug = generateBaseSlug(orgName);

        while (!isUnique && attempts < 5) {
          slug =
            attempts === 0
              ? baseSlug
              : `${baseSlug}-${generateRandomSuffix(4)}`;

          const existingOrg = await tx.organisation.findUnique({
            where: { slug },
          });

          if (!existingOrg) {
            isUnique = true;
          } else {
            attempts++;
          }
        }

        if (!isUnique) {
          throw new Error("SLUG_COLLISION");
        }

        // 4. Create Organisation
        const organisation = await tx.organisation.create({
          data: {
            name: orgName,
            slug,
            plan: "free",
            timezone: "Asia/Kolkata",
          },
        });

        // 5. Create User
        const user = await tx.user.create({
          data: {
            email,
            name,
            passwordHash,
          },
        });

        // 6. Create OrgMember (Owner)
        await tx.orgMember.create({
          data: {
            orgId: organisation.id,
            userId: user.id,
            role: "owner",
          },
        });

        // 7. Dispatch Welcome Email (Fire-and-forget)
        if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
          sendWelcomeEmail(email, name).catch((err) => {
            console.error("Failed to send welcome email:", err);
          });
        }

        return { user, organisation };
      }
    );

    return NextResponse.json(
      {
        message: "Registration successful",
        user: { id: result.user.id, email: result.user.email },
        organisation: result.organisation,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    const typedError = error as Error;

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    if (typedError.message === "USER_EXISTS") {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
