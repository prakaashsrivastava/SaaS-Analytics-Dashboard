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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Terminal className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">
          Waiting for your first event...
        </h2>
        <p className="text-lg text-slate-500 font-medium leading-relaxed italic">
          Your project is created, but no data has been received yet. Use one of
          the methods below to start tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Method 1: JS Snippet */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <Code className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg font-black text-slate-900">
                Client-side Script
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-500 font-medium">
              Copy and paste this script tag into your website&apos;s{" "}
              <code>&lt;head&gt;</code> section.
            </p>
            <div className="relative group">
              <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
                {scriptSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white font-bold h-8"
                onClick={() => copyToClipboard(scriptSnippet, "script")}
              >
                {copied === "script" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Method 2: Server-side API */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <Terminal className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg font-black text-slate-900">
                Direct API Call
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-slate-500 font-medium">
              Send events directly from your server using a simple POST request.
            </p>
            <div className="relative group">
              <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
                {curlSnippet}
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white font-bold h-8"
                onClick={() => copyToClipboard(curlSnippet, "curl")}
              >
                {copied === "curl" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <h3 className="text-xl font-black text-white italic tracking-tight">
            Need help with custom events?
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            Check our{" "}
            <span className="text-indigo-400 underline underline-offset-4 cursor-pointer hover:text-indigo-300">
              documentation
            </span>{" "}
            for full API reference and tracking best practices.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 h-12 shadow-lg shadow-indigo-600/30 relative z-10 transition-all duration-300 transform hover:scale-105 active:scale-95">
          View SDK Docs
        </Button>
      </div>
    </div>
  );
}
