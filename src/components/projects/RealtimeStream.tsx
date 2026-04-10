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
    return "bg-success-tint text-success-text border-success/30";
  if (t.includes("purchase") || t.includes("revenue"))
    return "bg-warning-tint text-warning-text border-warning/30";
  if (t.includes("click"))
    return "bg-primary-tint text-primary border-primary-light/30";
  if (t.includes("error") || t.includes("fail"))
    return "bg-danger-tint text-danger-text border-danger/30";
  return "bg-surface-raised text-text-secondary border-border";
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
            className="h-24 bg-surface-raised/50 animate-pulse rounded-3xl border border-border shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="bg-surface border-dashed border-border rounded-3xl p-12 text-center shadow-card">
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-surface-raised rounded-2xl flex items-center justify-center text-text-muted">
            <Zap className="w-8 h-8" />
          </div>
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">
            Waiting for incoming events...
          </p>
          <p className="text-text-muted text-sm max-w-xs">
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
        <div className="fixed top-24 left-[calc(50%+120px)] -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-primary text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-card flex items-center gap-2">
            <Zap className="w-3 h-3 fill-white" />
            New Event Detected
          </div>
        </div>
      )}

      {events.map((event, index) => {
        const Icon = getEventIcon(event.eventType);
        const colorClass = getEventColor(event.eventType);
        const { session_id, ...otherProps } = event.properties || {};

        return (
          <Card
            key={event.id}
            className={cn(
              "group bg-surface hover:border-primary-light transition-all duration-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-card",
              index === 0 &&
                "ring-1 ring-primary ring-offset-2 ring-offset-surface-raised/10"
            )}
          >
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-4">
                {/* Compact Icon */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-300 border-b-2 border-r border-border/10",
                    colorClass.split(" ")[0] || "bg-surface-raised",
                    colorClass.split(" ")[1] || "text-text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Info Area */}
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight truncate group-hover:text-primary transition-colors">
                        {event.eventType.replace(/_/g, " ")}
                      </h3>
                      {Number(event.revenue) > 0 && (
                        <span className="shrink-0 px-2 py-0.5 bg-success/10 text-success text-[9px] font-black uppercase rounded-lg border border-success/20">
                          +₹{event.revenue}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 content-start">
                      {/* Event ID */}
                      <span className="text-[10px] font-bold text-text-muted border-r border-border pr-2.5">
                        EVENT ID: {event.id}
                      </span>

                      {/* Highly Visible Session ID */}
                      {session_id && (
                        <div className="flex items-center gap-1.5 bg-primary-subtle px-2 py-0.5 rounded-lg border border-primary/10">
                          <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest whitespace-nowrap">
                            SESSION ID:
                          </span>
                          <span className="text-[10px] font-black text-primary truncate max-w-[80px] sm:max-w-[100px]">
                            {String(session_id)}
                          </span>
                        </div>
                      )}

                      {/* Other Props */}
                      <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                        {Object.entries(otherProps)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-1 text-[10px] font-medium text-text-secondary"
                            >
                              <span className="text-text-muted lowercase">
                                {key}:
                              </span>
                              <span className="text-text-primary truncate max-w-[60px] sm:max-w-[80px]">
                                {String(value)}
                              </span>
                            </div>
                          ))}

                        {Object.keys(otherProps).length > 3 && (
                          <span className="text-[9px] font-black text-text-muted/60 uppercase pl-1">
                            +{Object.keys(otherProps).length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Responsive Time Badge */}
                  <div className="shrink-0 self-start sm:self-center flex items-center gap-1.5 text-text-muted bg-surface-raised px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border shadow-sm">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.occurredAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
