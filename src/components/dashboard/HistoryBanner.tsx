"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UpgradeModal } from "@/components/plan/UpgradeModal";

export function HistoryBanner() {
  const { data: session } = useSession();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  if (session?.user?.plan === "pro") {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-sidebar-bg to-primary-dark rounded-2xl shadow-xl shadow-primary/10 text-text-inverse mt-8 border border-sidebar-border relative overflow-hidden group">
      {/* Decorative pulse element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 blur-3xl -mr-16 -mt-16 group-hover:bg-primary-light/20 transition-all duration-700"></div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
          <Zap className="w-6 h-6 text-warning fill-warning" />
        </div>
        <div>
          <h5 className="font-bold text-base leading-none mb-1 text-white">
            Access 90-day History
          </h5>
          <p className="text-xs font-semibold text-text-muted max-w-xs leading-relaxed">
            Free users are limited to 7 days. Upgrade to Pro for deep-dive
            analytics.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        <button className="p-2 text-text-muted hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <Button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="bg-surface text-text-primary hover:bg-surface-hover font-extrabold px-6 rounded-xl shadow-lg shadow-white/5 h-10 border-0"
        >
          Upgrade to Pro
        </Button>
      </div>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
      />
    </div>
  );
}
