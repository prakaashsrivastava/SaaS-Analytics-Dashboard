import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import prisma from "@/lib/prisma";

export default async function DashboardSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double-check ownership/membership
  if (session.user.orgSlug !== slug) {
    notFound();
  }

  const organisation = await prisma.organisation.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      plan: true,
    },
  });

  if (!organisation) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-slate-50/50">
      <Sidebar
        orgSlug={slug}
        orgName={organisation.name}
        logoUrl={organisation.logoUrl}
        userRole={session.user.role as string}
        plan={organisation.plan as string}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
