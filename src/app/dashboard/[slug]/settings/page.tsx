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

  // Double-check authorization (already done by proxy middleware, but let's be safe)
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
    <div className="py-10 px-6 max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Organization Settings
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage your brand assets and general workspace configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4" />
            General Information
          </div>
          <OrgSettingsForm organisation={organisation} />
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4" />
            Plan & Billing
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-900 uppercase">
                  {organisation.plan} Plan
                </span>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded border border-green-200">
                  Active
                </span>
              </div>
              <p className="text-slate-500 text-sm font-medium mt-2 max-w-md">
                Your workspace is currently on the {organisation.plan} tier.
                {organisation.plan === "free"
                  ? " Upgrade to Pro to unlock unlimited projects, team members, and 90-day data retention."
                  : " You have access to all premium features."}
              </p>
            </div>
            {organisation.plan === "free" && (
              <button className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5">
                Upgrade to Pro
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
