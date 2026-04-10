"use client";

import React from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { SidebarProps } from "@/types";
import { Sidebar } from "./Sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet";

export function MobileHeader({
  orgSlug,
  orgName,
  logoUrl,
  userRole,
  plan,
}: SidebarProps) {
  return (
    <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-border sticky top-0 z-40 w-full">
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <div className="w-8 h-8 bg-sidebar-hover rounded-lg flex items-center justify-center overflow-hidden border border-border">
            <Image
              src={logoUrl}
              alt={orgName}
              width={32}
              height={32}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {orgName[0]}
          </div>
        )}
        <h1 className="font-bold text-text-primary truncate tracking-tight max-w-[150px]">
          {orgName}
        </h1>
      </div>

      <Sheet>
        <SheetTrigger
          render={
            <button className="p-2 hover:bg-surface-hover rounded-lg text-text-secondary transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          }
        />
        <SheetContent
          side="left"
          className="p-0 border-none w-72 bg-sidebar-bg"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              Access dashboard, projects, and team settings.
            </SheetDescription>
          </SheetHeader>
          <Sidebar
            orgSlug={orgSlug}
            orgName={orgName}
            logoUrl={logoUrl}
            userRole={userRole}
            plan={plan}
          />
        </SheetContent>
      </Sheet>
    </header>
  );
}
