import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.orgSlug) {
    redirect(`/dashboard/${session.user.orgSlug}`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800">
        No Organization Found
      </h1>
      <p className="text-slate-600">
        You are not a member of any organization.
      </p>
    </div>
  );
}
