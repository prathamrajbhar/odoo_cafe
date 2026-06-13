"use client";

import React, { useState, useRef } from "react";
import { usePOS, AppliedPromo } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";

interface ValidateResponse {
  data: {
    appliedPromos: AppliedPromo[];
    discountAmount: number;
  };
}

export const DiscountPopup: React.FC = () => {
  const {
    activeModal, setActiveModal,
    cartLines, subtotal,
    couponCode, setCouponCode,
    appliedPromos, setAppliedPromos,
  } = usePOS();

  const [codeInput, setCodeInput] = useState("");
  const [validating, setValidating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeModal === "discount";

  const handleValidate = async () => {
    const code = codeInput.trim();
    if (!code) { toast.error("Enter a coupon code"); return; }

    setValidating(true);
    try {
      const res = await api.post<ValidateResponse>("/promotions/validate", {
        code,
        subtotal,
        lines: cartLines.map((l) => ({ productId: l.productId, qty: l.qty })),
      });
      const { appliedPromos: promos, discountAmount } = res.data;
      setAppliedPromos(promos, discountAmount);
      setCouponCode(code);
      toast.success("Coupon applied");
      setCodeInput("");
      setActiveModal(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid coupon code");
    } finally {
      setValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(null);
    // Re-evaluate without coupon — keep auto promos intact via CartPanel's own effect
    setAppliedPromos(
      appliedPromos.filter((p) => p.scope === "LINE" || p.promoId !== couponCode),
      0
    );
    toast.info("Coupon removed");
  };

  const autoPromos = appliedPromos.filter((p) => p.scope === "LINE" || p.scope === "ORDER");
  const couponPromo = couponCode
    ? appliedPromos.find((p) => p.scope === "ORDER" && p.promoId === couponCode) ?? null
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setActiveModal(null)}
      title="Discounts & Promotions"
      size="md"
    >
      {/* Coupon entry */}
      <div className="space-y-3">
        <p className="text-label-md font-semibold text-on-surface">Coupon Code</p>

        {couponCode ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-success/10 border border-success/30 rounded-xl">
            <span className="material-symbols-outlined text-success text-[20px]">check_circle</span>
            <div className="flex-1">
              <p className="text-label-md font-semibold text-on-surface">{couponCode}</p>
              <p className="text-body-sm text-success">Coupon applied</p>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="text-error text-label-sm hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleValidate()}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant text-body-md focus:outline-none focus:border-primary transition-colors"
              disabled={validating}
            />
            <button
              onClick={handleValidate}
              disabled={validating || !codeInput.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {validating ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                "Apply"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-outline-variant" />

      {/* Auto-applied promos */}
      <div className="space-y-2">
        <p className="text-label-md font-semibold text-on-surface">Auto-applied Promotions</p>
        {autoPromos.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-2">
            No promotions triggered on this order yet.
          </p>
        ) : (
          <div className="space-y-2">
            {autoPromos.map((promo) => (
              <div
                key={promo.promoId}
                className="flex items-center gap-3 px-4 py-3 bg-surface-container-low border border-outline-variant rounded-xl"
              >
                <span className="material-symbols-outlined text-success text-[20px]">
                  {promo.scope === "LINE" ? "sell" : "discount"}
                </span>
                <div className="flex-1">
                  <p className="text-label-md font-semibold text-on-surface">{promo.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {promo.scope === "LINE" ? "Item discount" : "Order discount"} ·{" "}
                    {promo.discountType === "PERCENT"
                      ? `${promo.discountValue}% off`
                      : `₹${promo.discountValue} off`}
                  </p>
                </div>
                <span className="text-label-md font-bold text-success">
                  {promo.discountType === "PERCENT"
                    ? `-${promo.discountValue}%`
                    : `-₹${promo.discountValue}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DiscountPopup;
