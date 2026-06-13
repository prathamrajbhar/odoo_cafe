"use client";

import React, { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

type PromoType = "COUPON" | "PRODUCT_BASED" | "ORDER_BASED";
type DiscountType = "PERCENT" | "FIXED";

interface Promotion {
  id: string;
  name: string;
  promoType: PromoType;
  code: string | null;
  productId: string | null;
  minQty: number | null;
  minOrderAmount: number | null;
  discountValue: number;
  discountType: DiscountType;
  isActive: boolean;
  product?: { name: string } | null;
}

interface Props {
  promotions: Promotion[];
  products: { id: string; name: string }[];
  onRefresh: () => void;
}

const PROMO_TYPE_LABELS: Record<PromoType, string> = {
  COUPON: "Coupon",
  PRODUCT_BASED: "Product-based",
  ORDER_BASED: "Order-based",
};

const EMPTY_FORM = {
  name: "",
  promoType: "COUPON" as PromoType,
  code: "",
  productId: "",
  minQty: "",
  minOrderAmount: "",
  discountValue: "",
  discountType: "PERCENT" as DiscountType,
  isActive: true,
};

export const PromotionList: React.FC<Props> = ({ promotions, products, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      name: p.name,
      promoType: p.promoType,
      code: p.code ?? "",
      productId: p.productId ?? "",
      minQty: p.minQty != null ? String(p.minQty) : "",
      minOrderAmount: p.minOrderAmount != null ? String(p.minOrderAmount) : "",
      discountValue: String(p.discountValue),
      discountType: p.discountType,
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.discountValue) { toast.error("Discount value is required"); return; }

    setSaving(true);
    const payload: Record<string, any> = {
      name: form.name.trim(),
      promoType: form.promoType,
      discountValue: parseFloat(form.discountValue),
      discountType: form.discountType,
      isActive: form.isActive,
    };
    if (form.promoType === "COUPON") payload.code = form.code;
    if (form.promoType === "PRODUCT_BASED") {
      payload.productId = form.productId;
      payload.minQty = form.minQty ? parseInt(form.minQty) : null;
    }
    if (form.promoType === "ORDER_BASED") {
      payload.minOrderAmount = form.minOrderAmount ? parseFloat(form.minOrderAmount) : null;
    }

    try {
      if (editing) {
        await api.put(`/promotions/${editing.id}`, payload);
        toast.success("Promotion updated");
      } else {
        await api.post("/promotions", payload);
        toast.success("Promotion created");
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/promotions/${id}`);
      toast.success("Promotion deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const set = (key: keyof typeof EMPTY_FORM, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5 mb-6">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">Coupon & Promotion</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Configure automatic discounts and coupon codes for the POS.</p>
        </div>
        <Button
          variant="primary"
          onClick={openNew}
          leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          New Promotion
        </Button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto border border-available-border bg-surface-container-lowest rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-available-border">
              <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Name</th>
              <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Type</th>
              <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Discount</th>
              <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Status</th>
              <th className="px-6 py-4 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-available-border">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                  No promotions yet. Click "New Promotion" to add one.
                </td>
              </tr>
            ) : (
              promotions.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-body-md text-on-surface">{p.name}</td>
                  <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-on-surface text-label-md border border-outline-variant">
                      {PROMO_TYPE_LABELS[p.promoType]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-sm font-medium text-on-surface">
                    {p.discountType === "PERCENT" ? `${p.discountValue}%` : `₹${p.discountValue}`}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-md ${p.isActive
                          ? "bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]"
                          : "bg-surface-container-high text-on-surface-variant border border-outline-variant"
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-success" : "bg-outline"}`} />
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition-colors"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-danger rounded transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? "Edit Promotion" : "New Promotion"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving}>
              {editing ? "Save Changes" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Promotion Name"
            placeholder="e.g. Summer Sale"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />

          <Select
            label="Type"
            options={[
              { value: "COUPON", label: "Coupon" },
              { value: "PRODUCT_BASED", label: "Product-based" },
              { value: "ORDER_BASED", label: "Order-based" },
            ]}
            value={form.promoType}
            onChange={(e) => set("promoType", e.target.value as PromoType)}
          />

          {/* Coupon fields */}
          {form.promoType === "COUPON" && (
            <Input
              label="Coupon Code"
              placeholder="e.g. SUMMER20"
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
            />
          )}

          {/* Product-based fields */}
          {form.promoType === "PRODUCT_BASED" && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Product"
                options={products.map((p) => ({ value: p.id, label: p.name }))}
                value={form.productId}
                onChange={(e) => set("productId", e.target.value)}
                placeholder="Select product"
              />
              <Input
                label="Min Quantity"
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={form.minQty}
                onChange={(e) => set("minQty", e.target.value)}
              />
            </div>
          )}

          {/* Order-based fields */}
          {form.promoType === "ORDER_BASED" && (
            <Input
              label="Min Order Amount (₹)"
              type="number"
              step="0.01"
              placeholder="e.g. 500"
              value={form.minOrderAmount}
              onChange={(e) => set("minOrderAmount", e.target.value)}
            />
          )}

          {/* Discount */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Value"
              type="number"
              step="0.01"
              placeholder="e.g. 20"
              value={form.discountValue}
              onChange={(e) => set("discountValue", e.target.value)}
              required
            />
            <Select
              label="Discount Type"
              options={[
                { value: "PERCENT", label: "Percentage (%)" },
                { value: "FIXED", label: "Flat Amount (₹)" },
              ]}
              value={form.discountType}
              onChange={(e) => set("discountType", e.target.value as DiscountType)}
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-available-border">
            <div>
              <div className="text-label-md text-on-surface font-semibold">Active</div>
              <div className="text-body-sm text-on-surface-variant">Enable this promotion at the POS</div>
            </div>
            <button
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set("isActive", !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${form.isActive ? "bg-primary" : "bg-surface-container-highest"
                }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.isActive ? "translate-x-5" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PromotionList;
