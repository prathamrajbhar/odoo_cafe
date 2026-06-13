"use client";

import React, { useState } from "react";
import Button from "@/components/shared/Button";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Session {
  id: string;
  openedAt: string;
  closedAt: string | null;
  closingSaleAmount: number | null;
  openedBy?: { name: string };
}

interface Props {
  lastSession: Session | null;
  activeSession: Session | null;
  onSessionChange?: () => void;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function fmtCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export const SessionControl: React.FC<Props> = ({ lastSession, activeSession, onSessionChange }) => {
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const handleOpenSession = async () => {
    setLoading(true);
    try {
      await api.post("/session/open");
      toast.success("Session opened");
      onSessionChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to open session");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async () => {
    if (!confirm("Close the current session? This will finalize all orders.")) return;
    setLoading(true);
    try {
      const res: any = await api.post("/session/close");
      setSummary(res.data?.summary);
      setShowSummary(true);
      toast.success("Session closed");
      onSessionChange?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to close session");
    } finally {
      setLoading(false);
    }
  };

  const isOpen = !!activeSession;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-available-border pb-5 mb-8">
        <h1 className="text-headline-lg text-primary font-bold">Terminal 1</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">Manage the POS terminal session for your shift.</p>
      </div>

      {/* Main session card */}
      <div className="bg-surface-container-lowest border border-available-border rounded-xl p-8 md:p-12 flex flex-col items-center gap-8 shadow-sm text-center">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isOpen ? "bg-[#E8F5E9] text-[#1B5E20]" : "bg-primary-container text-on-primary-container"}`}>
          <span className="material-symbols-outlined text-[40px]">point_of_sale</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-display-lg text-on-surface font-bold">Terminal 1</h2>
          <p className="text-body-lg text-on-surface-variant">Main Floor POS</p>
          {isOpen && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-label-md bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Session Active
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row gap-6 w-full border-t border-b border-outline-variant py-6">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Last Open Session</span>
            <span className="text-headline-sm text-on-surface font-semibold">
              {lastSession ? fmt(lastSession.openedAt) : "—"}
            </span>
          </div>
          <div className="hidden md:block w-px bg-outline-variant" />
          <div className="flex-1 flex flex-col items-center">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Last Closing Sale</span>
            <span className="text-headline-sm text-success font-semibold">
              {lastSession ? fmtCurrency(lastSession.closingSaleAmount) : "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        {!isOpen ? (
          <div className="flex flex-col items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenSession}
              isLoading={loading}
              leftIcon={<span className="material-symbols-outlined">play_arrow</span>}
              className="px-12 py-4 text-headline-md rounded-xl"
            >
              Open Session
            </Button>
            <p className="text-body-sm text-on-surface-variant max-w-sm">
              Opening a session will lock this terminal to the current user and initialize cash drawer tracking.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCloseSession}
                isLoading={loading}
                leftIcon={<span className="material-symbols-outlined">stop</span>}
                className="px-8 text-danger border-danger/40 hover:bg-error-container/20"
              >
                Close Session
              </Button>
            </div>
            {activeSession && (
              <p className="text-body-sm text-on-surface-variant">
                Opened {fmt(activeSession.openedAt)}
                {activeSession.openedBy && ` by ${activeSession.openedBy.name}`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Close summary panel */}
      {showSummary && summary && (
        <div className="mt-6 bg-surface-container-lowest border border-available-border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-headline-sm font-semibold text-on-surface">Session Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container p-4 rounded-lg text-center">
              <div className="text-headline-md font-bold text-primary">{summary.totalOrders ?? 0}</div>
              <div className="text-label-md text-on-surface-variant">Total Orders</div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg text-center">
              <div className="text-headline-md font-bold text-success">{fmtCurrency(summary.totalRevenue)}</div>
              <div className="text-label-md text-on-surface-variant">Revenue</div>
            </div>
            <div className="bg-surface-container p-4 rounded-lg text-center">
              <div className="text-headline-md font-bold text-on-surface">{summary.shiftDuration ?? "—"}</div>
              <div className="text-label-md text-on-surface-variant">Shift Duration</div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowSummary(false)} className="w-full">Dismiss</Button>
        </div>
      )}
    </div>
  );
};

export default SessionControl;
