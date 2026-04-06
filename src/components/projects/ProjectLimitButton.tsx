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
      size="sm"
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
          ? "border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
          : "bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200"
      }
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      New Project
    </Button>
  );
}
