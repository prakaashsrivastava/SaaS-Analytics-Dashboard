"use client";

import React from "react";
import { RoleBadgeProps, UserAvatarProps } from "@/types";

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    owner: "bg-primary-tint text-primary-dark",
    admin: "bg-primary-tint/50 text-primary",
    member: "bg-surface-raised text-text-secondary border border-border",
  };

  const currentStyle =
    styles[role.toLowerCase() as keyof typeof styles] || styles.member;

  return (
    <span
      className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-medium tracking-wider ${currentStyle}`}
    >
      {role}
    </span>
  );
}

export function UserAvatar({ name, email, className = "" }: UserAvatarProps) {
  const initial = (name?.[0] || email[0]).toUpperCase();

  return (
    <div
      className={`h-10 w-10 shrink-0 rounded-xl bg-primary-tint flex items-center justify-center text-primary text-sm font-black uppercase shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}
