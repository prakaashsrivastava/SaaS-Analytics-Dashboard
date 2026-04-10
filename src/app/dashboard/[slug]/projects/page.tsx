import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Box, LayoutGrid, ExternalLink } from "lucide-react";
import { canDo } from "@/lib/permissions";
import { ProjectLimitButton } from "@/components/projects/ProjectLimitButton";
import { ProjectWithDescription } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <div className="py-8 px-6 space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-premium tracking-tight">
            Projects
          </h2>
          <p className="text-text-secondary font-medium">
            Manage your tracked applications and websites.
          </p>
        </div>
        <ProjectLimitButton
          orgSlug={slug}
          isLimited={organisation.plan === "free" && projects.length >= 1}
          canCreate={canDo(session.user.role!, "create_project")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/${slug}/projects/${project.id}`}
              className="group"
            >
              <Card className="h-full premium-card transition-all duration-500 cursor-pointer border-border group-hover:bg-primary-tint/10 rounded-2xl overflow-hidden active:scale-[0.98]">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-surface-raised rounded-xl flex items-center justify-center text-text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm border border-border/50">
                      <Box className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors duration-500" />
                  </div>
                  <CardTitle className="mt-6 text-text-primary text-xl font-bold group-hover:text-primary transition-colors tracking-tight">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="font-semibold truncate text-text-secondary">
                    {project.domain || "No domain set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-secondary font-medium line-clamp-3 min-h-[3rem] leading-relaxed">
                    {project.description ||
                      "No description provided for this project."}
                  </p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="premium-badge bg-success-tint text-success-text border-success/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Active
                    </div>
                    <div className="premium-badge bg-surface-raised text-text-muted border-border">
                      {project.createdAt?.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
