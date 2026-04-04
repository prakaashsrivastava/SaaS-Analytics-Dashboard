"use client";

import React from "react";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const styles = {
    owner: "bg-purple-100 text-purple-700 font-bold",
    admin: "bg-blue-100 text-blue-700 font-bold",
    member: "bg-slate-100 text-slate-600 font-bold",
  };

  const currentStyle =
    styles[role.toLowerCase() as keyof typeof styles] || styles.member;

  return (
    <span
      className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider ${currentStyle}`}
    >
      {role}
    </span>
  );
}

interface UserAvatarProps {
  name?: string | null;
  email: string;
  className?: string;
}

export function UserAvatar({ name, email, className = "" }: UserAvatarProps) {
  const initial = (name?.[0] || email[0]).toUpperCase();

  return (
    <div
      className={`h-10 w-10 shrink-0 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-extrabold uppercase shadow-sm ${className}`}
    >
      {initial}
    </div>
  );
}
