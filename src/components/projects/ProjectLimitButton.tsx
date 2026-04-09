"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectLimitButtonProps } from "@/types";

export function ProjectLimitButton({
  isLimited,
  canCreate,
}: ProjectLimitButtonProps) {
  if (!canCreate) return null;

  return (
    <Button
      size="lg"
      variant={isLimited ? "outline" : "default"}
      onClick={() => {
        if (isLimited) {
          alert(
            "Project creation limit reached on FREE plan. Upgrade to PRO to create more projects!"
          );
        } else {
          // This button is used in pages to trigger project creation.
          // Since the modal is in the Sidebar (Layout), we use a custom event.
          window.dispatchEvent(new CustomEvent("open-project-modal"));
        }
      }}
      className={
        isLimited
          ? "border-border font-black text-text-secondary hover:bg-surface-hover rounded-xl h-9 px-6 transition-all"
          : "bg-primary hover:bg-primary-dark text-white font-black shadow-card rounded-xl h-9 px-6 transition-all hover:-translate-y-0.5 active:scale-95 tracking-tight"
      }
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      New Project
    </Button>
  );
}
