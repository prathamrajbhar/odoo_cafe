"use client";

import React, { useState, useEffect, useCallback } from "react";
import PaymentMethodList, {
  type PaymentMethod,
} from "@/components/admin/PaymentMethodList";
import AddPaymentMethodModal from "@/components/admin/AddPaymentMethodModal";
import EditPaymentMethodModal from "@/components/admin/EditPaymentMethodModal";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);

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

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  /* ── CREATE ─────────────────────────────────────────────── */
  const handleCreate = async (data: {
    name: string;
    type: "CASH" | "CARD" | "UPI";
    upiId?: string | null;
  }) => {
    await api.post("/payment-methods", data);
    toast.success("Payment method created");
    fetchMethods();
  };

  /* ── TOGGLE ACTIVE ──────────────────────────────────────── */
  const handleToggle = async (method: PaymentMethod) => {
    try {
      await api.put(`/payment-methods/${method.id}`, {
        isActive: !method.isActive,
      });
      toast.success(
        `${method.name} ${method.isActive ? "deactivated" : "activated"}`
      );
      fetchMethods();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  /* ── EDIT ───────────────────────────────────────────────── */
  const handleEditSubmit = async (
    id: string,
    data: { name?: string; upiId?: string | null }
  ) => {
    await api.put(`/payment-methods/${id}`, data);
    toast.success("Payment method updated");
    fetchMethods();
  };

  /* ── SAVE UPI ───────────────────────────────────────────── */
  const handleSaveUpi = async (
    method: PaymentMethod,
    upiId: string | null,
    _merchantName: string
  ) => {
    try {
      await api.put(`/payment-methods/${method.id}`, { upiId });
      toast.success("UPI settings saved");
      fetchMethods();
    } catch (err: any) {
      toast.error(err.message || "Failed to save UPI settings");
    }
  };

  /* ── DELETE ─────────────────────────────────────────────── */
  const handleDelete = async (method: PaymentMethod) => {
    try {
      await api.delete(`/payment-methods/${method.id}`);
      toast.success(`${method.name} deleted`);
      fetchMethods();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5">
          <div>
            <h1 className="text-headline-lg text-primary font-bold">
              Payment Methods
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Configure payment options for TableTap POS.
            </p>
          </div>
          <button
            id="add-payment-method-btn"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-primary text-on-primary text-label-md font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-surface-container-high rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <PaymentMethodList
            methods={methods}
            onToggle={handleToggle}
            onEdit={(m) => setEditTarget(m)}
            onDelete={handleDelete}
            onSaveUpi={handleSaveUpi}
          />
        )}
      </div>

      {/* Add Modal */}
      <AddPaymentMethodModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={fetchMethods}
        onSubmit={handleCreate}
      />

      {/* Edit Modal */}
      <EditPaymentMethodModal
        method={editTarget}
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onSaved={fetchMethods}
        onSubmit={handleEditSubmit}
      />
    </>
  );
}
