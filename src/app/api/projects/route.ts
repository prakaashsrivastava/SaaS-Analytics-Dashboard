import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTenantContext } from "@/lib/tenant";
import { canDo } from "@/lib/permissions";
import { getPlanLimits } from "@/lib/plan";
import { ProjectWithDescription } from "@/types";

export async function GET() {
  try {
    const { orgId } = await getTenantContext();

    const projects = await prisma.project.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects as unknown as ProjectWithDescription[]);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orgId, role } = await getTenantContext();

    // 1. RBAC Check
    if (!canDo(role, "create_project")) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }

    // 2. Fetch Org for Plan Gating
    const organisation = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: { plan: true },
    });

    if (!organisation) {
      return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });
    }

    const limits = getPlanLimits(organisation.plan);

    // 3. Count existing projects
    const projectCount = await prisma.project.count({
      where: { orgId },
    });

    if (projectCount >= limits.maxProjects) {
      return NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: "You have reached the project limit for your plan.",
          limit: limits.maxProjects,
        },
        { status: 403 }
      );
    }

    // 4. Validate Request Body
    const body = await req.json();
    const { name, domain, description } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          message: "Project name is required (min 2 chars).",
        },
        { status: 400 }
      );
    }

    // 5. Create Project
    // Using a type-safe bypass for the create method since Prisma types in the IDE may be lagging
    interface ProjectCreator {
      create: (args: {
        data: {
          orgId: string;
          name: string;
          domain: string | null;
          description: string | null;
        };
      }) => Promise<ProjectWithDescription>;
    }

    const project = await (prisma.project as unknown as ProjectCreator).create({
      data: {
        orgId,
        name: name.trim(),
        domain: typeof domain === "string" ? domain.trim() : null,
        description:
          typeof description === "string" ? description.trim() : null,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    console.error("Project creation error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR" },
      { status: 500 }
    );
  }
}
