"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export function DashboardUpgradeAction() {
  return (
    <Button
      onClick={() =>
        alert("Upgrade Workspace - Integration with Stripe coming soon!")
      }
      size="sm"
      className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold"
    >
      Upgrade Now
    </Button>
  );
}
