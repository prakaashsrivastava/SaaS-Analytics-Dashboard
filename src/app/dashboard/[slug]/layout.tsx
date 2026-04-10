import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
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

  const sidebarProps = {
    orgSlug: slug,
    orgName: organisation.name,
    logoUrl: organisation.logoUrl,
    userRole: session.user.role as string,
    plan: organisation.plan as string,
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-primary-subtle selection:bg-primary/10">
      {/* Mobile Header */}
      <MobileHeader {...sidebarProps} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 h-full shrink-0">
        <Sidebar {...sidebarProps} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-tint">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
