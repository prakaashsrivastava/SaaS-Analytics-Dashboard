"use client";

import React, { useEffect, useState, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, PlusCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InviteMemberModal } from "@/components/invite/InviteMemberModal";
import { MemberTable } from "@/components/members/MemberTable";
import Link from "next/link";
import { Member } from "@/types";

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
  const toast = useToast();

  const [members, setMembers] = useState<Member[]>([]);
  const [organisation, setOrganisation] = useState<{ plan: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Members
      const membersRes = await fetch("/api/org/members");
      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data);
      }

      // 2. Fetch Org Info for plan gating
      const settingsRes = await fetch("/api/org/settings");
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setOrganisation({ plan: data.plan });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  useEffect(() => {
    const openInvite = searchParams.get("openInvite");
    if (openInvite === "true") {
      setIsInviteModalOpen(true);
    }
  }, [searchParams]);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch("/api/org/upgrade", { method: "POST" });
      if (response.ok) {
        setOrganisation({ plan: "pro" });
        toast.success("Success! Workspace upgraded to Pro.");
        router.refresh();
      } else {
        toast.error("Failed to upgrade workspace.");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
    } finally {
      setIsUpgrading(false);
    }
  };

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
        fetchData();
      } else {
        const data = await response.json();
        toast.error(
          data.message || `Failed to ${isInvite ? "revoke" : "remove"}`
        );
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-primary-subtle flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
            Loading Team...
          </p>
        </div>
      </div>
    );
  }

  const userRole = session?.user?.role as string;
  const canInvite = userRole === "owner" || userRole === "admin";
  const canDelete = userRole === "owner";
  const isFreePlan = organisation?.plan === "free";

  return (
    <div className="w-full py-6 px-6 md:py-8 md:px-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-tint/20 rounded-2xl border border-primary/10 shrink-0 shadow-sm">
            <Users className="w-6 h-6 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-premium tracking-tight">
              Team Members
            </h2>
            <p className="text-text-secondary font-medium">
              Manage permissions and team access for this workspace.
            </p>
          </div>
        </div>

        {canInvite ? (
          <Button
            onClick={() => {
              console.log("Opening invite modal...");
              setIsInviteModalOpen(true);
            }}
            className="bg-primary text-white hover:bg-primary-dark shadow-card font-bold px-6 rounded-xl h-11 transition-all hover:-translate-y-0.5"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        ) : (
          <div className="text-[10px] font-black text-text-muted uppercase tracking-widest bg-surface-raised px-4 py-2 rounded-xl border border-border">
            Restricted to Admin/Owner
          </div>
        )}
      </div>

      <main className="space-y-12">
        <MemberTable
          members={members}
          currentUserId={session?.user?.id}
          canDelete={canDelete}
          onDeleteItem={handleDeleteItem}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <Link href={`/dashboard/${slug}`} className="group">
            <Card className="premium-card rounded-2xl overflow-hidden group-hover:shadow-card-hover transition-all">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center group-hover:bg-primary-tint transition-all group-hover:scale-110">
                  <TrendingUp className="w-8 h-8 text-text-primary group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-text-primary tracking-tight group-hover:text-primary transition-colors">
                    Back to Dashboard
                  </h4>
                  <p className="text-sm text-text-secondary font-medium">
                    View your analytics overview
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isFreePlan && (
            <div className="bg-sidebar-bg rounded-2xl p-8 text-white flex flex-col justify-between shadow-2xl shadow-sidebar-bg/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Users className="w-24 h-24" />
              </div>
              <div className="space-y-3 relative z-10">
                <h4 className="text-xl font-bold tracking-tight">
                  Free Plan Limit
                </h4>
                <p className="text-sidebar-text text-sm font-medium leading-relaxed max-w-xs">
                  Free plan is limited to 3 members. Upgrade to Pro for
                  unlimited team slots and premium features.
                </p>
              </div>
              <Button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="w-full mt-8 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-card h-11 relative z-10 transition-all hover:scale-[1.01]"
              >
                {isUpgrading ? "Upgrading..." : "Upgrade Workspace"}
              </Button>
            </div>
          )}
        </div>
      </main>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
