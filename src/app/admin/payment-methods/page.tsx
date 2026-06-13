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
      setMethods(res.data?.paymentMethods ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  return (
    <div className="space-y-6">
      <div className="border-b border-available-border pb-5">
        <h1 className="text-headline-lg text-primary font-bold">Payment Methods</h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Configure and activate accepted payment types for the POS terminal.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="bg-surface-container-lowest border border-available-border rounded-xl p-12 text-center">
          <p className="text-body-sm text-on-surface-variant italic">
            No payment methods found. Seed the database to initialize Cash, Card, and UPI.
          </p>
        </div>
      ) : (
        <PaymentMethodList methods={methods} onRefresh={fetchMethods} />
      )}
    </div>
  );
}
