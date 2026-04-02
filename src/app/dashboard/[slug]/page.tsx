import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function OrgDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Ensure the user belongs to the requested organization
  if (session.user.orgSlug !== params.slug) {
    notFound();
  }

  const organisation = await prisma.organisation.findUnique({
    where: { slug: params.slug },
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
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-slate-900">
              {organisation.name}
            </h1>
            <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
              {organisation.plan}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600 font-medium">
              {session.user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 text-lg">
                Organization Info
              </CardTitle>
              <CardDescription>
                Details about your current organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Name
                </p>
                <p className="text-slate-900 font-medium">
                  {organisation.name}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Slug
                </p>
                <p className="text-slate-600">{organisation.slug}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Created At
                </p>
                <p className="text-slate-600">
                  {new Date(organisation.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-slate-800 text-lg">
                Team Members
              </CardTitle>
              <CardDescription>
                Everyone who has access to this dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-slate-100">
                {organisation.members.map((member) => (
                  <li
                    key={member.id}
                    className="py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold uppercase">
                        {member.user.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold uppercase tracking-tighter">
                      {member.role}
                    </span>
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
