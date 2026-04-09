"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Box,
  Users,
  Settings,
  PlusCircle,
  ChevronRight,
  Loader2,
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          {logoUrl ? (
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 overflow-hidden border border-slate-100">
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-200">
              {orgName[0]}
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-slate-900 truncate tracking-tight">
              {orgName}
            </h1>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
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
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all group",
                  item.active
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon
                  className={cn(
                    "w-4 h-4",
                    item.active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-slate-900"
                  )}
                />
                {item.label}
              </Link>
            ))}
        </nav>
      </div>

      <div className="mt-4 px-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Recent Projects
          </h2>
          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <PlusCircle className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {isLoading ? (
            <div className="flex items-center gap-3 px-2 py-4 text-slate-300">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs font-medium">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="px-2 py-4 text-center border border-dashed border-slate-100 rounded-lg">
              <p className="text-[10px] text-slate-400 font-medium italic">
                No projects yet.
              </p>
            </div>
          ) : (
            projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${orgSlug}/projects/${project.id}`}
                className={cn(
                  "flex items-center justify-between group px-3 py-2 rounded-lg text-xs font-bold transition-all",
                  pathname === `/dashboard/${orgSlug}/projects/${project.id}`
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      pathname ===
                        `/dashboard/${orgSlug}/projects/${project.id}`
                        ? "bg-indigo-600"
                        : "bg-slate-200 group-hover:bg-slate-400"
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
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold uppercase">
              {userRole[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate uppercase">
                {userRole}
              </p>
              <p className="text-[10px] text-slate-500">Active Member</p>
            </div>
          </div>
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
