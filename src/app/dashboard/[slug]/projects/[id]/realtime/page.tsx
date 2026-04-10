import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Activity } from "lucide-react";
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
    <div className="w-full py-6 px-6 md:py-8 md:px-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-tint/20 rounded-2xl border border-primary/10 shrink-0 shadow-sm">
            <Activity className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-premium tracking-tight flex items-center gap-4">
              Real-time Analytics
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-lg shadow-success/50"></span>
              </span>
            </h2>
            <p className="text-text-secondary font-medium">
              Live event stream for{" "}
              <span className="text-text-primary font-bold">
                {project.name}
              </span>
              .
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
