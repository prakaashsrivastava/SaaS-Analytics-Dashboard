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
          <h2 className="text-3xl font-black text-text-primary tracking-tight">
            Dashboard
          </h2>
          <p className="text-text-secondary font-medium">
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
          <Card className="shadow-card border-border rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle icon={<ShieldCheck className="h-5 w-5" />}>
                Organization
              </CardTitle>
              <CardDescription className="font-medium text-text-secondary">Details about your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                  Name
                </p>
                <p className="text-text-primary font-black text-lg">
                  {organisation.name}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                  Slug
                </p>
                <div className="flex items-center p-2 bg-surface-raised rounded-xl border border-border">
                  <code className="text-sm text-text-secondary font-mono">
                    {organisation.slug}
                  </code>
                </div>
              </div>
            </CardContent>
            {canDo(session.user.role!, "upgrade_plan") &&
              organisation.plan === "free" && (
                <CardFooter className="bg-surface-raised border-t border-border py-4 flex flex-col items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-text-primary">
                      Upgrade to Pro
                    </p>
                    <p className="text-xs text-text-secondary font-medium">
                      Unlock 90-day history and unlimited projects.
                    </p>
                  </div>
                  <DashboardUpgradeAction />
                </CardFooter>
              )}
          </Card>
        </div>

        <Card className="col-span-1 md:col-span-3 shadow-card border-border overflow-hidden bg-surface/50 backdrop-blur-sm border-dashed rounded-3xl">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle icon={<LayoutGrid className="h-5 w-5" />}>
                  Your Projects
                </CardTitle>
                <CardDescription className="text-text-secondary font-medium">
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
                    <Card className="hover:border-primary-light hover:shadow-card transition-all group cursor-pointer h-full rounded-2xl border-border">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-text-primary text-lg font-black truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        {project.domain && (
                          <p className="text-xs text-text-muted font-bold tracking-tight">
                            {project.domain}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-text-secondary font-medium line-clamp-2">
                          {project.description || "No description provided."}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="p-8 rounded-3xl border-2 border-border border-dashed flex flex-col items-center justify-center gap-2 text-text-muted group hover:border-primary/30 transition-all cursor-not-allowed col-span-full">
                  <PlusCircle className="w-12 h-12 opacity-20 group-hover:opacity-40 mb-2" />
                  <p className="text-lg font-black text-text-muted/50 uppercase tracking-widest">
                    No Projects Found
                  </p>
                  <p className="text-xs text-text-muted/50 font-bold">
                    Create your first project to start tracking analytics.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2 shadow-card border-border overflow-hidden rounded-3xl">
          {/* Existing Team Members Card */}
          <CardHeader className="border-b border-border bg-surface-raised/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle icon={<Users className="h-5 w-5" />}>
                  Team Members
                </CardTitle>
                <CardDescription className="text-text-secondary font-medium">
                  {organisation.members.length} people have access to this
                  workspace.
                </CardDescription>
              </div>
              {canDo(session.user.role!, "invite_member") && (
                <Link href={`/dashboard/${slug}/members`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary-dark hover:bg-primary-tint font-black rounded-lg"
                  >
                    Manage
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {organisation.members.map((member) => (
                <li
                  key={member.id}
                  className="p-6 flex items-center justify-between hover:bg-surface-hover/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-2xl bg-sidebar-bg flex items-center justify-center text-white text-base font-black uppercase shadow-lg shadow-sidebar-bg/20">
                      {member.user.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-text-primary">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-text-secondary font-medium">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${member.role === "owner"
                          ? "bg-primary-tint text-primary border border-primary/10"
                          : member.role === "admin"
                            ? "bg-primary-tint/50 text-primary border border-primary/10"
                            : "bg-surface-raised text-text-secondary border border-border"
                        }`}
                    >
                      {member.role}
                    </span>

                    {canDo(session.user.role!, "remove_member") &&
                      member.user.id !== session.user.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-text-muted hover:text-danger-text hover:bg-danger-tint rounded-xl transition-all"
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
