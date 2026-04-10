import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Settings, ShieldCheck, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <div className="py-10 px-6 space-y-10 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            href={`/dashboard/${slug}/projects/${id}`}
            className="p-3 hover:bg-primary-tint/50 rounded-xl transition-all text-text-secondary hover:text-primary group border border-transparent hover:border-primary/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/10">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-premium tracking-tight">
              Settings
            </h1>
            <p className="text-text-secondary font-medium mt-1">
              Configuration for {project.name}.
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
