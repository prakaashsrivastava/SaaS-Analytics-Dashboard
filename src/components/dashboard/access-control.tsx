"use client";

import { useSession } from "next-auth/react";
import { canDo } from "@/lib/permissions";
import React from "react";

interface AccessControlProps {
  action: string;
  children: React.ReactNode;
}

/**
 * AccessControl component hides children if the user does not have permission.
 * This provides a clean UI for SaaS users, hiding actions they cannot perform.
 */
export function AccessControl({ action, children }: AccessControlProps) {
  const { data: session } = useSession();
  const role = session?.user?.role as string;

  if (!role || !canDo(role, action)) {
    return null;
  }

  return <>{children}</>;
}
