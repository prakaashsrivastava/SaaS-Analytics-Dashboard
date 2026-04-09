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
  userExists,
  userName,
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

      // If they were creating an account (not just joining as existing)
      if (data.password !== "EXISTING_USER_BYPASS") {
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
      } else {
        alert("Successfully joined " + orgName + "!");
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
    <div className="flex items-center justify-center min-h-screen bg-surface-raised p-4 font-sans">
      <Card className="w-full max-w-md shadow-card border-border overflow-hidden animate-in fade-in zoom-in-95 duration-500 rounded-3xl">
        <div className="h-2 bg-primary" />
        <CardHeader className="space-y-1 text-center bg-surface-raised/50 border-b border-border pb-8">
          <div className="mx-auto w-16 h-16 bg-surface rounded-2xl shadow-sm border border-border flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black text-text-primary tracking-tight">
            Join {orgName}
          </CardTitle>
          <CardDescription className="text-text-muted font-black uppercase tracking-widest text-[10px]">
            Invited as{" "}
            <span className="text-primary px-2 py-0.5 bg-primary-tint rounded-full">
              {role}
            </span>
          </CardDescription>
        </CardHeader>

        <div className="p-8">
          {error && (
            <Alert variant="destructive" className="mb-6 py-2 bg-danger-tint border-danger-tint text-danger-text rounded-xl">
              <AlertDescription className="text-xs font-bold uppercase tracking-tight">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* CASE 1: Correct user is already logged in */}
          {isCorrectUserLoggedIn && (
            <div className="space-y-6 text-center animate-in fade-in">
              <div className="p-4 bg-success-tint border border-success/10 rounded-2xl flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <p className="text-sm font-bold text-success-text text-center">
                  You&apos;re already logged in as {email}!
                </p>
              </div>
              <Button
                onClick={onAcceptAsCurrent}
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-7 rounded-2xl shadow-xl shadow-primary/20 group text-lg"
              >
                {submitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Join Organization
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* CASE 2: Wrong user is logged in */}
          {isWrongUserLoggedIn && !isCorrectUserLoggedIn && (
            <div className="space-y-6 text-center animate-in fade-in">
              <Alert className="bg-warning-tint border-warning/10 mb-6 rounded-2xl">
                <AlertDescription className="text-xs font-bold text-warning-text flex flex-col gap-2">
                  <span className="opacity-80">You are currently logged in as:</span>
                  <span className="text-sm font-black">{session?.user?.email}</span>
                  <span className="mt-2 text-[10px] uppercase tracking-widest bg-warning/10 px-2 py-1 rounded-full">
                    This invite is for {email}
                  </span>
                </AlertDescription>
              </Alert>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: window.location.href })}
                className="w-full border-border text-text-secondary font-bold rounded-2xl py-6 h-auto"
              >
                <LogOut className="mr-2 w-4 h-4" />
                Logout to Switch Account
              </Button>
            </div>
          )}

          {/* CASE 3 & 4: Not logged in */}
          {!session && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {userExists ? (
                /* CASE 3: User exists but not logged in */
                <div className="space-y-6 text-center">
                  <div className="p-4 bg-primary-subtle border border-primary/10 rounded-2xl flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                    <p className="text-sm font-black text-primary-dark text-center uppercase tracking-tight">
                      Welcome back, {userName || "Member"}!
                    </p>
                    <p className="text-xs text-text-secondary font-medium text-center">
                      Just click below to join {orgName}. We will link this to
                      your existing account.
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      onSubmit({
                        token,
                        name: userName || "Member",
                        password: "EXISTING_USER_BYPASS",
                      })
                    }
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-7 rounded-2xl shadow-xl shadow-primary/20 group text-lg"
                  >
                    {submitting ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        Join Organization
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-relaxed">
                    Not you? <br />
                    <button
                      onClick={() => router.push("/login")}
                      className="text-primary hover:underline font-black mt-1"
                    >
                      Login with another account
                    </button>
                  </p>
                </div>
              ) : (
                /* CASE 4: New user registration */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-60"
                    >
                      Email address (Verified)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="bg-surface-raised border-border text-text-muted font-bold cursor-not-allowed rounded-2xl h-9 px-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-[10px] font-black text-text-muted uppercase tracking-widest"
                    >
                      Your Full Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      {...register("name")}
                      className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/10 rounded-2xl h-12 font-bold"
                    />
                    {errors.name && (
                      <p className="text-[10px] font-black text-danger-text uppercase tracking-tight">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-[10px] font-black text-text-muted uppercase tracking-widest"
                    >
                      Set Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      {...register("password")}
                      className="bg-surface-raised border-border focus:bg-surface focus:ring-primary/10 rounded-2xl h-12 font-bold"
                    />
                    {errors.password && (
                      <p className="text-[10px] font-black text-danger-text uppercase tracking-tight">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full mt-4 bg-primary hover:bg-primary-dark text-white font-black py-7 rounded-2xl shadow-xl shadow-primary/20 group text-lg"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
