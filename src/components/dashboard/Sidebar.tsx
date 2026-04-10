"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Box,
  Users,
  Settings,
  PlusCircle,
  ChevronRight,
  Loader2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { canDo } from "@/lib/permissions";
import { SidebarProject, SidebarProps } from "@/types";

export function Sidebar({
  orgSlug,
  orgName,
  logoUrl,
  userRole,
  plan,
}: SidebarProps) {
  const pathname = usePathname();
  const [projects, setProjects] = useState<SidebarProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data as SidebarProject[]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();

    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener("open-project-modal", handleOpenModal);
    return () =>
      window.removeEventListener("open-project-modal", handleOpenModal);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `/dashboard/${orgSlug}`,
      active: pathname === `/dashboard/${orgSlug}`,
      show: true,
    },
    {
      label: "Projects",
      icon: Box,
      href: `/dashboard/${orgSlug}/projects`,
      active: pathname.startsWith(`/dashboard/${orgSlug}/projects`),
      show: true,
    },
    {
      label: "Team Members",
      icon: Users,
      href: `/dashboard/${orgSlug}/members`,
      active: pathname.startsWith(`/dashboard/${orgSlug}/members`),
      show: true,
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/dashboard/${orgSlug}/settings`,
      active: pathname.startsWith(`/dashboard/${orgSlug}/settings`),
      show: canDo(userRole, "change_settings"),
    },
  ];

  const canCreate = canDo(userRole, "create_project");

  return (
    <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          {logoUrl ? (
            <div className="w-10 h-10 bg-sidebar-hover rounded-xl flex items-center justify-center overflow-hidden border border-sidebar-border">
              <Image
                src={logoUrl}
                alt={orgName}
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
              {orgName[0]}
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="font-bold text-white truncate tracking-tight">
              {orgName}
            </h1>
            <span className="premium-badge bg-sidebar-hover text-primary-light border-primary/20">
              {plan}
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems
            .filter((i) => i.show)
            .map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all group",
                  item.active
                    ? "bg-sidebar-hover text-sidebar-active border-l-2 border-primary shadow-sm"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4",
                    item.active
                      ? "text-sidebar-active"
                      : "text-sidebar-text group-hover:text-white"
                  )}
                />
                {item.label}
              </Link>
            ))}
        </nav>
      </div>

      <div className="mt-4 px-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-hover">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-[11px] font-semibold text-sidebar-text uppercase tracking-wider">
            Recent Projects
          </h2>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:bg-sidebar-hover rounded-md text-sidebar-text hover:text-primary-light transition-colors"
            >
              <PlusCircle className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center gap-3 px-2 py-4 text-sidebar-text/50">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs font-medium">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="px-2 py-4 text-center border border-sidebar-border bg-sidebar-hover/30 rounded-lg">
              <p className="text-[10px] text-sidebar-text font-semibold">
                No projects yet.
              </p>
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${orgSlug}/projects/${project.id}`}
                className={cn(
                  "flex items-center justify-between group px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                  pathname === `/dashboard/${orgSlug}/projects/${project.id}`
                    ? "bg-sidebar-hover text-sidebar-active"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      pathname ===
                        `/dashboard/${orgSlug}/projects/${project.id}`
                        ? "bg-primary"
                        : "bg-sidebar-text group-hover:bg-white"
                    )}
                  />
                  <span className="truncate">{project.name}</span>
                </div>
                <ChevronRight
                  className={cn(
                    "w-3 h-3 transition-transform",
                    pathname === `/dashboard/${orgSlug}/projects/${project.id}`
                      ? "translate-x-0"
                      : "-translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                />
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-sidebar-hover rounded-xl p-4 border border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-tint flex items-center justify-center text-primary-dark text-xs font-bold uppercase">
              {userRole[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate uppercase">
                {userRole}
              </p>
              <p className="text-[10px] text-sidebar-text">Active Member</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-danger-text bg-danger-tint/10 hover:bg-danger-tint/20 transition-all border border-danger/10 group"
          >
            <LogOut className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Logout
          </button>
        </div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orgSlug={orgSlug}
      />
    </aside>
  );
}
