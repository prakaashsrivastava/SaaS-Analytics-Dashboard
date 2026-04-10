"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  MapPin,
  Upload,
  CheckCircle2,
  Loader2,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrgSettingsFormProps, settingsSchema, SettingsValues } from "@/types";

export function OrgSettingsForm({ organisation }: OrgSettingsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: organisation.name,
      timezone: organisation.timezone,
      logoUrl: organisation.logoUrl,
    },
  });

  const currentLogoUrl = watch("logoUrl");
  const timezones = Intl.supportedValuesOf("timeZone");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation
    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: "error", message: "File is too large (max 2MB)" });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/org/logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }

      const data = await response.json();
      setValue("logoUrl", data.logoUrl);
      setFeedback({ type: "success", message: "Logo uploaded successfully" });
      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
      setFeedback({
        type: "error",
        message: "Failed to upload logo. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: SettingsValues) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/org/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setFeedback({ type: "success", message: "Settings saved successfully!" });
      router.refresh();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      console.error("Submit error:", error);
      setFeedback({
        type: "error",
        message: "Failed to save settings. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="premium-card rounded-2xl overflow-hidden glass-card">
      <CardContent className="px-6 py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Logo Upload Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-8 border-b border-border mb-8">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-surface-raised flex items-center justify-center overflow-hidden border-2 border-dashed border-border group-hover:border-primary transition-all">
                {currentLogoUrl ? (
                  <Image
                    src={currentLogoUrl}
                    alt="Logo Preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-text-muted" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-lg shadow-card hover:bg-primary-dark transition-colors disabled:bg-surface-raised"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*"
                />
              </button>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-text-primary leading-tight">
                Organization Logo
              </h4>
              <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-sm">
                Updates your workspace icon and is shown in invitation emails.{" "}
                <br />
                <span className="text-[10px] font-semibold uppercase text-primary tracking-wider opacity-80">
                  JPG, PNG OR WEBP • MAX 2MB
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Org Name */}
            <div className="space-y-4">
              <Label
                htmlFor="name"
                className="text-[11px] font-semibold uppercase text-text-muted tracking-wider"
              >
                Workspace Name
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                  <Building2 className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="pl-12 h-12 rounded-xl border-border bg-surface font-bold text-text-primary focus:ring-2 focus:ring-primary transition-all"
                  placeholder="e.g. Acme Corp"
                />
                {errors.name && (
                  <p className="mt-2 text-xs font-bold text-danger">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-4">
              <Label
                htmlFor="timezone"
                className="text-[11px] font-semibold uppercase text-text-muted tracking-wider"
              >
                Default Timezone
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                  <MapPin className="w-5 h-5" />
                </div>
                <select
                  id="timezone"
                  {...register("timezone")}
                  className="w-full pl-12 h-12 rounded-xl border-border bg-surface font-bold text-text-primary focus:ring-2 focus:ring-primary transition-all appearance-none outline-none ring-1 ring-border focus:ring-2"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {errors.timezone && (
                  <p className="mt-2 text-xs font-bold text-danger">
                    {errors.timezone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center gap-6 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto h-11 px-10 bg-primary text-white hover:bg-primary-dark rounded-xl font-bold shadow-lg shadow-primary/10 transition-all disabled:opacity-50 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>

            {feedback && (
              <div
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border animate-in fade-in slide-in-from-left-2 shadow-sm ${
                  feedback.type === "success"
                    ? "bg-success-tint/50 border-success/20 text-success-text"
                    : "bg-danger-tint/50 border-danger/20 text-danger-text"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {feedback.message}
                </span>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
