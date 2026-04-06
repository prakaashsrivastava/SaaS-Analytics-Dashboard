"use client";

import React, { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";
import { InviteStatusView } from "@/components/invite/InviteStatusView";
import { AcceptInviteForm } from "@/components/invite/AcceptInviteForm";

import { InviteData } from "@/types";

export default function InviteAcceptancePage({
  params: paramsPromise,
}: {
  params: Promise<{ token: string }>;
}) {
  const params = use(paramsPromise);
  const token = params.token;

  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "expired" | "accepted"
  >("loading");

  useEffect(() => {
    async function validateToken() {
      try {
        const response = await fetch(`/api/invitations/${token}`);
        const data = await response.json();

        if (response.ok) {
          setInviteData(data);
          setStatus("valid");
        } else {
          if (data.error === "INVITATION_NOT_FOUND") setStatus("invalid");
          else if (data.error === "EXPIRED") setStatus("expired");
          else if (data.error === "ALREADY_ACCEPTED") setStatus("accepted");
        }
      } catch (err) {
        console.error("Token validation error:", err);
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            Validating Invitation...
          </p>
        </div>
      </div>
    );
  }

  if (status === "invalid" || status === "expired" || status === "accepted") {
    return <InviteStatusView status={status} />;
  }

  if (status === "valid" && inviteData) {
    return (
      <AcceptInviteForm
        token={token}
        orgName={inviteData.orgName}
        email={inviteData.email}
        role={inviteData.role}
      />
    );
  }

  return null;
}
