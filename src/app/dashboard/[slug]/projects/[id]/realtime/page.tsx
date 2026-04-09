import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Activity, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { RealtimeStream } from "@/components/projects/RealtimeStream";

export default async function RealtimePage({
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

  return (
    <div className="py-10 px-6 space-y-10 min-h-screen bg-primary-subtle font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link
            href={`/dashboard/${slug}/projects/${id}`}
            className="p-3 hover:bg-primary-tint rounded-2xl transition-all text-text-secondary hover:text-primary group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="w-14 h-14 bg-sidebar-bg rounded-2xl flex items-center justify-center text-white shadow-xl shadow-sidebar-bg/20">
            <Zap className="w-7 h-7 text-primary fill-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary flex items-center gap-4 tracking-tight">
              Real-time Analytics
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-success shadow-lg shadow-success/50"></span>
              </span>
            </h1>
            <p className="text-text-secondary font-medium mt-1">
              Live event stream for{" "}
              <span className="text-text-primary font-black">{project.name}</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs font-black text-text-muted uppercase tracking-widest pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Incoming Activity
            </div>
            <div className="flex items-center gap-2 text-primary bg-primary-tint px-3 py-1 rounded-full border border-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live Updates
            </div>
          </div>

          <RealtimeStream projectId={id} />
        </section>
      </div>
    </div>
  );
}
