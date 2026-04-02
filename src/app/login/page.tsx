"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

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
    <Card className="w-full max-w-md shadow-lg border-slate-200">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-500">
          Enter your credentials to access your dashboard.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-50 border-red-200 text-red-800"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" text-sm font-medium text-slate-700>
                Password
              </Label>
            </div>
            <Input
              id="password"
              type="password"
              className="w-full"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <div className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-slate-900 hover:text-slate-700 hover:underline transition-all"
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md shadow-lg border-slate-200 animate-pulse">
            <CardHeader className="space-y-1 text-center h-24 bg-slate-100" />
            <CardContent className="space-y-4 h-48 bg-slate-50" />
            <CardFooter className="h-16 bg-slate-100" />
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
