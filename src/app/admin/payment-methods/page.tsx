"use client";

import React, { useState, useEffect, useCallback } from "react";
import PaymentMethodList from "@/components/admin/PaymentMethodList";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMethods = useCallback(async () => {
    try {
      const res: any = await api.get("/payment-methods");
      setMethods(res.data?.methods ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">Payment Methods</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure and activate accepted payment types for the POS terminal.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Method
        </button>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_268px] gap-6 items-start">
        {/* Left: method cards */}
        <div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <PaymentMethodList methods={methods} onRefresh={fetchMethods} />
          )}
        </div>

        {/* Right: info panel */}
        <aside className="bg-surface-container-lowest border border-available-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-label-md font-semibold">Payment Routing</span>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            All active payment methods will appear on the POS terminal during checkout. Ensure your journal entries are properly configured in Accounting to avoid reconciliation errors.
          </p>
          <button className="text-label-md text-secondary font-semibold hover:underline flex items-center gap-1 mt-1">
            Accounting Settings
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </aside>
      </div>
    </div>
  );
}
