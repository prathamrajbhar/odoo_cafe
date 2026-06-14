"use client";

import React, { useState, useEffect, useRef } from "react";

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  _count?: { products: number };
}

interface Props {
  category: Category | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onSubmit: (id: string, data: { name: string; colorHex: string }) => Promise<void>;
}

export default function EditCategoryModal({
  category,
  open,
  onClose,
  onSaved,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#57344f");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const nameRef = useRef<HTMLInputElement>(null);

  const swatches = [
    { name: "Odoo Purple", hex: "#57344f" },
    { name: "Secondary Teal", hex: "#00696e" },
    { name: "Success Green", hex: "#28a745" },
    { name: "Warning Yellow", hex: "#ffc107" },
    { name: "Danger Red", hex: "#dc3545" },
    { name: "Dark Purple", hex: "#714b67" },
  ];

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setColorHex(category.colorHex);
      setError(undefined);
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [open, category]);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!category) return;
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(category.id, {
        name: name.trim(),
        colorHex: colorHex.trim(),
      });
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl border border-available-border w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-available-border bg-surface-container-lowest">
          <div>
            <h2 className="text-title-md font-bold text-on-surface">
              Edit Category
            </h2>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Modify details for <span className="font-semibold text-primary">{category.name}</span>
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
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-label-md font-semibold text-on-surface mb-1.5">
              Category Name <span className="text-error">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              id="edit-category-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(undefined);
              }}
              className={`w-full bg-surface border rounded-lg px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors ${
                error
                  ? "border-error"
                  : "border-outline-variant focus:border-primary"
              }`}
            />
            {error && (
              <p className="text-xs text-error mt-1">{error}</p>
            )}
          </div>

          {/* Color hex preview & swatch */}
          <div className="space-y-2.5">
            <label className="block text-label-md font-semibold text-on-surface">
              Accent Color
            </label>
            
            <div className="flex gap-2.5 items-center">
              <div
                className="h-10 w-10 rounded-lg border border-available-border flex-shrink-0 shadow-sm transition-colors duration-200"
                style={{ backgroundColor: colorHex }}
              />
              <input
                type="text"
                placeholder="#57344f"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-body-md font-mono text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors"
                required
              />
            </div>

            {/* Quick Swatches */}
            <div className="pt-2">
              <span className="text-xs text-on-surface-variant/70 font-semibold block mb-2">
                Quick select:
              </span>
              <div className="flex gap-2.5">
                {swatches.map((swatch) => {
                  const isSelected = colorHex.toLowerCase() === swatch.hex.toLowerCase();
                  return (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setColorHex(swatch.hex)}
                      title={swatch.name}
                      className={`h-7 w-7 rounded-full transition-all cursor-pointer hover:scale-110 active:scale-95 border ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-outline-variant hover:border-on-surface"
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-3 border-t border-available-border">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-label-md font-bold text-on-surface border border-available-border rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-label-md font-bold bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
