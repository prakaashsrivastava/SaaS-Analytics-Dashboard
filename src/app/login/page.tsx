"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import Link from "next/link";
import { loginSchema, LoginValues } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-card border-border">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-black tracking-tight text-text-primary">
          Welcome back
        </CardTitle>
        <CardDescription className="text-text-secondary font-medium">
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-danger-tint border-danger-tint text-danger-text rounded-xl"
            >
              <AlertDescription className="font-bold">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-bold text-text-primary"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-xl border-border focus:ring-primary/20"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-bold text-danger-text">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-bold text-text-primary"
              >
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              className="w-full rounded-xl border-border focus:ring-primary/20"
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
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm text-text-secondary font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:text-primary-dark hover:underline transition-all"
            >
              Create an account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface-raised p-4 font-sans">
      <Suspense
        fallback={
          <Card className="w-full max-w-md shadow-card border-border animate-pulse rounded-2xl">
            <CardHeader className="space-y-1 text-center h-24 bg-surface-hover rounded-t-2xl" />
            <CardContent className="space-y-4 h-48 bg-surface" />
            <CardFooter className="h-16 bg-surface-hover rounded-b-2xl" />
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
