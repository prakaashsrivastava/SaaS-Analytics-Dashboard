"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { X, Loader2, Send } from "lucide-react";
import { InviteMemberModalProps } from "@/types";

export function InviteMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to send invitation"
        );
      }

      onSuccess();
      toast.success("Invitation sent successfully to " + email);
      onClose();
      setEmail("");
      setRole("member");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sidebar-bg/60 backdrop-blur-sm transition-opacity duration-200">
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transition-all duration-300 border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-raised/50">
          <div>
            <h1 className="text-xl font-black text-text-primary leading-none tracking-tight">
              Team Management
            </h1>
            <p className="text-sm text-text-secondary font-medium">
              Add someone to your organization
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-surface-hover rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <Alert
              variant="destructive"
              className="py-3 bg-danger-tint border-danger/10 text-danger-text rounded-2xl shadow-sm"
            >
              <AlertDescription className="text-xs font-black uppercase tracking-widest animate-in slide-in-from-left-2 transition-all">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-black text-text-muted uppercase tracking-widest"
            >
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/20 rounded-2xl h-12 font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-xs font-black text-text-muted uppercase tracking-widest"
            >
              Role
            </Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-12 px-4 bg-surface-raised border border-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer text-text-primary"
            >
              <option value="member">Member (View only)</option>
              <option value="admin">Admin (Manage projects)</option>
            </select>
            <p className="text-[10px] text-text-muted font-bold uppercase mt-1.5 ml-1">
              {role === "admin"
                ? "✓ Can invite others & create projects"
                : "✓ Can only view analytics"}
            </p>
          </div>

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border font-black rounded-2xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white hover:bg-primary-dark font-black rounded-2xl shadow-xl shadow-primary/20 h-12 transition-all hover:-translate-y-1 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
