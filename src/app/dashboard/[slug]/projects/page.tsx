import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Monitor, ArrowUpRight, LayoutGrid, Calendar, Box } from "lucide-react";
import { canDo } from "@/lib/permissions";
import { ProjectLimitButton } from "@/components/projects/ProjectLimitButton";
import { ProjectWithDescription } from "@/types";
import { Card } from "@/components/ui/card";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Ensure the user belongs to the requested organization
  if (session.user.orgSlug !== slug) {
    notFound();
  }

  const organisation = await prisma.organisation.findUnique({
    where: { slug: slug },
    include: {
      projects: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!organisation) {
    notFound();
  }

  // Cast projects to unknown then to our specific interface to bypass stale Prisma types
  const projects = (organisation.projects ||
    []) as unknown as ProjectWithDescription[];

  return (
    <div className="w-full py-6 px-6 md:py-8 md:px-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-tint/20 rounded-2xl border border-primary/10 shrink-0 shadow-sm">
            <Box className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-premium tracking-tight">
              Projects
            </h2>
            <p className="text-text-secondary font-medium">
              Manage your tracked applications and websites.
            </p>
          </div>
        </div>
        <ProjectLimitButton
          orgSlug={slug}
          isLimited={organisation.plan === "free" && projects.length >= 1}
          canCreate={canDo(session.user.role!, "create_project")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${slug}/projects/${project.id}`}
              className="group"
            >
              <div className="relative bg-surface-raised rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col gap-4 overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-300" />

                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="text-md font-bold text-text-primary group-hover:text-primary transition-colors">
                      {project.name}
                    </h4>
                    {project.domain && (
                      <div className="flex items-center gap-1.5">
                        <Monitor className="w-3 h-3 text-text-muted" />
                        <span className="text-[10px] text-text-muted font-bold tracking-tight uppercase">
                          {project.domain}
                        </span>
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0" />
                </div>

                <p className="text-sm text-text-secondary font-medium line-clamp-2">
                  {project.description || "No description provided."}
                </p>

                <div className="mt-auto pt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success-tint/30 rounded-full border border-success/10">
                    <div className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    <span className="text-[9px] font-bold text-success-text uppercase">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-surface text-text-muted border border-border rounded-full">
                    <Calendar className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-bold uppercase">
                      {project.createdAt?.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <Card className="col-span-full py-24 border border-border bg-surface/50 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-6 rounded-2xl">
            <div className="w-20 h-20 bg-surface rounded-xl shadow-card border border-border flex items-center justify-center text-text-muted">
              <LayoutGrid className="w-10 h-10 opacity-30" />
            </div>
            <div className="max-w-xs space-y-2">
              <h3 className="text-2xl font-bold text-premium tracking-tight">
                Add New Project
              </h3>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                You haven&apos;t created any projects yet. Start by adding your
                first app or website.
              </p>
            </div>
            <div className="pt-2">
              <ProjectLimitButton
                orgSlug={slug}
                isLimited={organisation.plan === "free" && projects.length >= 1}
                canCreate={canDo(session.user.role!, "create_project")}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
