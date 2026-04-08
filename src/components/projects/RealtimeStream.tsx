"use client";

import React, { useEffect, useState } from "react";
import {
  Zap,
  Clock,
  Activity,
  Layout,
  UserPlus,
  ShoppingCart,
  MousePointer2,
  ChevronRight,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { RealtimeEvent, RealtimeStreamProps } from "@/types";

const getEventIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("page_view") || t.includes("view")) return Layout;
  if (t.includes("signup") || t.includes("register")) return UserPlus;
  if (t.includes("purchase") || t.includes("order") || t.includes("sale"))
    return ShoppingCart;
  if (t.includes("click")) return MousePointer2;
  if (t.includes("conversion")) return TrendingUp;
  if (t.includes("revenue") || t.includes("payment")) return CreditCard;
  return Activity;
};

const getEventColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("signup") || t.includes("register"))
    return "bg-green-100 text-green-600 border-green-200";
  if (t.includes("purchase") || t.includes("revenue"))
    return "bg-amber-100 text-amber-600 border-amber-200";
  if (t.includes("click")) return "bg-blue-100 text-blue-600 border-blue-200";
  if (t.includes("error") || t.includes("fail"))
    return "bg-red-100 text-red-600 border-red-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
};

export function RealtimeStream({ projectId }: RealtimeStreamProps) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/analytics/${projectId}/realtime`);
        if (response.ok) {
          const data = await response.json();
          setEvents((prev) => {
            if (
              prev.length > 0 &&
              data.length > 0 &&
              data[0].id !== prev[0].id
            ) {
              setHasNew(true);
              setTimeout(() => setHasNew(false), 2000);
            }
            return data;
          });
          setLastCount(data.length);
        }
      } catch (error) {
        console.error("Realtime fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 4000); // Poll every 4 seconds

    return () => clearInterval(interval);
  }, [projectId]);

  if (isLoading && lastCount === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-24 bg-white/50 animate-pulse rounded-3xl border border-slate-100 shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-white border-dashed border-slate-200 rounded-3xl p-12 text-center shadow-sm">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
            <Zap className="w-8 h-8" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Waiting for incoming events...
          </p>
          <p className="text-slate-400 text-sm max-w-xs">
            No tracked activity detected in the last hour. Start your tracker to
            see live data here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 relative">
      {hasNew && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
            <Zap className="w-3 h-3 fill-white" />
            New Event Detected
          </div>
        </div>
      )}

      {events.map((event, index) => {
        const Icon = getEventIcon(event.eventType);
        const colorClass = getEventColor(event.eventType);

        return (
          <Card
            key={event.id}
            className={cn(
              "group bg-white hover:border-indigo-300 transition-all duration-500 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5",
              index === 0 &&
                "ring-2 ring-indigo-500 ring-offset-4 ring-offset-slate-50/20"
            )}
          >
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row items-stretch">
                {/* Event Type Icon */}
                <div
                  className={cn(
                    "w-full md:w-20 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-50 shrink-0 transition-colors group-hover:bg-slate-50/50",
                    colorClass.split(" ")[0] // Extract bg- color
                  )}
                >
                  <Icon className={cn("w-7 h-7", colorClass.split(" ")[1])} />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                          {event.eventType.replace(/_/g, " ")}
                        </h3>
                        {Number(event.revenue) > 0 && (
                          <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-emerald-500/20">
                            +₹{event.revenue}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Event ID: {event.id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold leading-none">
                        {formatDistanceToNow(new Date(event.occurredAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Properties / Metadata */}
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(event.properties || {})
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-2 bg-slate-50/50 px-3 py-1.5 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-500"
                        >
                          <span className="uppercase tracking-widest text-slate-300">
                            {key}:
                          </span>
                          <span className="text-slate-700 truncate max-w-[120px]">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    {Object.keys(event.properties || {}).length > 4 && (
                      <div className="flex items-center gap-1 text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-2">
                        +{Object.keys(event.properties || {}).length - 4} more
                        attributes
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Action / Details */}
                <div className="hidden md:flex flex-col items-center justify-center w-16 bg-slate-50/30 group-hover:bg-slate-50 transition-colors border-l border-slate-50">
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
