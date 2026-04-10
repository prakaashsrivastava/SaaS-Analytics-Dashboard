"use client";

import * as React from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  onClose: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-success-tint border-success text-success-text shadow-success/10",
  error: "bg-danger-tint border-danger text-danger-text shadow-danger/10",
  info: "bg-primary-tint border-primary text-primary-dark shadow-primary/10",
  warning: "bg-warning-tint border-warning text-warning-text shadow-warning/10",
};

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-danger" />,
  info: <Info className="w-5 h-5 text-primary" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
};

export function Toast({ id, message, variant = "info", onClose }: ToastProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-10 shadow-lg transition-all animate-in slide-in-from-top-full sm:slide-in-from-bottom-full",
        variantStyles[variant]
      )}
    >
      <div className="flex items-center gap-3">
        {variantIcons[variant]}
        <p className="text-sm font-bold tracking-tight">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="absolute right-2 top-2 rounded-md p-1 text-current/50 opacity-0 transition-opacity hover:text-current focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
