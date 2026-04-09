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
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-raised font-sans p-6 text-center">
      <h1 className="text-3xl font-black text-text-primary tracking-tight mb-2">
        No Organization Found
      </h1>
      <p className="text-text-secondary font-medium max-w-sm">
        You are not a member of any organization. Please contact your administrator or create a new account.
      </p>
    </div>
  );
}
