"use client";

import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, PlusCircle, TrendingUp, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InviteMemberModal } from "@/components/invite/InviteMemberModal";
import { MemberTable } from "@/components/dashboard/MemberTable";
import Link from "next/link";

interface Member {
  id: string;
  userId: string | null;
  email: string;
  name: string | null;
  role: string;
  joinedAt: string;
  status: "active" | "pending";
}

export default function MembersPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(paramsPromise);
  const slug = params.slug;
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      const response = await fetch("/api/org/members");
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchMembers();
    }
  }, [status, router]);

  useEffect(() => {
    const openInvite = searchParams.get("openInvite");
    if (openInvite === "true") {
      setIsInviteModalOpen(true);
    }
  }, [searchParams]);

  const handleDeleteItem = async (itemId: string, isInvite: boolean) => {
    const confirmMsg = isInvite
      ? "Are you sure you want to revoke this invitation?"
      : "Are you sure you want to remove this member?";

    if (!confirm(confirmMsg)) return;

    try {
      const endpoint = isInvite
        ? `/api/invitations/${itemId}`
        : `/api/org/members/${itemId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchMembers();
      } else {
        const data = await response.json();
        alert(data.message || `Failed to ${isInvite ? "revoke" : "remove"}`);
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
            Loading Team...
          </p>
        </div>
      </div>
    );
  }

  const userRole = session?.user?.role as string;
  const canInvite = userRole === "owner" || userRole === "admin";
  const canDelete = userRole === "owner";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/${slug}`}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                Team Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  {slug}
                </p>
                <div className="px-1.5 py-0.5 bg-slate-100 rounded text-[8px] font-black uppercase text-slate-400 border border-slate-200">
                  Role: {session?.user?.role || "UNKNOWN"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Members</h2>
            <p className="text-slate-500 font-medium mt-1">
              Manage permissions and team access.
            </p>
          </div>

          {canInvite ? (
            <Button
              onClick={() => {
                console.log("Opening invite modal...");
                setIsInviteModalOpen(true);
              }}
              className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 font-bold"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          ) : (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
              Restricted to Admin/Owner
            </div>
          )}
        </div>

        <MemberTable
          members={members}
          currentUserId={session?.user?.id}
          canDelete={canDelete}
          onDeleteItem={handleDeleteItem}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <Link href={`/dashboard/${slug}`} className="group">
            <Card className="hover:border-slate-300 transition-all cursor-pointer bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                  <TrendingUp className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">
                    Back to Dashboard
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    View your analytics overview
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="bg-blue-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-xl shadow-blue-600/20">
            <div className="space-y-1">
              <h4 className="text-lg font-bold">Limit Warning</h4>
              <p className="text-blue-100 text-sm font-medium">
                Free plan is limited to 3 members. Upgrade to Pro for unlimited
                team slots.
              </p>
            </div>
            <Button
              onClick={() =>
                alert(
                  "Upgrade Workspace - Integration with Stripe coming soon!"
                )
              }
              className="w-full mt-4 bg-white text-blue-600 hover:bg-blue-50 font-extrabold shadow-sm"
            >
              Upgrade Workspace
            </Button>
          </div>
        </div>
      </main>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchMembers}
      />
    </div>
  );
}
