import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Settings, ShieldCheck, Trash2 } from "lucide-react";
import { ProjectSettingsForm } from "@/components/projects/ProjectSettingsForm";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch project with double-scoping
  const project = await prisma.project.findFirst({
    where: {
      id,
      organisation: {
        slug,
      },
    },
  });

  if (!project) {
    notFound();
  }

  // RBAC Check: Only owner and admin can edit project settings
  const role = session.user.role as string;
  const isOwnerOrAdmin = role === "owner" || role === "admin";
  const isOwner = role === "owner";

  if (!isOwnerOrAdmin) {
    redirect(`/dashboard/${slug}/projects/${id}`);
  }

  return (
    <div className="w-full py-6 px-6 md:py-8 md:px-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-tint/20 rounded-2xl border border-primary/10 shrink-0 shadow-sm">
            <Settings className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-premium tracking-tight">
              Project Settings
            </h2>
            <p className="text-text-secondary font-medium">
              Configuration for{" "}
              <span className="text-text-primary font-bold">
                {project.name}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-14">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider pb-3 border-b border-border">
            <ShieldCheck className="w-4 h-4 text-primary" />
            General Information
          </div>
          {/* Passing isOwner for deletion permission */}
          <ProjectSettingsForm
            project={project}
            orgSlug={slug}
            isOwner={isOwner}
          />
        </section>

        {isOwner && (
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-danger-text uppercase tracking-wider pb-3 border-b border-danger/20">
              <Trash2 className="w-4 h-4 text-danger transition-all group-hover:scale-110" />
              Danger Zone
            </div>
            <div className="bg-danger-tint/50 border border-danger-tint rounded-3xl p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shadow-card transition-all group">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-danger-text tracking-tight">
                  Delete Project
                </h4>
                <p className="text-danger-text/80 text-sm font-medium mt-1 max-w-md leading-relaxed">
                  Permanently remove this project and all its associated
                  tracking data. This action is irreversible and cannot be
                  undone.
                </p>
              </div>
              <button
                id="delete-project-btn"
                className="px-10 py-4 bg-danger text-white font-bold rounded-xl hover:bg-danger/90 transition-all shadow-lg shadow-danger/10 hover:-translate-y-0.5 active:translate-y-0 group-hover:shadow-xl"
              >
                Delete {project.name}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
