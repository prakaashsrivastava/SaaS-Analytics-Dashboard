import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Code,
  Box,
  Copy,
  Terminal,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectAnalytics } from "@/components/projects/ProjectAnalytics";

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double-scoping for safety: project must belong to the organization matching the slug
  const project = await prisma.project.findFirst({
    where: {
      id,
      organisation: {
        slug,
      },
    },
    include: {
      _count: {
        select: { events: true },
      },
      organisation: {
        select: { plan: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const hasEvents = project._count.events > 0;
  const baseUrl =
    process.env.NEXT_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div className="py-8 px-6 space-y-10 bg-primary-subtle min-h-screen font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Box className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-text-primary tracking-tight">
              {project.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 font-black">
              <span className="text-text-secondary">
                {project.domain || "No domain set"}
              </span>
              <div className="w-2 h-2 rounded-full bg-primary-light animate-pulse" />
              <span className="text-primary text-[10px] uppercase tracking-widest bg-primary-tint px-3 py-1 rounded-full border border-primary/10">
                ID: {project.id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href={`/dashboard/${slug}/projects/${id}/settings`}>
            <Button
              variant="outline"
              className="h-12 px-6 font-black border-border bg-surface hover:bg-surface-hover rounded-2xl text-text-secondary transition-all"
            >
              Project Settings
            </Button>
          </Link>
          <Link href={`/dashboard/${slug}/projects/${id}/realtime`}>
            <Button className="h-12 px-6 font-black bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/20 rounded-2xl group transition-all hover:-translate-y-1">
              View Realtime
              <TrendingUp className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {hasEvents ? (
        <ProjectAnalytics
          projectId={project.id}
          orgPlan={project.organisation.plan}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-card border-border bg-surface/80 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardHeader className="pb-8 border-b border-border/50 bg-surface-raised/30 px-6 py-10">
              <CardTitle icon={<Code className="w-7 h-7" />}>
                Installation Instructions
              </CardTitle>
              <CardDescription className="text-text-secondary font-medium text-lg leading-relaxed mt-2 max-w-2xl">
                Start tracking events by adding our snippet to your application.
                Once we receive your first event, your dashboard will
                automatically unlock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 px-6 py-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-primary" />
                    Javascript Snippet
                  </span>
                  <button className="flex items-center gap-2 hover:text-primary transition-colors hover:bg-primary-tint px-3 py-1 rounded-full">
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>
                </div>
                <div className="p-8 rounded-3xl bg-sidebar-bg text-sidebar-text font-mono text-sm shadow-2xl group relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-700">
                    <Terminal className="w-56 h-56" />
                  </div>
                  <pre className="whitespace-pre-wrap break-all leading-loose text-primary-light">
                    {`<!-- SaaS Analytics Snippet -->
<script 
  src="${baseUrl}/track.js" 
  data-project-id="${project.id}" 
  async
></script>`}
                  </pre>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-text-primary text-xl tracking-tight">
                  Testing your Setup
                </h4>
                <p className="text-base text-text-secondary font-medium leading-relaxed max-w-xl">
                  Run this cURL command to send a test event and verify your
                  integration immediately:
                </p>
                <div className="p-6 rounded-2xl bg-surface-raised border border-border text-text-primary font-mono text-sm flex justify-between items-center group shadow-inner">
                  <code className="truncate mr-4 text-primary">
                    {`curl -X POST ${baseUrl}/api/track -d '{"projectId": "${project.id}", "event": "test_event"}'`}
                  </code>
                  <Copy className="w-6 h-6 text-text-muted cursor-pointer hover:text-primary transition-colors shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-border bg-primary-tint/10 backdrop-blur-sm self-start rounded-3xl overflow-hidden border-2 border-primary/10">
            <CardHeader className="pb-6 pt-10 px-6 bg-primary/5">
              <CardTitle icon={<TrendingUp className="w-7 h-7" />}>
                Growth Opportunity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-10 px-6 py-10">
              <div className="space-y-3">
                <p className="font-black text-text-primary text-lg tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Real-time Insights
                </p>
                <p className="text-sm text-text-secondary font-medium leading-relaxed opacity-80">
                  Understand how users interact with your app the second they
                  join.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-black text-text-primary text-lg tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Conversion Funnels
                </p>
                <p className="text-sm text-text-secondary font-medium leading-relaxed opacity-80">
                  Identify where users drop off and optimize your onboarding
                  flow.
                </p>
              </div>
              <div className="space-y-3">
                <p className="font-black text-text-primary text-lg tracking-tight flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Retention Analysis
                </p>
                <p className="text-sm text-text-secondary font-medium leading-relaxed opacity-80">
                  Track return rates and grow your long-term user base with
                  data.
                </p>
              </div>
              <Button className="w-full mt-10 font-black h-16 bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/20 rounded-2xl group transition-all hover:scale-[1.02]">
                Read Documentation <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
