"use client";

import React, { useState, useEffect, useCallback } from "react";
import SessionControl from "@/components/admin/SessionControl";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function SessionPage() {
  const [lastSession, setLastSession] = useState<any>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res: any = await api.get("/session/status");
      setLastSession(res.data?.lastSession ?? null);
      setActiveSession(res.data?.activeSession ?? null);
    } catch (err: any) {
      // Session status endpoint may not exist yet — degrade gracefully
      if ((err as any).status !== 404) {
        toast.error(err.message || "Failed to load session info");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <SessionControl
      lastSession={lastSession}
      activeSession={activeSession}
    />
  );
}
