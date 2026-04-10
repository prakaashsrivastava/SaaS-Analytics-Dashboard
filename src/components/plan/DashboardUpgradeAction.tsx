"use client";

import React from "react";
import { Button } from "@/components/ui/button";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";

export function DashboardUpgradeAction() {
  const { data: session, update } = useSession();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const toast = useToast();

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

      toast.success("🎉 Successfully upgraded to PRO!");
    } catch (error) {
      console.error("Upgrade failed:", error);
      toast.error("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  if (session?.user?.plan === "pro") {
    return (
      <div className="w-full px-4 py-3 bg-primary-tint border border-primary/10 rounded-2xl flex items-center gap-3 shadow-inner">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-black text-primary-dark uppercase tracking-widest">
          High-Performance Plan Active
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleUpgrade}
      disabled={isUpgrading}
      className={`bg-primary hover:bg-primary-dark text-white font-black h-8 rounded-xl transition-all shadow-md hover:shadow-primary/20 active:scale-95 tracking-tight px-4 ${isUpgrading ? "opacity-80" : ""}`}
    >
      {isUpgrading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Upgrading...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2 fill-white text-white" />
          Upgrade to PRO
        </>
      )}
    </Button>
  );
}
