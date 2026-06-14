"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export interface PaymentMethod {
  id: string;
  name: string;
  type: "CASH" | "CARD" | "UPI";
  isActive: boolean;
  upiId: string | null;
}

interface Props {
  methods: PaymentMethod[];
  onToggle: (method: PaymentMethod) => Promise<void>;
  onEdit: (method: PaymentMethod) => void;
  onDelete: (method: PaymentMethod) => void;
  onSaveUpi: (
    method: PaymentMethod,
    upiId: string | null,
    merchantName: string
  ) => Promise<void>;
}

const TYPE_PILL: Record<string, { label: string; bg: string; text: string }> = {
  CASH: { label: "CASH", bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  CARD: { label: "CARD", bg: "bg-surface-container-high", text: "text-on-surface-variant" },
  UPI:  { label: "UPI",  bg: "bg-surface-container-high", text: "text-on-surface-variant" },
};

export default function PaymentMethodList({
  methods,
  onToggle,
  onEdit,
  onDelete,
  onSaveUpi,
}: Props) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [expandedUpi, setExpandedUpi] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Per-UPI-row local state keyed by method id
  const [upiInputs, setUpiInputs] = useState<
    Record<string, { upiId: string; merchantName: string; saving: boolean }>
  >({});

  const getUpiInput = (method: PaymentMethod) =>
    upiInputs[method.id] ?? {
      upiId: method.upiId ?? "",
      merchantName: "Odoo Cafe",
      saving: false,
    };

  const setUpiField = (
    id: string,
    field: "upiId" | "merchantName" | "saving",
    value: string | boolean
  ) =>
    setUpiInputs((prev) => ({
      ...prev,
      [id]: { ...getUpiInput({ id } as PaymentMethod), [field]: value },
    }));

  const handleToggle = async (method: PaymentMethod) => {
    setToggling(method.id);
    try {
      await onToggle(method);
    } finally {
      setToggling(null);
    }
  };

  const handleSaveUpi = async (method: PaymentMethod) => {
    const input = getUpiInput(method);
    setUpiField(method.id, "saving", true);
    try {
      await onSaveUpi(method, input.upiId.trim() || null, input.merchantName);
    } finally {
      setUpiField(method.id, "saving", false);
    }
  };

  if (!methods.length) {
    return (
      <div className="bg-surface-container-lowest border border-available-border rounded-xl px-6 py-16 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant/50">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
        </div>
        <p className="text-body-sm text-on-surface-variant/70 italic">
          No payment methods yet. Click <strong className="font-semibold not-italic">+ New</strong> to add one.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-surface-container-low border-b border-available-border">
          <tr>
            {["NAME", "TYPE", "DETAILS", "STATUS", "ACTIONS"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-available-border">
          {methods.map((method) => {
            const pill = TYPE_PILL[method.type];
            const isUpi = method.type === "UPI";
            const isExpanded = expandedUpi === method.id;
            const isTogglingThis = toggling === method.id;
            const isConfirmingDelete = deleteConfirm === method.id;
            const upiInput = getUpiInput(method);

            return (
              <React.Fragment key={method.id}>
                {/* ── Main row ── */}
                <tr className="hover:bg-surface-container-low/40 transition-colors">
                  {/* NAME */}
                  <td className="px-5 py-4 text-body-sm font-medium text-on-surface">
                    {method.name}
                  </td>

                  {/* TYPE */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold tracking-wide border border-outline-variant/50 ${pill.bg} ${pill.text}`}>
                      {pill.label}
                    </span>
                  </td>

                  {/* DETAILS */}
                  <td className="px-5 py-4 text-body-sm text-on-surface-variant">
                    {isUpi && method.upiId ? (
                      <span className="font-mono text-xs bg-surface-container px-2 py-0.5 rounded">
                        {method.upiId}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant/40">—</span>
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    <button
                      role="switch"
                      aria-checked={method.isActive}
                      aria-label={`Toggle ${method.name}`}
                      onClick={() => handleToggle(method)}
                      disabled={isTogglingThis}
                      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 ${
                        method.isActive ? "bg-[#2E7D32]" : "bg-surface-container-highest"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                          method.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {/* UPI expand/collapse chevron */}
                      {isUpi && (
                        <button
                          type="button"
                          onClick={() => setExpandedUpi(isExpanded ? null : method.id)}
                          className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors"
                          title={isExpanded ? "Collapse" : "Configure UPI"}
                          aria-expanded={isExpanded}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points={isExpanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                          </svg>
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(method)}
                        className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-colors"
                        title="Edit"
                        aria-label={`Edit ${method.name}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1 ml-1">
                          <span className="text-xs text-error font-medium">Sure?</span>
                          <button
                            type="button"
                            onClick={() => { setDeleteConfirm(null); onDelete(method); }}
                            className="px-2 py-0.5 text-xs font-semibold bg-error text-on-error rounded hover:opacity-90 transition-opacity"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-0.5 text-xs font-semibold border border-available-border rounded hover:bg-surface-container transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(method.id)}
                          className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-error hover:bg-error-container/30 transition-colors"
                          title="Delete"
                          aria-label={`Delete ${method.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>

                {/* ── UPI inline expand panel ── */}
                {isUpi && isExpanded && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 bg-surface-container-low/50 border-t border-available-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
                        {/* Left: inputs */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-label-md text-on-surface font-medium mb-1.5">
                              Merchant UPI ID
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={upiInput.upiId}
                                onChange={(e) => setUpiField(method.id, "upiId", e.target.value)}
                                placeholder="e.g. merchant@bank"
                                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-10"
                              />
                              {upiInput.upiId && (
                                <span className="absolute right-3 top-2.5 text-[#2E7D32]">
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                </span>
                              )}
                            </div>
                            <p className="text-body-sm text-on-surface-variant mt-1">
                              Payments will be routed to this VPA.
                            </p>
                          </div>

                          <div>
                            <label className="block text-label-md text-on-surface font-medium mb-1.5">
                              Merchant Name
                            </label>
                            <input
                              type="text"
                              value={upiInput.merchantName}
                              onChange={(e) => setUpiField(method.id, "merchantName", e.target.value)}
                              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                            />
                          </div>

                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => handleSaveUpi(method)}
                              disabled={upiInput.saving}
                              className="bg-primary text-on-primary text-label-md font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {upiInput.saving ? "Saving…" : "Save Changes"}
                            </button>
                            <button
                              type="button"
                              className="border border-available-border text-on-surface text-label-md font-semibold px-4 py-2 rounded-lg hover:bg-surface-container transition-colors"
                            >
                              Test Connection
                            </button>
                          </div>
                        </div>

                        {/* Right: QR preview (no amount) */}
                        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant">
                          <h4 className="text-label-lg font-semibold text-on-surface mb-4 pb-3 border-b border-outline-variant">
                            Live Customer Preview
                          </h4>
                          <div className="flex justify-center">
                            <div className="bg-white rounded-2xl shadow-sm border border-available-border p-5 flex flex-col items-center w-[200px]">
                              {upiInput.upiId ? (
                                <QRCodeSVG
                                  value={`upi://pay?pa=${encodeURIComponent(upiInput.upiId)}&pn=${encodeURIComponent(upiInput.merchantName || "Odoo Cafe")}&cu=INR`}
                                  size={120}
                                  bgColor="#ffffff"
                                  fgColor="#1a1a1a"
                                  level="M"
                                  className="mb-3"
                                />
                              ) : (
                                <div className="w-[120px] h-[120px] mb-3 flex items-center justify-center border-2 border-dashed border-outline-variant rounded-lg">
                                  <span className="text-xs text-on-surface-variant/50 text-center px-2">
                                    Enter UPI ID to generate QR
                                  </span>
                                </div>
                              )}
                              <div className="text-center">
                                <div className="text-xs text-on-surface-variant">
                                  Scan to pay {upiInput.merchantName || "Odoo Cafe"}
                                </div>
                                <div className="text-xs text-primary bg-primary/10 rounded px-2 py-0.5 mt-2 font-mono inline-block max-w-full truncate">
                                  {upiInput.upiId || "—"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
