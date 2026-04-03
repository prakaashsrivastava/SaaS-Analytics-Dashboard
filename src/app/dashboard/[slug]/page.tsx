import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import { canDo } from "@/lib/permissions";
import { AccessControl } from "@/components/dashboard/access-control";
import {
  Users,
  Settings,
  PlusCircle,
  TrendingUp,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
    },
  });

  if (!organisation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">
                {organisation.name}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wider">
                {organisation.plan} Plan
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">
                {session.user.name}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase py-0.5 px-2 bg-slate-100 rounded-full">
                {session.user.role}
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 font-medium">Manage your team and view growth metrics.</p>
          </div>
          
          <div className="flex items-center gap-3">
            {canDo(session.user.role!, 'invite_member') && (
              <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            )}
            {canDo(session.user.role!, 'change_settings') && (
              <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-8">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-800 text-lg font-bold flex items-center">
                  <ShieldCheck className="mr-2 h-5 w-5 text-purple-600" />
                  Organization Info
                </CardTitle>
                <CardDescription>
                  Details about your current organization.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Organization Name
                  </p>
                  <p className="text-slate-900 font-bold text-lg">
                    {organisation.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Slug ID
                  </p>
                  <div className="flex items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <code className="text-sm text-slate-600">{organisation.slug}</code>
                  </div>
                </div>
              </CardContent>
              {canDo(session.user.role!, 'upgrade_plan') && organisation.plan === 'free' && (
                <CardFooter className="bg-slate-50 border-t border-slate-100 py-4 flex flex-col items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Upgrade to Pro</p>
                    <p className="text-xs text-slate-500 font-medium">Unlock 90-day history and unlimited projects.</p>
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold">
                    Upgrade Now
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-slate-800 text-lg font-bold flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Team Members
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    {organisation.members.length} people have access to this workspace.
                  </CardDescription>
                </div>
                {canDo(session.user.role!, 'invite_member') && (
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold">
                    View Invitations
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-slate-100">
                {organisation.members.map((member) => (
                  <li
                    key={member.id}
                    className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-extrabold uppercase shadow-sm">
                        {member.user.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        member.role === 'owner' ? 'bg-purple-100 text-purple-700' :
                        member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role}
                      </span>
                      
                      {canDo(session.user.role!, 'remove_member') && member.user.id !== session.user.id && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
