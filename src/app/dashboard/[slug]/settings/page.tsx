import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Settings, ShieldCheck, CreditCard } from "lucide-react";
import { OrgSettingsForm } from "@/components/dashboard/OrgSettingsForm";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Double-check authorization (already done by proxy handlers, but let's be safe)
  if (session.user.orgSlug !== slug || session.user.role !== "owner") {
    redirect(`/dashboard/${slug}`);
  }

  const organisation = await prisma.organisation.findUnique({
    where: { slug },
  });

  if (!organisation) {
    redirect("/dashboard");
  }

  return (
    <div className="py-10 px-6 space-y-10 font-sans">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-premium tracking-tight">
            Organization Settings
          </h1>
          <p className="text-text-secondary font-medium mt-1">
            Manage your brand assets and general workspace configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider pb-3 border-b border-border">
            <ShieldCheck className="w-4 h-4 text-primary" />
            General Information
          </div>
          <OrgSettingsForm organisation={organisation} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider pb-3 border-b border-border">
            <CreditCard className="w-4 h-4 text-primary" />
            Plan & Billing
          </div>
          <div className="premium-card rounded-2xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-card transition-all">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-premium uppercase tracking-tighter">
                  {organisation.plan} Plan
                </span>
                <span className="premium-badge bg-success-tint text-success-text border-success/10 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-text-secondary text-sm font-medium mt-2 max-w-md leading-relaxed">
                Your workspace is currently on the {organisation.plan} tier.
                {organisation.plan === "free"
                  ? " Upgrade to Pro to unlock unlimited projects, team members, and 90-day data retention."
                  : " You have access to all premium features."}
              </p>
            </div>
            {organisation.plan === "free" && (
              <button className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/10 hover:-translate-y-0.5 active:translate-y-0 text-sm">
                Upgrade to Pro
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
