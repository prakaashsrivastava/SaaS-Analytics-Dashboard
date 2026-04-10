"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Code, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingGuideProps } from "@/types";

export function TrackingGuide({ projectId }: TrackingGuideProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const scriptSnippet = `<!-- Add this to your <head> -->
<script 
  async 
  src="/collect.js" 
  data-project-id="${projectId}"
></script>`;

  const curlSnippet = `curl -X POST /api/collect \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectId": "${projectId}",
    "eventType": "page_view",
    "properties": { "path": "/" }
  }'`;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 font-sans">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="w-24 h-24 bg-primary-tint rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/10 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Terminal className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-5xl font-black text-text-primary tracking-tight">
          Waiting for your first event...
        </h2>
        <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-2xl mx-auto opacity-80">
          Your project is ready to go, but we haven&apos;t seen any activity
          yet. Use one of the methods below to activate your dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Method 1: JS Snippet */}
        <Card className="border-border shadow-card overflow-hidden rounded-3xl group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-surface-raised/40 border-b border-border">
            <CardTitle icon={<Code className="w-6 h-6" />}>
              Client-side Script
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-10 space-y-6">
            <p className="text-base text-text-secondary font-medium leading-relaxed">
              The easiest way to get started. Paste this script into your
              website&apos;s{" "}
              <code className="bg-primary-tint text-primary-dark px-2 py-0.5 rounded font-black font-mono">
                &lt;head&gt;
              </code>{" "}
              tag.
            </p>
            <div className="relative group/code">
              <pre className="bg-sidebar-bg text-primary-light p-6 rounded-2xl text-sm font-mono overflow-x-auto border border-surface/10 shadow-2xl leading-relaxed">
                {scriptSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 bg-surface/5 hover:bg-primary text-white font-black h-10 px-4 rounded-xl transition-all opacity-0 group-hover/code:opacity-100 shadow-xl"
                onClick={() => copyToClipboard(scriptSnippet, "script")}
              >
                {copied === "script" ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Method 2: Server-side API */}
        <Card className="border-border shadow-card overflow-hidden rounded-3xl group hover:shadow-2xl transition-all duration-500">
          <CardHeader className="bg-surface-raised/40 border-b border-border">
            <CardTitle icon={<Terminal className="w-6 h-6" />}>
              Direct API Call
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-10 space-y-6">
            <p className="text-base text-text-secondary font-medium leading-relaxed">
              Send events directly from your server. Perfect for tracking
              conversions or internal processes.
            </p>
            <div className="relative group/code">
              <pre className="bg-sidebar-bg text-primary-light p-6 rounded-2xl text-sm font-mono overflow-x-auto border border-surface/10 shadow-2xl leading-relaxed">
                {curlSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 bg-surface/5 hover:bg-primary text-white font-black h-10 px-4 rounded-xl transition-all opacity-0 group-hover/code:opacity-100 shadow-xl"
                onClick={() => copyToClipboard(curlSnippet, "curl")}
              >
                {copied === "curl" ? (
                  <CheckCircle2 className="w-4 h-4 text-success" />
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-sidebar-bg rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl border border-surface/10 group">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
        <div className="space-y-4 relative z-10 max-w-xl">
          <h3 className="text-3xl font-black text-white tracking-tight">
            How it works
          </h3>
          <p className="text-sidebar-text font-medium text-lg leading-relaxed">
            Our documentation covers everything from basic page views to complex
            multi-step conversion funnels.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white font-black px-12 h-16 text-lg rounded-2xl shadow-2xl shadow-primary/20 relative z-10 transition-all duration-500 transform hover:-translate-y-2 active:scale-95">
          View SDK Docs
        </Button>
      </div>
    </div>
  );
}
