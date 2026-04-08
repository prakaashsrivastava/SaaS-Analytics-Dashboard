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
    <div className="py-10 px-6 max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/${slug}/projects/${id}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Project Settings
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Configuration for {project.name}.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4" />
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
            <div className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-widest pb-2 border-b border-red-50">
              <Trash2 className="w-4 h-4" />
              Danger Zone
            </div>
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div>
                <h4 className="text-lg font-bold text-red-900">
                  Delete Project
                </h4>
                <p className="text-red-600 text-sm font-medium mt-1 max-w-md leading-relaxed">
                  Permanently remove this project and all its associated
                  tracking data. This action is irreversible and cannot be
                  undone.
                </p>
              </div>
              <button
                id="delete-project-btn"
                className="px-8 py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 hover:-translate-y-0.5"
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
