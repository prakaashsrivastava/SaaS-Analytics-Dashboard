"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

import { DashboardActionsProps } from "@/types";

export function DashboardActions({
  slug,
  canInvite,
  canSettings,
}: DashboardActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      {canInvite && (
        <Button
          onClick={() => {
            console.log("Navigating to members with invite intent...");
            router.push(`/dashboard/${slug}/members?openInvite=true`);
          }}
          className="bg-primary text-white hover:bg-primary-dark shadow-card h-9"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      )}
      {canSettings && (
        <Button
          variant="outline"
          onClick={() => alert("Settings page coming soon!")}
          className="border-border hover:bg-surface-hover h-9"
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      )}
    </div>
  );
}
