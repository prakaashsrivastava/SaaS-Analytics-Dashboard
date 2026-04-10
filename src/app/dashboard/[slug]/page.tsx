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
import Image from "next/image";
import { ProjectWithDescription } from "@/types";
import { cn } from "@/lib/utils";
import {
  Users,
  Trash2,
  ShieldCheck,
  Box,
  PlusCircle,
  ArrowUpRight,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
          <h2 className="text-2xl font-bold text-premium tracking-tight">
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
        <Card className="col-span-1 md:col-span-3 premium-card rounded-xl overflow-hidden border border-border border-t-2 border-t-primary shadow-card hover:shadow-card-hover transition-all bg-gradient-to-br from-surface to-primary-subtle relative">
          {/* Status Overlay (Top Right) */}
          <div className="md:absolute md:top-6 md:right-8 flex items-center gap-3 mb-6 md:mb-0 px-6 pt-6 md:p-0">
            <div
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-sm",
                organisation.plan === "pro"
                  ? "bg-primary-tint/50 text-primary-dark border-primary/20"
                  : "bg-surface text-text-secondary border-border"
              )}
            >
              {organisation.plan} Plan
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-success-tint/30 rounded-full border border-success/10">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold text-success-text uppercase">
                Active
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Left Section: Workspace Identity */}
            <div className="flex items-center gap-6 w-full md:w-auto">
              {organisation.logoUrl ? (
                <div className="w-16 h-16 bg-surface rounded-xl flex items-center justify-center overflow-hidden border border-border shrink-0 shadow-md p-1.5 group hover:border-primary/30 transition-colors">
                  <Image
                    src={organisation.logoUrl}
                    alt={organisation.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-primary-subtle rounded-xl flex items-center justify-center text-primary text-2xl font-black shrink-0 border border-primary/10 shadow-md">
                  {organisation.name[0]}
                </div>
              )}
              <div className="overflow-hidden">
                <h3 className="text-2xl font-bold text-text-primary tracking-tight truncate antialiased">
                  {organisation.name}
                </h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="px-1.5 py-0.5 bg-surface-raised rounded text-[9px] font-black text-text-muted border border-border/40 tracking-widest uppercase">
                    Workspace
                  </span>
                  <span className="text-[11px] font-mono text-text-secondary/60 tracking-wider">
                    {organisation.slug}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Editorial Stats */}
            <div className="grid grid-cols-2 gap-8 md:gap-16 w-full md:w-auto md:border-l border-border/30 md:pl-16">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">
                  Projects
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] font-bold text-text-primary leading-none tracking-tighter tabular-nums">
                    {projects.length}
                  </span>
                  <span className="text-[9px] font-bold text-text-muted/60 uppercase">
                    Live
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.1em]">
                  Team
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[32px] font-bold text-text-primary leading-none tracking-tighter tabular-nums">
                    {organisation.members.length}
                  </span>
                  <span className="text-[9px] font-bold text-text-muted/60 uppercase">
                    Core
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action: Upgrades */}
            {canDo(session.user.role!, "upgrade_plan") &&
              organisation.plan === "free" && (
                <div className="md:ml-auto w-full md:w-auto">
                  <div className="flex items-center justify-between md:flex-row md:items-center gap-4 bg-surface-raised/50 px-4 py-3 rounded-xl border border-border shadow-sm group">
                    <div>
                      <p className="text-[11px] font-bold text-text-primary flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        Upgrade Ready
                      </p>
                    </div>
                    <DashboardUpgradeAction />
                  </div>
                </div>
              )}
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-3 premium-card overflow-hidden rounded-xl border-border bg-surface">
          <div className="border-b border-border bg-surface-raised/30 px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary-tint/20 rounded-xl border border-primary/10">
                <Box className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">
                  Your Projects
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-secondary font-medium">
                    {projects.length} active project(s)
                  </span>
                  {organisation.plan === "free" && (
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">/</span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-tint/30 rounded-full border border-primary/10">
                        <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${Math.min(
                                (projects.length / 1) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-[9px] font-black text-primary uppercase tracking-tighter">
                          {projects.length}/1 Slots Used
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <ProjectLimitButton
              orgSlug={slug}
              isLimited={organisation.plan === "free" && projects.length >= 1}
              canCreate={canDo(session.user.role!, "create_project")}
            />
          </div>

          <CardContent className="p-6 bg-surface">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/${slug}/projects/${project.id}`}
                    className="group"
                  >
                    <div className="relative bg-surface-raised rounded-2xl border border-border p-5 hover:border-primary/40 hover:shadow-card-hover transition-all duration-300 h-full flex flex-col gap-3 overflow-hidden">
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
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 rounded-2xl border-2 border-border border-dashed flex flex-col items-center justify-center gap-3 text-text-muted group hover:border-primary/30 hover:bg-primary-subtle/30 transition-all cursor-not-allowed col-span-full">
                  <div className="p-4 bg-surface rounded-2xl shadow-sm border border-border group-hover:border-primary/20 transition-all">
                    <PlusCircle className="w-8 h-8 opacity-20 group-hover:opacity-40 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-md font-bold text-text-primary/70 uppercase tracking-widest italic">
                      No Projects Listed
                    </p>
                    <p className="text-[11px] text-text-muted/60 font-bold mt-1">
                      Start your journey by docking your first project.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-3 premium-card overflow-hidden rounded-xl bg-surface">
          <div className="border-b border-border bg-surface-raised/30 px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-success-tint/20 rounded-xl border border-success/10">
                <Users className="w-5 h-5 text-success" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">
                  Team Members
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">
                  {organisation.members.length} people have access to this
                  workspace.
                </p>
              </div>
            </div>
            {canDo(session.user.role!, "invite_member") && (
              <Link href={`/dashboard/${slug}/members`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary-dark hover:bg-primary-tint font-bold rounded-xl px-6 transition-all"
                >
                  Manage Team
                </Button>
              </Link>
            )}
          </div>
          <CardContent className="p-0">
            <ul className="divide-y divide-border/50">
              {organisation.members.map((member) => (
                <li
                  key={member.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-surface-raised transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary-tint rounded-xl flex items-center justify-center text-primary text-sm font-black border border-primary/10 shadow-sm">
                      {member.user.name?.[0]}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                        {member.user.name}
                      </p>
                      <p className="text-[11px] text-text-muted font-medium">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex justify-end min-w-[100px]">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border leading-none",
                          member.role === "owner"
                            ? "bg-[#EDE9FE] text-[#5B21B6] border-[#5B21B6]/10"
                            : member.role === "admin"
                              ? "bg-[#E0E7FF] text-[#3730A3] border-[#3730A3]/10"
                              : "bg-[#F1F5F9] text-[#475569] border-[#475569]/10"
                        )}
                      >
                        {member.role}
                      </span>
                    </div>

                    <div className="w-8">
                      {canDo(session.user.role!, "remove_member") &&
                        member.user.id !== session.user.id && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-text-muted hover:text-danger hover:bg-danger-tint rounded-lg transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                    </div>
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
