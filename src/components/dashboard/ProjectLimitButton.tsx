"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function ProjectLimitButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      className="border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
      onClick={() =>
        alert(
          "Project creation limit reached on FREE plan. Upgrade to PRO to create more projects!"
        )
      }
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      New Project
    </Button>
  );
}
