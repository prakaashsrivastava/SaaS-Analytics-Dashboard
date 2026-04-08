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
    <Card className="bg-white border-slate-200 rounded-3xl overflow-hidden shadow-sm">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Logo Upload Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 pb-8 border-b border-slate-50">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200 group-hover:border-indigo-400 transition-all">
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
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300"
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
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                Organization Logo
              </h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-sm">
                Updates your workspace icon and is shown in invitation emails.{" "}
                <br />
                <span className="text-[10px] font-black uppercase text-indigo-400">
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
                className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1"
              >
                Workspace Name
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <Building2 className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  {...register("name")}
                  className="pl-12 h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. Acme Corp"
                />
                {errors.name && (
                  <p className="mt-2 text-xs font-bold text-red-500 pl-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Timezone */}
            <div className="space-y-4">
              <Label
                htmlFor="timezone"
                className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1"
              >
                Default Timezone
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none">
                  <MapPin className="w-5 h-5" />
                </div>
                <select
                  id="timezone"
                  {...register("timezone")}
                  className="w-full pl-12 h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none outline-none ring-1 ring-slate-200 focus:ring-2"
                >
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {errors.timezone && (
                  <p className="mt-2 text-xs font-bold text-red-500 pl-1">
                    {errors.timezone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col md:flex-row items-center gap-6 border-t border-slate-50">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto h-12 px-10 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-black shadow-xl shadow-slate-900/10 transition-all disabled:opacity-50"
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
                className={`flex items-center gap-2 p-3 rounded-xl border animate-in fade-in slide-in-from-left-2 ${
                  feedback.type === "success"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
