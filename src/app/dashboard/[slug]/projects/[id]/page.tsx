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
    },
  });

  if (!project) {
    notFound();
  }

  const hasEvents = project._count.events > 0;
  const baseUrl =
    process.env.NEXT_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  return (
    <div className="py-8 px-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-500 font-medium">
                {project.domain || "No domain set"}
              </p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                ID: {project.id}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="h-9 font-bold border-slate-200">
            Project Settings
          </Button>
          <Button className="h-9 font-bold bg-slate-900 text-white hover:bg-slate-800">
            View Realtime
          </Button>
        </div>
      </div>

      {!hasEvents ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-600" />
                Installation Instructions
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium leading-relaxed">
                Start tracking events by adding our snippet to your application.
                Once we receive your first event, your dashboard will
                automatically unlock.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Javascript Snippet</span>
                  <button className="flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                    <Copy className="w-3 h-3" />
                    Copy Code
                  </button>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 text-slate-300 font-mono text-sm shadow-inner group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                    <Terminal className="w-32 h-32" />
                  </div>
                  <pre className="whitespace-pre-wrap break-all leading-relaxed">
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
                <h4 className="font-bold text-slate-900 text-sm">
                  Testing your Setup
                </h4>
                <p className="text-sm text-slate-500 font-medium">
                  Run this cURL command to send a test event and verify your
                  integration immediately:
                </p>
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-mono text-xs flex justify-between items-center group">
                  <code className="truncate mr-2">
                    {`curl -X POST ${baseUrl}/api/track -d '{"projectId": "${project.id}", "event": "test_event"}'`}
                  </code>
                  <Copy className="w-4 h-4 text-slate-300 cursor-pointer hover:text-slate-900 transition-colors shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 border-indigo-100 bg-indigo-50/20">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Why track data?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  Real-time Insights
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Understand how users interact with your app the second they
                  join.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  Conversion Funnels
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Identify where users drop off and optimize your onboarding
                  flow.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">
                  Retention Analysis
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Track return rates and grow your long-term user base with
                  data.
                </p>
              </div>
              <Button className="w-full mt-4 font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md">
                Read Documentation <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
            <TrendingUp className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-3">
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              Analytics Module Ready
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              We&apos;ve received your data. Feature 7 - Analytics Dashboard
              will display your metrics here soon.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="px-8 font-bold border-slate-200"
            >
              Setup Guides
            </Button>
            <Button className="px-8 font-bold bg-indigo-600 text-white hover:bg-indigo-700">
              Explore Events
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
