import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
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
    <div className="py-8 px-6 space-y-10 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h2>
            <div className="flex items-center gap-3 mt-1.5 font-medium">
              <span className="text-slate-500">
                {project.domain || "No domain set"}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-200" />
              <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                ID: {project.id}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="h-11 px-6 font-bold border-slate-200 bg-white hover:bg-slate-50"
          >
            Project Settings
          </Button>
          <Button className="h-11 px-6 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md">
            View Realtime
          </Button>
        </div>
      </div>

      {hasEvents ? (
        <ProjectAnalytics
          projectId={project.id}
          orgPlan={project.organisation.plan}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white/80 backdrop-blur-md">
            <CardHeader className="pb-6 border-b border-slate-50">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <Code className="w-6 h-6 text-indigo-600" />
                Installation Instructions
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium text-lg leading-relaxed mt-2">
                Start tracking events by adding our snippet to your application.
                Once we receive your first event, your dashboard will
                automatically unlock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                  <span>Javascript Snippet</span>
                  <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </button>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 text-slate-300 font-mono text-sm shadow-2xl group relative overflow-hidden ring-1 ring-white/10">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity duration-500">
                    <Terminal className="w-48 h-48" />
                  </div>
                  <pre className="whitespace-pre-wrap break-all leading-loose">
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
                <h4 className="font-black text-slate-900 text-base">
                  Testing your Setup
                </h4>
                <p className="text-base text-slate-500 font-medium leading-relaxed">
                  Run this cURL command to send a test event and verify your
                  integration immediately:
                </p>
                <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 font-mono text-sm flex justify-between items-center group shadow-inner">
                  <code className="truncate mr-4">
                    {`curl -X POST ${baseUrl}/api/track -d '{"projectId": "${project.id}", "event": "test_event"}'`}
                  </code>
                  <Copy className="w-5 h-5 text-slate-300 cursor-pointer hover:text-slate-900 transition-colors shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 border-indigo-100 bg-indigo-50/30 backdrop-blur-sm self-start">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Why track data?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-base">
                  Real-time Insights
                </p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Understand how users interact with your app the second they
                  join.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-base">
                  Conversion Funnels
                </p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Identify where users drop off and optimize your onboarding
                  flow.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-black text-slate-900 text-base">
                  Retention Analysis
                </p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Track return rates and grow your long-term user base with
                  data.
                </p>
              </div>
              <Button className="w-full mt-6 font-black h-12 bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 rounded-xl">
                Read Documentation <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
