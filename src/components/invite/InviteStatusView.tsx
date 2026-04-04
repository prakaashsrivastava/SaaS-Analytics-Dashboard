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

interface InviteStatusViewProps {
  status: "invalid" | "expired" | "accepted";
}

export function InviteStatusView({ status }: InviteStatusViewProps) {
  const router = useRouter();

  const config = {
    invalid: {
      title: "Invalid Invite",
      description: "This invitation link is invalid or has been revoked.",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      color: "bg-red-500",
      accent: "bg-red-50",
    },
    expired: {
      title: "Invite Expired",
      description:
        "This invitation has expired. Ask your administrator to resend it.",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      color: "bg-red-500",
      accent: "bg-red-50",
    },
    accepted: {
      title: "Invite Already Used",
      description:
        "This invitation has already been accepted. Please log in to your account.",
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      color: "bg-green-500",
      accent: "bg-green-50",
    },
  };

  const { title, description, icon, color, accent } = config[status];

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl overflow-hidden">
        <div className={`h-2 ${color}`} />
        <CardHeader className="text-center pb-2">
          <div
            className={`mx-auto w-12 h-12 ${accent} rounded-full flex items-center justify-center mb-4`}
          >
            {icon}
          </div>
          <CardTitle className="text-2xl font-extrabold text-slate-900">
            {title}
          </CardTitle>
          <CardDescription className="font-medium">
            {description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-6">
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 font-bold"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
