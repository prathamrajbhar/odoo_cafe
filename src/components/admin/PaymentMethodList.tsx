"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface PaymentMethod {
  id: string;
  type: "CASH" | "CARD" | "UPI";
  isActive: boolean;
  upiId: string | null;
}

interface Props {
  methods: PaymentMethod[];
  onRefresh: () => void;
}

const METHOD_META = {
  CASH: { icon: "payments", label: "Cash", description: "Standard cash drawer. Requires manual till counting." },
  CARD: { icon: "credit_card", label: "Credit / Debit Card", description: "Card terminal integration. Supports tap, chip, and swipe." },
  UPI: { icon: "qr_code_scanner", label: "UPI / QR Payment", description: "Dynamic QR code generation for customer screens." },
};

export const PaymentMethodList: React.FC<Props> = ({ methods, onRefresh }) => {
  const [toggling, setToggling] = useState<string | null>(null);
  const [upiEdits, setUpiEdits] = useState<Record<string, string>>({});
  const [savingUpi, setSavingUpi] = useState<string | null>(null);

  const handleToggle = async (method: PaymentMethod) => {
    setToggling(method.id);
    try {
      await api.patch(`/payment-methods/${method.id}`, { isActive: !method.isActive });
      toast.success(`${METHOD_META[method.type].label} ${method.isActive ? "deactivated" : "activated"}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update payment method");
    } finally {
      setToggling(null);
    }
  };

  const handleSaveUpi = async (method: PaymentMethod) => {
    const upiId = upiEdits[method.id] ?? method.upiId ?? "";
    setSavingUpi(method.id);
    try {
      await api.patch(`/payment-methods/${method.id}`, { upiId });
      toast.success("UPI ID saved");
      setUpiEdits((prev) => { const next = { ...prev }; delete next[method.id]; return next; });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save UPI ID");
    } finally {
      setSavingUpi(null);
    }
  };

  return (
    <div className="space-y-4">
      {methods.map((method) => {
        const meta = METHOD_META[method.type];
        const isUpi = method.type === "UPI";
        const isToggling = toggling === method.id;
        const upiValue = method.id in upiEdits ? upiEdits[method.id] : (method.upiId ?? "");
        const upiDirty = method.id in upiEdits;

        return (
          <div
            key={method.id}
            className={`bg-surface-container-lowest border rounded-xl shadow-sm overflow-hidden transition-all ${
              method.isActive && isUpi ? "border-2 border-primary" : "border-available-border"
            }`}
          >
            {/* Active indicator stripe */}
            <div
              className={`absolute w-1 h-full rounded-l-xl ${method.isActive ? "bg-success" : "bg-outline-variant"}`}
              style={{ position: "relative", display: "none" }}
            />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                {/* Left: icon + info */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isUpi && method.isActive ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{meta.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-headline-sm font-semibold text-on-surface">{meta.label}</h3>
                    <p className="text-body-sm text-on-surface-variant mt-0.5">{meta.description}</p>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md ${
                          method.isActive
                            ? "bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]"
                            : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${method.isActive ? "bg-success" : "bg-outline"}`}
                        />
                        {method.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-label-md text-on-surface-variant">Activate</span>
                  <button
                    role="switch"
                    aria-checked={method.isActive}
                    onClick={() => handleToggle(method)}
                    disabled={isToggling}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 ${
                      method.isActive ? "bg-primary" : "bg-surface-container-highest"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        method.isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* UPI expanded section */}
              {isUpi && method.isActive && (
                <div className="mt-6 pt-6 border-t border-available-border grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-label-md text-on-surface-variant mb-1.5">
                        Merchant UPI ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiValue}
                          onChange={(e) => setUpiEdits((prev) => ({ ...prev, [method.id]: e.target.value }))}
                          placeholder="e.g. merchant@bank"
                          className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                        />
                        {upiValue && !upiDirty && (
                          <span className="absolute right-3 top-2.5 material-symbols-outlined text-success text-[20px]">
                            check_circle
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-1">Payments will be routed to this VPA.</p>
                    </div>
                    {upiDirty && (
                      <button
                        onClick={() => handleSaveUpi(method)}
                        disabled={savingUpi === method.id}
                        className="bg-primary hover:opacity-90 text-on-primary text-label-md px-4 py-2 rounded-lg transition-opacity disabled:opacity-50"
                      >
                        {savingUpi === method.id ? "Saving..." : "Save UPI ID"}
                      </button>
                    )}
                  </div>

                  {/* QR preview */}
                  <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant flex flex-col items-center">
                    <h4 className="text-label-lg text-on-surface mb-4 self-start w-full border-b border-outline-variant pb-2">
                      Live Customer Preview
                    </h4>
                    <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-available-border flex flex-col items-center max-w-[200px] w-full">
                      {/* Simulated QR pattern */}
                      <div className="w-32 h-32 bg-surface-container rounded-lg border border-outline-variant mb-3 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40">qr_code</span>
                      </div>
                      <div className="text-center">
                        <div className="text-headline-sm font-bold text-on-surface">₹ 0.00</div>
                        <div className="text-body-sm text-on-surface-variant mt-0.5">Scan to pay</div>
                        <div className="text-mono-label text-primary mt-2 bg-primary-fixed rounded py-0.5 px-2 inline-block">
                          {upiValue || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentMethodList;
