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

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-[2.5rem] bg-surface font-sans">
        <DialogHeader className="pt-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary-tint rounded-3xl flex items-center justify-center mb-6 animate-bounce shadow-xl shadow-primary/10">
            <Zap className="w-10 h-10 text-primary fill-primary" />
          </div>
          <DialogTitle className="text-3xl font-black text-text-primary tracking-tight">
            Unlock High-Performance Analytics
          </DialogTitle>
          <DialogDescription className="text-text-secondary font-medium pt-3 text-base leading-relaxed max-w-xs">
            Unlock pro features and scale your organization with advanced
            analytics.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Unlimited Projects</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Unlimited Members</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">
              90-day Analytics History
            </span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Priority Support</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium">Advanced Analytics</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-4 sm:flex-col items-stretch p-10 pt-6">
          <DashboardUpgradeAction />
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-muted font-black hover:text-text-secondary h-12 rounded-2xl transition-all"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
