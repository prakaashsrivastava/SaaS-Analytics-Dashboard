"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { registerSchema, RegisterValues } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterValues) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Automatically sign in after registration
      const signInResult = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        router.push("/login?error=auth_failed");
      } else {
        // Use the slug from the registration response to redirect
        const slug = result.organisation.slug;
        router.push(`/dashboard/${slug}`);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-raised p-4 font-sans">
      <Card className="w-full max-w-md shadow-card border-border">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-black tracking-tight text-text-primary">
            Create an account
          </CardTitle>
          <CardDescription className="text-text-secondary font-medium">
            Enter your details to register your organization and your account.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert
                variant="destructive"
                className="bg-danger-tint border-danger-tint text-danger-text rounded-xl"
              >
                <AlertDescription className="font-bold">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="orgName" className="font-bold text-text-primary">
                Organisation Name
              </Label>
              <Input
                id="orgName"
                placeholder="Acme Corp"
                className="rounded-xl border-border focus:ring-primary/20"
                {...register("orgName")}
              />
              {errors.orgName && (
                <p className="text-xs font-bold text-danger-text">
                  {errors.orgName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold text-text-primary">
                Full Name
              </Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="rounded-xl border-border focus:ring-primary/20"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs font-bold text-danger-text">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-text-primary">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="rounded-xl border-border focus:ring-primary/20"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs font-bold text-danger-text">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-text-primary">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="rounded-xl border-border focus:ring-primary/20"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs font-bold text-danger-text">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-primary text-white hover:bg-primary-dark transition-all rounded-xl h-12 font-black shadow-lg shadow-primary/20"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
            <div className="text-center text-sm text-text-secondary font-medium">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold text-primary hover:text-primary-dark hover:underline transition-all"
              >
                Sign in
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
