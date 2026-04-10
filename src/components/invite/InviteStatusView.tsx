"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { InviteStatusViewProps } from "@/types";

export function InviteStatusView({ status }: InviteStatusViewProps) {
  const router = useRouter();

  const config = {
    invalid: {
      title: "Invalid Invite",
      description: "This invitation link is invalid or has been revoked.",
      icon: <XCircle className="w-6 h-6 text-danger-text" />,
      color: "bg-danger",
      accent: "bg-danger-tint",
    },
    expired: {
      title: "Invite Expired",
      description:
        "This invitation has expired. Ask your administrator to resend it.",
      icon: <XCircle className="w-6 h-6 text-danger-text" />,
      color: "bg-danger",
      accent: "bg-danger-tint",
    },
    accepted: {
      title: "Invite Already Used",
      description:
        "This invitation has already been accepted. Please log in to your account.",
      icon: <CheckCircle2 className="w-6 h-6 text-success-text" />,
      color: "bg-success",
      accent: "bg-success-tint",
    },
  };

  const { title, description, icon, color, accent } = config[status];

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-raised p-4 font-sans">
      <Card className="w-full max-w-md border-border shadow-card overflow-hidden rounded-3xl">
        <div className={`h-2 ${color}`} />
        <CardHeader className="text-center pb-6 bg-surface px-6">
          <div
            className={`mx-auto w-12 h-12 ${accent} rounded-full flex items-center justify-center mb-4 border border-border/50`}
          >
            {icon}
          </div>
          <CardTitle className="text-2xl font-black text-text-primary tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-text-secondary font-medium">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="p-6 bg-surface border-t border-border/50 px-6">
          <div className="space-y-6 w-full text-center">
            <Button
              className="w-full bg-primary hover:bg-primary-dark text-white font-black rounded-2xl h-9"
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
            {(status === "expired" || status === "invalid") && (
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60">
                Need a new invite? <br />
                <a
                  href="mailto:admin@example.com?subject=Request for New Invitation"
                  className="text-primary hover:underline font-black mt-1 inline-block"
                >
                  Contact Administrator
                </a>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
