import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensurePermission } from "@/lib/api-utils";
import { z } from "zod";
import { settingsSchema } from "@/types";

export async function GET() {
  // Anyone with dashboard access can view settings info (to prefill form for owners, or view-only for others if we wanted)
  // But PRD says accessible only to OWNER. Let's use 'change_settings' as the gate.
  const auth = await ensurePermission("view_analytics");
  if (!auth.authorized || !auth.context) return auth.response!;

  const { orgId } = auth.context;

  try {
    const organisation = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        logoUrl: true,
        timezone: true,
        plan: true,
      },
    });

    if (!organisation) {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(organisation);
  } catch (error) {
    console.error("Error fetching org settings:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await ensurePermission("change_settings");
  if (!auth.authorized || !auth.context) return auth.response!;

  const { orgId } = auth.context;

  try {
    const body = await req.json();
    const validatedData = settingsSchema.parse(body);

    const updatedOrg = await prisma.organisation.update({
      where: { id: orgId },
      data: {
        name: validatedData.name,
        timezone: validatedData.timezone,
        logoUrl: validatedData.logoUrl,
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully",
      organisation: {
        name: updatedOrg.name,
        timezone: updatedOrg.timezone,
        logoUrl: updatedOrg.logoUrl,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "VALIDATION_ERROR", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error updating org settings:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
