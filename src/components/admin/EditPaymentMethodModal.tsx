"use client";

import React, { useState, useEffect, useRef } from "react";

interface PaymentMethod {
  id: string;
  name: string;
  type: "CASH" | "CARD" | "UPI";
  isActive: boolean;
  upiId: string | null;
}

interface Props {
  method: PaymentMethod | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmit: (id: string, data: { name?: string; upiId?: string | null }) => Promise<void>;
}

export default function EditPaymentMethodModal({
  method,
  open,
  onClose,
  onSaved,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; upiId?: string }>({});
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && method) {
      setName(method.name);
      setUpiId(method.upiId ?? "");
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open, method]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Name is required";
    if (
      method?.type === "UPI" &&
      upiId.trim() &&
      !upiId.includes("@")
    )
      e.upiId = "Enter a valid UPI ID (e.g. merchant@bank)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!method || !validate()) return;
    setSaving(true);
    try {
      const data: { name?: string; upiId?: string | null } = {
        name: name.trim(),
      };
      if (method.type === "UPI") {
        data.upiId = upiId.trim() || null;
      }
      await onSubmit(method.id, data);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !method) return null;

  const TYPE_LABELS = {
    CASH: "Cash",
    CARD: "Credit / Debit Card",
    UPI: "UPI / QR Payment",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl border border-available-border w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-available-border">
          <div>
            <h2 className="text-title-md font-semibold text-on-surface">
              Edit Payment Method
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Type:{" "}
              <span className="font-medium text-on-surface">
                {TYPE_LABELS[method.type]}
              </span>
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
              id="edit-pm-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              className={`w-full bg-surface border rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                errors.name
                  ? "border-error"
                  : "border-outline-variant focus:border-primary"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-error mt-1">{errors.name}</p>
            )}
          </div>

          {/* UPI ID (UPI only) */}
          {method.type === "UPI" && (
            <div>
              <label className="block text-label-md font-medium text-on-surface mb-1.5">
                UPI ID{" "}
                <span className="text-on-surface-variant/60 font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="text"
                id="edit-pm-upi-id"
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
                  Payments will be routed to this VPA.
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
              id="edit-pm-submit"
              disabled={saving}
              className="px-5 py-2 text-label-md font-semibold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
