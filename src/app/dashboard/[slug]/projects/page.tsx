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
    <div className="py-8 px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Projects
          </h2>
          <p className="text-slate-500 font-medium">
            Manage your tracked applications and websites.
          </p>
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
              <Card className="h-full hover:border-indigo-200 hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200 group-hover:bg-slate-50/50">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Box className="w-5 h-5" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <CardTitle className="mt-4 text-slate-900 text-lg font-bold group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="font-medium truncate">
                    {project.domain || "No domain set"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 line-clamp-3 min-h-[3rem]">
                    {project.description ||
                      "No description provided for this project."}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active
                    </div>
                    <div className="flex items-center gap-1.5">
                      {project.createdAt?.toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="col-span-full py-20 border-3 border-dashed border-slate-200 bg-slate-50/30 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <div className="max-w-xs space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                No projects found
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                You haven&apos;t created any projects yet. Start by adding your
                first app or website.
              </p>
            </div>
            <ProjectLimitButton
              orgSlug={slug}
              isLimited={organisation.plan === "free" && projects.length >= 1}
              canCreate={canDo(session.user.role!, "create_project")}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
