"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Loader2, Zap } from "lucide-react";

export function DashboardUpgradeAction() {
  const { data: session, update } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      const response = await fetch("/api/org/upgrade", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || "Failed to upgrade");
      }

      // Silent session update
      await update({
        ...session,
        user: {
          ...session?.user,
          plan: "pro", // Optimistic UI update or wait for API to confirm exactly what changed
        },
      });

      alert("🎉 Successfully upgraded to PRO!");
    } catch (error) {
      console.error("Upgrade failed:", error);
      alert("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (session?.user?.plan === "pro") {
    return (
      <div className="w-full px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
        <span className="text-[10px] font-black text-amber-700 uppercase tracking-tight">
          PRO Early Access
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isUpgrading}
      size="sm"
      className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 font-bold h-9 transition-all active:scale-95"
    >
      {isUpgrading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          Upgrading...
        </>
      ) : (
        <>
          <Zap className="w-3.5 h-3.5 mr-2 fill-white text-white" />
          Upgrade to Pro
        </>
      )}
    </Button>
  );
}
