"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
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
  CASH: {
    label: "Cash",
    description: "Standard cash drawer integration. Requires manual till counting.",
    detail: "Journal: CSJ",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  CARD: {
    label: "Credit / Debit Card",
    description: "Stripe Terminal integration. Supports tap, chip, and swipe.",
    detail: "Terminal ID: STR-982",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  UPI: {
    label: "UPI / QR Payment",
    description: "Dynamic QR code generation for customer screens.",
    detail: null,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h3v3M17 17h3v3M14 20h3" />
      </svg>
    ),
  },
};

export const PaymentMethodList: React.FC<Props> = ({ methods, onRefresh }) => {
  const [toggling, setToggling] = useState<string | null>(null);
  const [upiId, setUpiId] = useState("");
  const [merchantName, setMerchantName] = useState("Odoo Cafe Downtown");
  const [customerDisplay, setCustomerDisplay] = useState("Screen 2 (Facing Customer)");
  const [savingUpi, setSavingUpi] = useState(false);

  const handleToggle = async (method: PaymentMethod) => {
    setToggling(method.id);
    try {
      await api.put(`/payment-methods/${method.id}`, { isActive: !method.isActive });
      toast.success(`${METHOD_META[method.type].label} ${method.isActive ? "deactivated" : "activated"}`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setToggling(null);
    }
  };

  const handleSaveUpi = async (method: PaymentMethod) => {
    setSavingUpi(true);
    try {
      await api.put(`/payment-methods/${method.id}`, { upiId });
      toast.success("UPI settings saved");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSavingUpi(false);
    }
  };

  // Sync upiId from loaded data on first render
  React.useEffect(() => {
    const upi = methods.find((m) => m.type === "UPI");
    if (upi?.upiId) setUpiId(upi.upiId);
  }, [methods]);

  return (
    <div className="space-y-4">
      {methods.map((method) => {
        const meta = METHOD_META[method.type];
        const isUpi = method.type === "UPI";
        const isToggling = toggling === method.id;

        return (
          <div
            key={method.id}
            className={`bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border transition-all ${
              isUpi && method.isActive ? "border-primary border-2" : "border-available-border"
            }`}
          >
            <div className="px-6 py-5">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
                  {meta.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-body-lg font-semibold text-on-surface">{meta.label}</div>
                  <div className="text-body-sm text-on-surface-variant mt-0.5">{meta.description}</div>
                  <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-medium border ${
                        method.isActive
                          ? "bg-[#E8F5E9] text-[#1B5E20] border-[#C8E6C9]"
                          : "bg-surface-container text-on-surface-variant border-outline-variant"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${method.isActive ? "bg-[#2E7D32]" : "bg-outline"}`} />
                      {method.isActive ? "Active" : "Inactive"}
                    </span>
                    {meta.detail && (
                      <span className="text-label-sm text-on-surface-variant">{meta.detail}</span>
                    )}
                  </div>
                </div>

                {/* Right: toggle + edit */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-label-md text-on-surface-variant hidden sm:inline">Activate</span>
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
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors"
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* UPI expanded section */}
              {isUpi && method.isActive && (
                <div className="mt-6 pt-6 border-t border-available-border grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Fields */}
                  <div className="space-y-4">
                    {/* UPI ID */}
                    <div>
                      <label className="block text-label-md text-on-surface font-medium mb-1.5">
                        Merchant UPI ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. merchant@bank"
                          className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                        />
                        {upiId && (
                          <span className="absolute right-3 top-2.5 text-[#2E7D32]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-1">Payments will be routed to this VPA.</p>
                    </div>

                    {/* Merchant Name */}
                    <div>
                      <label className="block text-label-md text-on-surface font-medium mb-1.5">
                        Merchant Name
                      </label>
                      <input
                        type="text"
                        value={merchantName}
                        onChange={(e) => setMerchantName(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>

                    {/* Customer Display */}
                    <div>
                      <label className="block text-label-md text-on-surface font-medium mb-1.5">
                        Customer Display
                      </label>
                      <div className="relative">
                        <select
                          value={customerDisplay}
                          onChange={(e) => setCustomerDisplay(e.target.value)}
                          className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                        >
                          <option>Screen 2 (Facing Customer)</option>
                          <option>Screen 1 (Cashier)</option>
                          <option>None</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-2.5 text-on-surface-variant/60">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleSaveUpi(method)}
                        disabled={savingUpi}
                        className="bg-primary text-on-primary text-label-md font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {savingUpi ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        className="border border-available-border text-on-surface text-label-md font-semibold px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
                      >
                        Test Connection
                      </button>
                    </div>
                  </div>

                  {/* QR preview */}
                  <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant">
                    <h4 className="text-label-lg font-semibold text-on-surface mb-4 pb-3 border-b border-outline-variant">
                      Live Customer Preview
                    </h4>
                    <div className="flex justify-center">
                      <div className="bg-white rounded-2xl shadow-sm border border-available-border p-5 flex flex-col items-center w-[200px]">
                        {upiId ? (
                          <QRCodeSVG
                            value={`upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName || "Odoo Cafe")}&cu=INR`}
                            size={120}
                            bgColor="#ffffff"
                            fgColor="#1a1a1a"
                            level="M"
                            className="mb-3"
                          />
                        ) : (
                          <div className="w-[120px] h-[120px] mb-3 flex items-center justify-center border-2 border-dashed border-outline-variant rounded-lg">
                            <span className="text-xs text-on-surface-variant/50 text-center px-2">Enter UPI ID to generate QR</span>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-lg font-bold text-on-surface">₹ 0.00</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">
                            Scan to pay {merchantName || "Odoo Cafe"}
                          </div>
                          <div className="text-xs text-primary bg-primary/10 rounded px-2 py-0.5 mt-2 font-mono inline-block">
                            {upiId || "—"}
                          </div>
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
