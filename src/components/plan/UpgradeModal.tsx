"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2 } from "lucide-react";
import { UpgradeModalProps } from "@/types";
import { DashboardUpgradeAction } from "./DashboardUpgradeAction";

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  limit,
}: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl">
        <DialogHeader className="pt-4 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Zap className="w-8 h-8 text-amber-600 fill-amber-600" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900">
            Unlock Pro Features
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium pt-2">
            {feature === "projects" ? (
              <>
                You&apos;ve reached the limit of {limit} project on the Free
                plan.
              </>
            ) : feature === "members" ? (
              <>
                You&apos;ve reached the limit of {limit} members on the Free
                plan.
              </>
            ) : (
              <>Upgrade your plan to unlock advanced analytics and more.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-700">
                Unlimited Projects & Members
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-700">
                90-day Analytics History
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-700">
                Advanced Charts (Funnel & Retention)
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-3 sm:flex-col">
          <DashboardUpgradeAction />
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 font-bold hover:text-slate-600"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
