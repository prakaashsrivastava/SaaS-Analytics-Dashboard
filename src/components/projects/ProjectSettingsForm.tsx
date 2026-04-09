"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Type, Globe, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@prisma/client";

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  domain: z.string().optional().nullable(),
});

type ProjectValues = z.infer<typeof projectSchema>;

interface ProjectSettingsFormProps {
  project: Project;
  orgSlug: string;
  isOwner: boolean;
}

export function ProjectSettingsForm({
  project,
  orgSlug,
  isOwner,
}: ProjectSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      domain: project.domain,
    },
  });

  const onSubmit = async (data: ProjectValues) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH", // Using PATCH as per implementation plan
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      setFeedback({
        type: "success",
        message: "Project updated successfully!",
      });
      router.refresh();

      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Project update error:", error);
      setFeedback({
        type: "error",
        message: "Failed to update project. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // 1. Fetch stats first as per PRD requirement
      const statsRes = await fetch(`/api/projects/${project.id}/stats`);
      const stats = await statsRes.json();
      const count = stats.eventCount || 0;

      // 2. Specialized PRD warning
      if (
        !confirm(
          `Are you sure you want to delete ${project.name}? This will permanently delete ${count.toLocaleString()} events. This action is irreversible.`
        )
      ) {
        setIsDeleting(false);
        return;
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      router.push(`/dashboard/${orgSlug}/projects`);
      router.refresh();
    } catch (error) {
      console.error("Project deletion error:", error);
      alert("Failed to delete project. Please try again.");
      setIsDeleting(false);
    }
  };

  // Adding an effect or manual wire to the button in the parent component if it can't be inside the form
  // But actually, I can just put the delete button here too or use a portal.
  // For simplicity, let's keep the delete logic here and wire it to a button if needed.

  return (
    <Card className="bg-surface border-border rounded-3xl overflow-hidden shadow-card">
      <CardContent className="px-6 py-10">
        <form
          id="project-settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Project Name */}
            <div className="space-y-4">
              <Label
                htmlFor="name"
                className="text-xs font-black uppercase text-text-muted tracking-widest"
              >
                Project Name
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                  <Type className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="pl-12 h-12 rounded-xl border-border bg-surface font-bold text-text-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g. My Awesome App"
                />
                {errors.name && (
                  <p className="mt-2 text-xs font-bold text-danger">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Project Domain */}
            <div className="space-y-4">
              <Label
                htmlFor="domain"
                className="text-xs font-black uppercase text-text-muted tracking-widest"
              >
                Website Domain
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                  <Globe className="w-5 h-5" />
                </div>
                <Input
                  id="domain"
                  {...register("domain")}
                  className="pl-12 h-12 rounded-xl border-border bg-surface font-bold text-text-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g. app.example.com"
                />
                {errors.domain && (
                  <p className="mt-2 text-xs font-bold text-danger">
                    {errors.domain.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center gap-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto h-9 px-10 bg-primary text-white hover:bg-primary-dark rounded-xl font-black shadow-card transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Project Settings"
              )}
            </Button>

            {feedback && (
              <div
                className={`flex items-center gap-2 p-3 rounded-xl border animate-in fade-in slide-in-from-left-2 ${feedback.type === "success"
                    ? "bg-success-tint border-success text-success-text"
                    : "bg-danger-tint border-danger text-danger-text"
                  }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-bold">{feedback.message}</span>
              </div>
            )}

            {/* The actual delete button that users see at the bottom of the form if they are owners */}
            {isOwner && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructive"
                className="w-full md:w-auto h-9 px-10 bg-danger text-white hover:bg-danger-dark rounded-xl font-black shadow-card transition-all ml-auto md:hidden"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            )}
          </div>
        </form>

        {/* Global event listener for the parent's delete button if it's rendered outside */}
        {isOwner && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
            document.getElementById('delete-project-btn')?.addEventListener('click', async () => {
              try {
                const statsRes = await fetch('/api/projects/${project.id}/stats');
                const stats = await statsRes.json();
                const count = stats.eventCount || 0;
                
                if (confirm('Are you sure you want to delete ${project.name}? This will permanently delete ' + count.toLocaleString() + ' events. This action is irreversible.')) {
                  const delRes = await fetch('/api/projects/${project.id}', { method: 'DELETE' });
                  if (delRes.ok) {
                    window.location.href = '/dashboard/${orgSlug}/projects';
                  } else {
                    alert('Failed to delete project');
                  }
                }
              } catch (e) {
                alert('Error processing deletion request');
              }
            });
          `,
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
