"use client";

import React, { useEffect, useCallback, useState } from "react";
import { usePOS, AppliedPromo } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Promotion {
  id: string;
  name: string;
  promoType: "COUPON" | "PRODUCT_BASED" | "ORDER_BASED";
  productId: string | null;
  minQty: number | null;
  minOrderAmount: number | null;
  discountValue: number;
  discountType: "PERCENT" | "FIXED";
  isActive: boolean;
}

function calcDiscount(value: number, type: "PERCENT" | "FIXED", amount: number): number {
  const d = type === "PERCENT" ? (amount * value) / 100 : value;
  return Math.round(Math.min(amount, d) * 100) / 100;
}

function evaluatePromos(
  cartLines: ReturnType<typeof usePOS>["cartLines"],
  promotions: Promotion[],
  subtotal: number
): { applied: AppliedPromo[]; discountAmount: number } {
  const applied: AppliedPromo[] = [];
  let total = 0;

  for (const promo of promotions) {
    if (!promo.isActive) continue;

    if (promo.promoType === "PRODUCT_BASED" && promo.productId && promo.minQty !== null) {
      const line = cartLines.find((l) => l.productId === promo.productId);
      if (line && line.qty >= promo.minQty) {
        const lineAmount = line.unitPrice * line.qty;
        const d = calcDiscount(promo.discountValue, promo.discountType, lineAmount);
        applied.push({
          promoId: promo.id,
          name: promo.name,
          discountValue: promo.discountValue,
          discountType: promo.discountType,
          scope: "LINE",
          productId: promo.productId,
        });
        total += d;
      }
    }

    if (promo.promoType === "ORDER_BASED" && promo.minOrderAmount !== null) {
      if (subtotal >= promo.minOrderAmount) {
        const d = calcDiscount(promo.discountValue, promo.discountType, subtotal);
        applied.push({
          promoId: promo.id,
          name: promo.name,
          discountValue: promo.discountValue,
          discountType: promo.discountType,
          scope: "ORDER",
          productId: null,
        });
        total += d;
      }
    }
  }

  return { applied, discountAmount: Math.min(subtotal, total) };
}

interface CartPanelProps {
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({ selectedProductId, onSelectProduct }) => {
  const {
    cartLines, updateQty, removeFromCart, setActiveModal,
    setAppliedPromos, appliedPromos, subtotal, taxAmount, discountAmount, total,
    customerName, sessionId, activeTable, customerId, couponCode, clearCart,
    currentOrderId,
  } = usePOS();

  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [sendingToKitchen, setSendingToKitchen] = useState(false);

  useEffect(() => {
    api.get<{ data: { promotions: Promotion[] } }>("/promotions").then((res) => {
      setPromotions(res.data.promotions.filter((p) => p.promoType !== "COUPON"));
    }).catch(() => { });
  }, []);

  const handleSendToKitchen = useCallback(async () => {
    if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
    if (!sessionId) { toast.error("No active session"); return; }

    setSendingToKitchen(true);
    try {
      const payload = {
        sessionId,
        tableId: activeTable?.id ?? null,
        customerId: customerId ?? null,
        couponCode: couponCode ?? null,
        lines: cartLines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
          unitPrice: l.unitPrice,
          discountPercent: l.discountPercent || 0,
          appliedPromoId: appliedPromos.find((p) => p.scope === "LINE" && p.productId === l.productId)?.promoId ?? null,
        })),
      };

      if (currentOrderId) {
        await api.put(`/orders/${currentOrderId}`, payload);
      } else {
        await api.post("/orders", payload);
      }
      
      clearCart();
      toast.success(currentOrderId ? "Order updated in kitchen!" : "Order sent to kitchen!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save order");
    } finally {
      setSendingToKitchen(false);
    }
  }, [cartLines, sessionId, activeTable, customerId, couponCode, appliedPromos, clearCart, currentOrderId]);

  const runPromoEval = useCallback(() => {
    if (cartLines.length === 0) {
      setAppliedPromos([], 0);
      return;
    }
    const rawSubtotal = cartLines.reduce((s, l) => s + l.unitPrice * l.qty, 0);
    const { applied, discountAmount: da } = evaluatePromos(cartLines, promotions, rawSubtotal);
    setAppliedPromos(applied, da);
  }, [cartLines, promotions, setAppliedPromos]);

  useEffect(() => { runPromoEval(); }, [runPromoEval]);

  const linePromo = (productId: string) =>
    appliedPromos.find((p) => p.scope === "LINE" && p.productId === productId);

  const orderPromos = appliedPromos.filter((p) => p.scope === "ORDER");

  if (cartLines.length === 0) {
    return (
      <div className="w-80 shrink-0 flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant">
        <div className="h-14 px-4 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container-lowest">
          <div className="flex items-center gap-2">
            <span className="text-label-lg font-bold text-on-surface">Current Order</span>
            <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
              {currentOrderId ? "#EDIT" : "#NEW"}
            </span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <svg className="w-12 h-12 text-on-surface-variant/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <p className="text-body-md font-medium">Cart is empty</p>
          <p className="text-body-sm opacity-75">Tap a product to add it</p>
        </div>
        <CartFooter
          subtotal={0} taxAmount={0} discountAmount={0} total={0}
          customerName={customerName}
          onCustomer={() => setActiveModal("customer")}
          onDiscount={() => setActiveModal("discount")}
          onSendToKitchen={handleSendToKitchen}
          sendingToKitchen={sendingToKitchen}
        />
      </div>
    );
  }

  return (
    <div className="w-80 shrink-0 flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant overflow-hidden">
      {/* Header */}
      <div className="h-14 px-4 border-b border-outline-variant flex items-center justify-between shrink-0 bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="text-label-lg font-bold text-on-surface">Current Order</span>
          <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
            {currentOrderId ? "#EDIT" : "#NEW"}
          </span>
        </div>
        {customerName && (
          <button
            onClick={() => setActiveModal("customer")}
            className="flex items-center gap-1 text-label-sm text-secondary font-semibold hover:underline cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {customerName}
          </button>
        )}
      </div>

      {/* Lines */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/50">
        {cartLines.map((line) => {
          const promo = linePromo(line.productId);
          const isSelected = selectedProductId === line.productId;
          return (
            <div
              key={line.productId}
              onClick={() => onSelectProduct(line.productId)}
              className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${isSelected ? "bg-primary-container/10 border-l-4 border-primary" : "hover:bg-surface-container-low"}`}
            >
              {/* Product name & Line Total */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-label-md font-semibold text-on-surface truncate flex-1">
                  {line.name}
                </span>
                <span className="text-label-md font-bold text-on-surface shrink-0 text-right">
                  ₹{(line.unitPrice * line.qty).toFixed(2)}
                </span>
              </div>

              {/* Adjuster Stepper & Unit Price */}
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-1 shrink-0 border border-outline-variant/60 rounded-lg p-0.5 bg-surface-container-lowest" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => updateQty(line.productId, line.qty - 1)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                  </button>
                  <span className="w-6 text-center text-body-sm font-bold text-on-surface">{line.qty}</span>
                  <button
                    onClick={() => updateQty(line.productId, line.qty + 1)}
                    className="w-6 h-6 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-body-sm text-on-surface-variant/80">
                    ₹{Number(line.unitPrice).toFixed(2)} ea
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromCart(line.productId); }}
                    className="text-on-surface-variant/60 hover:text-error transition-colors p-1 rounded hover:bg-error/10 cursor-pointer"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                  </button>
                </div>
              </div>

              {/* Product promo sub-line */}
              {promo && (
                <div className="flex items-center justify-between mt-2 pl-1">
                  <span className="text-[11px] text-success flex items-center gap-1 font-medium">
                    <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.43 1.43 0 002.022 0l4.319-4.319a1.43 1.43 0 000-2.022l-9.58-9.581A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" /></svg>
                    {promo.name}
                  </span>
                  <span className="text-[11px] text-success font-semibold">
                    -{promo.discountType === "PERCENT" ? `${promo.discountValue}%` : `₹${promo.discountValue}`}
                  </span>
                </div>
              )}

              {line.discountPercent !== undefined && line.discountPercent > 0 && (
                <div className="flex items-center justify-between mt-2 pl-1">
                  <span className="text-[11px] text-success flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-[13px] text-success shrink-0">percent</span>
                    Manual Discount
                  </span>
                  <span className="text-[11px] text-success font-semibold">
                    -{line.discountPercent}%
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Order-level promo lines */}
        {orderPromos.map((p) => (
          <div key={p.promoId} className="px-4 py-2 bg-success/5 flex items-center justify-between border-t border-outline-variant/40 animate-pulse">
            <span className="text-body-sm text-success flex items-center gap-1 font-semibold">
              <svg className="w-3.5 h-3.5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.43 1.43 0 002.022 0l4.319-4.319a1.43 1.43 0 000-2.022l-9.58-9.581A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" /></svg>
              {p.name}
            </span>
            <span className="text-body-sm text-success font-bold">
              -{p.discountType === "PERCENT" ? `${p.discountValue}%` : `₹${p.discountValue}`}
            </span>
          </div>
        ))}
      </div>

      <CartFooter
        subtotal={subtotal}
        taxAmount={taxAmount}
        discountAmount={discountAmount}
        total={total}
        customerName={customerName}
        onCustomer={() => setActiveModal("customer")}
        onDiscount={() => setActiveModal("discount")}
        onSendToKitchen={handleSendToKitchen}
        sendingToKitchen={sendingToKitchen}
      />
    </div>
  );
};

interface CartFooterProps {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  onCustomer: () => void;
  onDiscount: () => void;
  onSendToKitchen: () => void;
  sendingToKitchen: boolean;
}

const CartFooter: React.FC<CartFooterProps> = ({
  subtotal, taxAmount, discountAmount, total, onCustomer, onDiscount,
  onSendToKitchen, sendingToKitchen,
}) => (
  <div className="shrink-0 border-t border-outline-variant bg-surface-container-low p-3">
    {/* Totals */}
    <div className="space-y-1.5 pb-3">
      <div className="flex justify-between text-body-sm text-on-surface-variant">
        <span>Subtotal</span>
        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-body-sm text-on-surface-variant">
        <span>GST (5%)</span>
        <span className="font-medium">₹{taxAmount.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between text-body-sm text-success font-semibold">
          <span>Discount</span>
          <span>-₹{discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between text-label-lg font-black text-on-surface pt-2 border-t border-outline-variant">
        <span>Total</span>
        <span className="text-[17px] font-black">₹{total.toFixed(2)}</span>
      </div>
    </div>

    {/* Send to Kitchen */}
    <button
      onClick={onSendToKitchen}
      disabled={sendingToKitchen}
      className="w-full mb-2.5 py-3 rounded-xl bg-secondary text-on-secondary font-bold text-label-md flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] shadow-sm"
    >
      {sendingToKitchen ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      )}
      {sendingToKitchen ? "Sending..." : "Send to Kitchen"}
    </button>

    {/* Action buttons */}
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={onCustomer}
        className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all cursor-pointer active:scale-95"
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5a3 3 0 11-6 0 3 3 0 016 0zM12 11.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H12.75a.75.75 0 01-.75-.75v-.008zM19 15.75c0-1.242-1.008-2.25-2.25-2.25h-4.5c-1.242 0-2.25 1.008-2.25 2.25v2.25h9v-2.25z" />
        </svg>
        <span className="text-[10px] font-bold">Customer</span>
      </button>
      <button
        onClick={onDiscount}
        className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all cursor-pointer active:scale-95"
      >
        <svg className="w-4 h-4 mb-1 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.43 1.43 0 002.022 0l4.319-4.319a1.43 1.43 0 000-2.022l-9.58-9.581A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" /></svg>
        <span className="text-[10px] font-bold">Discount</span>
      </button>
      <button
        className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl bg-[#4dd0e1] text-white hover:bg-[#26c6da] transition-all cursor-pointer active:scale-95"
      >
        <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
        <span className="text-[10px] font-bold">Send</span>
      </button>
    </div>
  </div>
);

export default CartPanel;
