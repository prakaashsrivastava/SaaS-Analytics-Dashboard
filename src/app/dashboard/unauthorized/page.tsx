import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen w-full bg-sidebar-bg flex items-center justify-center p-6 font-sans antialiased text-text-inverse">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-lg w-full">
        <div className="bg-surface/5 backdrop-blur-xl border border-border/10 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center space-y-8">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-dark rounded-3xl flex items-center justify-center shadow-[0_0_40px_var(--color-primary)]/30 rotate-3">
            <ShieldAlert className="w-12 h-12 text-white" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Access Denied
            </h1>
            <p className="text-text-muted text-lg leading-relaxed max-w-sm mx-auto">
              You do not have the required permissions to view this page. Please
              contact your administrator if you believe this is an error.
            </p>
          </div>

          <div className="w-full h-[1px] bg-border/10" />

          <Link href="/dashboard" className="w-full">
            <Button className="w-full h-12 bg-surface text-text-primary hover:bg-surface-hover transition-all font-semibold rounded-xl text-md flex items-center justify-center shadow-lg hover:shadow-surface/5 active:scale-[0.98]">
              Return to Dashboard
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-center text-text-muted text-sm font-medium uppercase tracking-[0.2em]">
          Error Code: 403 Forbidden
        </p>
      </div>
    </div>
  );
}
