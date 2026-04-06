import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { canDo } from "@/lib/permissions";
import { DashboardActions } from "@/components/dashboard/DashboardActions";
import { DashboardUpgradeAction } from "@/components/plan/DashboardUpgradeAction";
import { HistoryBanner } from "@/components/dashboard/HistoryBanner";
import { ProjectLimitButton } from "@/components/projects/ProjectLimitButton";
import Link from "next/link";
import { ProjectWithDescription } from "@/types";
import {
  Users,
  Trash2,
  ShieldCheck,
  LayoutGrid,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OrgDashboardPage({
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
      members: {
        include: {
          user: true,
        },
      },
      projects: true,
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
            Dashboard
          </h2>
          <p className="text-slate-500 font-medium">
            Manage your team and view growth metrics across your projects.
          </p>
        </div>

        <DashboardActions
          slug={slug}
          canInvite={canDo(session.user.role!, "invite_member")}
          canSettings={canDo(session.user.role!, "change_settings")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-slate-800 text-lg font-bold flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-purple-600" />
                Organization
              </CardTitle>
              <CardDescription>Details about your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Name
                </p>
                <p className="text-slate-900 font-bold text-lg">
                  {organisation.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Slug
                </p>
                <div className="flex items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <code className="text-sm text-slate-600">
                    {organisation.slug}
                  </code>
                </div>
              </div>
            </CardContent>
            {canDo(session.user.role!, "upgrade_plan") &&
              organisation.plan === "free" && (
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex flex-col items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">
                      Upgrade to Pro
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      Unlock 90-day history and unlimited projects.
                    </p>
                  </div>
                  <DashboardUpgradeAction />
                </CardFooter>
              )}
          </Card>
        </div>

        <Card className="col-span-1 md:col-span-3 shadow-xl border-slate-200 overflow-hidden bg-white/50 backdrop-blur-sm border-dashed">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-slate-800 text-lg font-bold flex items-center">
                  <LayoutGrid className="mr-2 h-5 w-5 text-indigo-600" />
                  Your Projects
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                  {projects.length} active project(s). You are currently using{" "}
                  {projects.length} of{" "}
                  {organisation.plan === "pro" ? "unlimited" : "1"} project
                  slots.
                </CardDescription>
              </div>
              <ProjectLimitButton
                orgSlug={slug}
                isLimited={organisation.plan === "free" && projects.length >= 1}
                canCreate={canDo(session.user.role!, "create_project")}
              />
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/${slug}/projects/${project.id}`}
                  >
                    <Card className="hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer h-full">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-slate-900 text-base font-bold truncate group-hover:text-indigo-600">
                          {project.name}
                        </CardTitle>
                        {project.domain && (
                          <p className="text-xs text-slate-400 font-medium">
                            {project.domain}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {project.description || "No description provided."}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="p-4 rounded-2xl border-2 border-slate-100 border-dashed flex flex-col items-center justify-center gap-2 text-slate-400 group hover:border-slate-300 transition-all cursor-not-allowed col-span-full">
                  <PlusCircle className="w-8 h-8 opacity-20 group-hover:opacity-40" />
                  <p className="text-base font-bold text-slate-300">
                    No Projects Found
                  </p>
                  <p className="text-xs text-slate-300 font-medium">
                    Create your first project to start tracking analytics.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 overflow-hidden">
          {/* Existing Team Members Card */}
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-slate-800 text-lg font-bold flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Team Members
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">
                  {organisation.members.length} people have access to this
                  workspace.
                </CardDescription>
              </div>
              {canDo(session.user.role!, "invite_member") && (
                <Link href={`/dashboard/${slug}/members`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
                  >
                    View Invitations
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-slate-100">
              {organisation.members.map((member) => (
                <li
                  key={member.id}
                  className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-extrabold uppercase shadow-sm">
                      {member.user.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        member.role === "owner"
                          ? "bg-purple-100 text-purple-700"
                          : member.role === "admin"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {member.role}
                    </span>

                    {canDo(session.user.role!, "remove_member") &&
                      member.user.id !== session.user.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Feature 5 Gating Demonstrations */}
      <div className="pt-4">
        <HistoryBanner />
      </div>
    </div>
  );
}
