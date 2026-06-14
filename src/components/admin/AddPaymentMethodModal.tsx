"use client";

import React, { useState, useEffect, useRef } from "react";

type PaymentType = "CASH" | "CARD" | "UPI";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onSubmit: (data: {
    name: string;
    type: PaymentType;
    upiId?: string | null;
  }) => Promise<void>;
}

export default function AddPaymentMethodModal({
  open,
  onClose,
  onCreated,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PaymentType>("CASH");
  const [upiId, setUpiId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; upiId?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setType("CASH");
      setUpiId("");
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (type === "UPI" && upiId && !upiId.includes("@"))
      e.upiId = "Enter a valid UPI ID (e.g. merchant@bank)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        upiId: type === "UPI" ? (upiId.trim() || null) : null,
      });
      onCreated();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl border border-available-border w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-available-border">
          <div>
            <h2 className="text-title-md font-semibold text-on-surface">
              New Payment Method
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Add a payment option to your POS terminal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Close"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-label-md font-medium text-on-surface mb-1.5">
              Name <span className="text-error">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              id="pm-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="e.g. Cash Drawer, Store UPI QR"
              className={`w-full bg-surface border rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                errors.name ? "border-error" : "border-outline-variant focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-label-md font-medium text-on-surface mb-1.5">
              Type
            </label>
            <div className="relative">
              <select
                id="pm-type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as PaymentType);
                  setErrors((p) => ({ ...p, upiId: undefined }));
                }}
                className="w-full appearance-none bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors pr-10"
              >
                <option value="CASH">CASH — Cash Drawer</option>
                <option value="CARD">CARD — Credit / Debit Card</option>
                <option value="UPI">UPI — UPI / QR Payment</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-3 text-on-surface-variant/60">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>

          {/* UPI ID (conditional) */}
          {type === "UPI" && (
            <div>
              <label className="block text-label-md font-medium text-on-surface mb-1.5">
                UPI ID{" "}
                <span className="text-on-surface-variant/60 font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                id="pm-upi-id"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  if (errors.upiId)
                    setErrors((p) => ({ ...p, upiId: undefined }));
                }}
                placeholder="e.g. merchant@hdfcbank"
                className={`w-full bg-surface border rounded-lg px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                  errors.upiId
                    ? "border-error"
                    : "border-outline-variant focus:border-primary"
                }`}
              />
              {errors.upiId ? (
                <p className="text-xs text-error mt-1">{errors.upiId}</p>
              ) : (
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Can be set or changed later.
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-label-md font-semibold text-on-surface border border-available-border rounded-lg hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="pm-submit"
              disabled={saving}
              className="px-5 py-2 text-label-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create Method"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
