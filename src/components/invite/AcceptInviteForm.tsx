"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, ArrowRight, CheckCircle2, LogOut } from "lucide-react";
import { AcceptInviteFormProps, AcceptValues, acceptSchema } from "@/types";

export function AcceptInviteForm({
  token,
  orgName,
  email,
  role,
}: AcceptInviteFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptValues>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      token: token,
      name: "",
      password: "",
    },
  });

  const isCorrectUserLoggedIn = session?.user?.email === email;
  const isWrongUserLoggedIn =
    !!session?.user?.email && session.user.email !== email;

  async function onAcceptAsCurrent() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          // For existing users, name and password aren't used for creation but required by schema
          // We can send placeholders if the API handles it (which it does via Prisma transaction)
          name: session?.user?.name || "Member",
          password: "PRE_AUTHENTICATED_USER",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept invitation");
      }

      alert("Successfully joined " + orgName + "!");
      router.push(`/dashboard/${result.orgSlug}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setSubmitting(false);
    }
  }

  async function onSubmit(data: AcceptValues) {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name: data.name,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to accept invitation");
      }

      alert("Account created and successfully joined " + orgName + "!");

      // Automatically sign in
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: result.email,
        password: data.password,
      });

      if (signInResult?.error) {
        router.push("/login?error=auth_failed");
      } else {
        router.push(`/dashboard/${result.orgSlug}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="h-2 bg-purple-600" />
        <CardHeader className="space-y-1 text-center bg-slate-50/50 border-b border-slate-100 pb-8">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900">
            Join {orgName}
          </CardTitle>
          <CardDescription className="text-slate-500 font-bold uppercase tracking-tight text-[10px]">
            Invited as{" "}
            <span className="text-purple-600 px-1.5 py-0.5 bg-purple-50 rounded">
              {role}
            </span>
          </CardDescription>
        </CardHeader>

        <div className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-6 py-2">
              <AlertDescription className="text-xs font-bold uppercase">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {isCorrectUserLoggedIn ? (
            <div className="space-y-6 text-center">
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
                <p className="text-sm font-bold text-green-800">
                  You&apos;re already logged in!
                </p>
                <p className="text-xs text-green-600 font-medium italic">
                  {email}
                </p>
              </div>
              <Button
                onClick={onAcceptAsCurrent}
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-6 shadow-xl shadow-slate-900/10 group"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Confirm & Join Organization
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          ) : isWrongUserLoggedIn ? (
            <div className="space-y-6 text-center">
              <Alert className="bg-amber-50 border-amber-100 mb-6">
                <AlertDescription className="text-xs font-bold text-amber-800 flex flex-col gap-1">
                  <span>You are currently logged in as:</span>
                  <span className="italic">{session.user.email}</span>
                  <span className="mt-2 text-[10px] uppercase">
                    This invite is for {email}
                  </span>
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: window.location.href })}
                className="w-full border-slate-200 text-slate-600 font-bold"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Logout to Switch Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic opacity-60"
                >
                  Email address (Verified)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-100/50 border-slate-200 text-slate-400 font-medium italic cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                >
                  Your Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  {...register("name")}
                  className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-purple-500/10"
                />
                {errors.name && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                >
                  Set Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register("password")}
                  className="bg-slate-50 border-slate-200 focus:bg-white focus:ring-purple-500/10"
                />
                {errors.password && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-black py-6 shadow-xl shadow-slate-900/10 group"
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
