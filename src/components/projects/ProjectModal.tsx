"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Globe, FileText } from "lucide-react";
import { projectSchema, ProjectValues, ProjectModalProps } from "@/types";

export function ProjectModal({ isOpen, onClose, orgSlug }: ProjectModalProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      domain: "",
      description: "",
    },
  });

  const onSubmit = async (data: ProjectValues) => {
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create project");
      }

      reset();
      onClose();
      router.refresh();
      router.push(`/dashboard/${orgSlug}/projects/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-card">
        <div className="h-2 bg-primary" />
        <DialogHeader className="px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-black text-text-primary flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-tint rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            Create New Project
          </DialogTitle>
          <DialogDescription className="text-text-secondary font-medium pt-1">
            Build something amazing. Start tracking analytics in seconds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="py-2 bg-danger-tint border-danger/30"
            >
              <AlertDescription className="text-[10px] font-bold uppercase text-danger-text">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-[10px] font-bold text-text-secondary uppercase tracking-widest"
              >
                Project Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. My Awesome App"
                {...register("name")}
                className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/10 placeholder:text-text-muted font-medium"
              />
              {errors.name && (
                <p className="text-[10px] font-bold text-danger uppercase">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="domain"
                className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5"
              >
                <Globe className="w-3 h-3 text-text-muted" />
                Domain (Optional)
              </Label>
              <Input
                id="domain"
                placeholder="e.g. example.com"
                {...register("domain")}
                className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/10 placeholder:text-text-muted font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-text-muted" />
                Description (Optional)
              </Label>
              <Input
                id="description"
                placeholder="What is this project about?"
                {...register("description")}
                className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/10 placeholder:text-text-muted font-medium"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 sm:justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-text-secondary font-bold hover:bg-surface-raised"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark text-white font-black shadow-card min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Launch Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
