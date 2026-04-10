import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-surface-raised font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-surface sm:items-start rounded-3xl shadow-card my-12 border border-border">
        <Image
          className="dark:invert mb-8"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-4xl font-black leading-tight tracking-tight text-text-primary">
            SaaS Analytics <span className="text-primary">Dashboard</span>
          </h1>
          <p className="max-w-md text-lg font-medium leading-relaxed text-text-secondary">
            A tokenized, high-performance dashboard built with Next.js 14 and
            Tailwind CSS 4.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-bold sm:flex-row mt-12">
          <Link
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 text-white transition-all hover:bg-primary-dark shadow-lg shadow-primary/20 md:w-auto"
            href="/dashboard"
          >
            Go to Dashboard
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-xl border border-solid border-border px-8 text-text-primary transition-all hover:bg-surface-raised md:w-auto"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </Link>
        </div>
      </main>
    </div>
  );
}
