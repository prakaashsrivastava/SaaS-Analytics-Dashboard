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
    <div className="py-10 px-6 max-w-5xl mx-auto space-y-10 min-h-screen bg-slate-50/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/${slug}/projects/${id}`}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
            <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
              Real-time Analytics
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Live event stream for{" "}
              <span className="text-slate-900 font-bold">{project.name}</span>.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <section className="space-y-6">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Incoming Activity
            </div>
            <div className="flex items-center gap-2 text-indigo-500">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Live Updates
            </div>
          </div>

          <RealtimeStream projectId={id} />
        </section>
      </div>
    </div>
  );
}
