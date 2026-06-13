"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Numpad, NumpadMode } from "@/components/shared/Numpad";
import PaymentScreen from "@/components/pos/PaymentScreen";

interface PaymentMethod {
  id: string;
  type: "CASH" | "CARD" | "UPI";
  isActive: boolean;
  upiId: string | null;
}

interface Receipt {
  orderNumber: string;
  items: Array<{ name: string; qty: number; lineTotal: number }>;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  method: "CASH" | "CARD" | "UPI";
  changeDue: number | null;
  paidAt: string;
}

interface PayResponse {
  data: {
    order: { status: string };
    receipt: Receipt;
  };
}

const METHOD_SVGS: Record<string, React.ReactNode> = {
  CASH: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M4.5 19.5h15M3.75 6.75h16.5M3.75 9h16.5M3.75 11.25h16.5M3.75 13.5h16.5M3.75 15.75h16.5" />
    </svg>
  ),
  CARD: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  UPI: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM15 15h.008v.008H15V15zm0 2.25h.008v.008H15v-.008zm2.25-2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-2.25h.008v.008H19.5V15zm0 2.25h.008v.008H19.5v-.008zm-5.25-2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008z" />
    </svg>
  ),
};

interface PaymentPanelProps {
  selectedProductId: string | null;
  onSelectProduct: (id: string | null) => void;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({ selectedProductId, onSelectProduct }) => {
  const {
    cartLines, updateQty, total, sessionId, activeTable,
    customerId, couponCode, appliedPromos, setCurrentOrderId, setActiveModal,
    updateLineDiscount, updateLinePrice, currentOrderId,
  } = usePOS();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"CASH" | "CARD" | "UPI">("CASH");
  const [numpadMode, setNumpadMode] = useState<NumpadMode>("qty");
  const [numBuffer, setNumBuffer] = useState("");
  const [upiReference, setUpiReference] = useState("");
  const [focusedInput, setFocusedInput] = useState<"numpad" | "reference">("numpad");
  const [sending, setSending] = useState(false);
  const [externalReceipt, setExternalReceipt] = useState<Receipt | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardValidity, setCardValidity] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [consumerName, setConsumerName] = useState("");

  useEffect(() => {
    api.get<{ data: { methods: PaymentMethod[] } }>("/payment-methods").then((res) => {
      setMethods(res.data.methods);
      const first = res.data.methods.find((m) => m.isActive);
      if (first) setSelectedMethod(first.type);
    }).catch(() => { });
  }, []);

  const handleNumKey = useCallback((key: string) => {
    if (key === "Clear") { setNumBuffer(""); return; }
    if (key === "Backspace") { setNumBuffer((b) => b.slice(0, -1)); return; }
    if (key === "+/-") { setNumBuffer((b) => (b.startsWith("-") ? b.slice(1) : b ? "-" + b : b)); return; }
    if (key === ".") { setNumBuffer((b) => (b.includes(".") ? b : b + ".")); return; }
    setNumBuffer((b) => (b.length < 8 ? b + key : b));
  }, []);

  const applyNumpadValue = useCallback(() => {
    if (!numBuffer || !selectedProductId) return;
    const val = parseFloat(numBuffer);
    if (isNaN(val)) { setNumBuffer(""); return; }

    if (numpadMode === "qty") {
      updateQty(selectedProductId, Math.max(0, Math.floor(val)));
    } else if (numpadMode === "disc") {
      updateLineDiscount(selectedProductId, val);
    } else if (numpadMode === "price") {
      updateLinePrice(selectedProductId, val);
    }
    setNumBuffer("");
  }, [numBuffer, selectedProductId, numpadMode, updateQty, updateLineDiscount, updateLinePrice]);

  const handleKeyPress = (key: string) => {
    if (focusedInput === "reference") {
      if (key === "Clear") { setUpiReference(""); return; }
      if (key === "Backspace") { setUpiReference((r) => r.slice(0, -1)); return; }
      if (key === "+/-" || key === ".") return;
      setUpiReference((r) => (r.length < 20 ? r + key : r));
    } else {
      if (["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "Backspace", "Clear", "+/-"].includes(key)) {
        handleNumKey(key);
      }
    }
  };

  const handleValidatePayment = async () => {
    if (cartLines.length === 0) { toast.error("Cart is empty"); return; }
    if (!sessionId) { toast.error("No active session"); return; }

    if (selectedMethod === "CARD") {
      if (!consumerName.trim() || !cardNumber.trim() || !cardValidity.trim() || !cardCVV.trim()) {
        toast.error("Please fill all card details");
        return;
      }
    }

    if ((selectedMethod === "UPI" || selectedMethod === "CARD") && !upiReference.trim()) {
      toast.error(`Please enter transaction reference for ${selectedMethod}`);
      return;
    }

    setSending(true);
    try {
      // 1. Create or update order
      let orderId = currentOrderId;
      const orderPayload = {
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

      if (orderId) {
        await api.put(`/orders/${orderId}`, orderPayload);
      } else {
        const orderRes = await api.post<{ data: { order: { id: string } } }>("/orders", orderPayload);
        orderId = orderRes.data.order.id;
        setCurrentOrderId(orderId);
      }

      // 2. Validate/pay order immediately
      const payBody: Record<string, unknown> = { method: selectedMethod };
      if (selectedMethod === "CASH") {
        payBody.amountTendered = total;
      } else {
        payBody.reference = upiReference.trim();
      }

      const payRes = await api.post<PayResponse>(`/orders/${orderId}/pay`, payBody);
      setExternalReceipt(payRes.data.receipt);
      setUpiReference("");
      setNumBuffer("");
      setCardNumber("");
      setCardValidity("");
      setCardCVV("");
      setConsumerName("");
      setActiveModal("payment");
      toast.success("Payment validated and order completed!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setSending(false);
    }
  };

  const activeMethods = methods.filter((m) => m.isActive);

  return (
    <div className="flex flex-col h-full bg-surface-container-low overflow-hidden border-l border-outline-variant" style={{ width: "290px", minWidth: "270px" }}>
      {/* Header / Amount Due */}
      <div className="h-14 px-4 shrink-0 flex items-center justify-between border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-[11px] uppercase font-bold tracking-wider text-on-surface-variant/85">Amount Due</span>
        <div className="flex items-center gap-2">
          {numBuffer && selectedProductId && focusedInput === "numpad" && (
            <span className="text-[10px] font-bold text-secondary animate-pulse bg-secondary/15 px-1.5 py-0.5 rounded">
              {numpadMode === "qty" ? `Qty: ${numBuffer}` : numBuffer}
            </span>
          )}
          <span className="text-headline-sm font-black text-primary">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="px-3.5 py-3 border-b border-outline-variant shrink-0 bg-surface-container-lowest">
        <div className="flex gap-2">
          {activeMethods.length === 0
            ? <p className="text-body-sm text-on-surface-variant">No methods active</p>
            : activeMethods.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMethod(m.type);
                  if (m.type === "CASH") setFocusedInput("numpad");
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all text-[11px] font-bold tracking-wide uppercase cursor-pointer active:scale-95 ${selectedMethod === m.type
                  ? "bg-primary text-on-primary border-primary shadow-sm"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface-variant hover:border-primary hover:bg-surface-container/20"
                  }`}
              >
                {METHOD_SVGS[m.type]}
                {m.type}
              </button>
            ))
          }
        </div>
      </div>

      {/* Dynamic payment sub-views (replaces default numpad to prevent empty spaces) */}
      <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-2">
        {selectedMethod === "CASH" && (
          <div
            className="h-full flex items-start justify-center"
            onClick={() => setFocusedInput("numpad")}
          >
            <Numpad
              onKeyPress={handleKeyPress}
              activeMode={numpadMode}
              onModeChange={(mode) => {
                setFocusedInput("numpad");
                setNumpadMode(mode);
                setNumBuffer("");
              }}
              className="w-full shadow-none border-none bg-transparent p-0"
            />
          </div>
        )}

        {selectedMethod === "CARD" && (
          <div className="space-y-4">
            <h3 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider">
              Card Details
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary transition-all duration-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                  Card Number
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant/70 text-[18px]">
                    credit_card
                  </span>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumber(formatted);
                    }}
                    placeholder="4000 1234 5678 9010"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                    Validity (MM/YY)
                  </label>
                  <input
                    type="text"
                    value={cardValidity}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      if (val.length >= 3) {
                        val = `${val.slice(0, 2)}/${val.slice(2)}`;
                      }
                      setCardValidity(val);
                    }}
                    placeholder="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface text-center focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    placeholder="•••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface text-center focus:outline-none focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={upiReference}
                  onChange={(e) => setUpiReference(e.target.value)}
                  placeholder="Reference number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {selectedMethod === "UPI" && (
          <div className="flex flex-col items-center gap-3">
            <h3 className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider self-start">
              UPI Scan & Pay
            </h3>

            {methods.find((m) => m.type === "UPI")?.upiId ? (
              <>
                <div className="p-3 bg-white rounded-2xl border border-outline-variant/60 flex items-center justify-center shadow-sm">
                  <QRCodeSVG
                    value={`upi://pay?pa=${methods.find((m) => m.type === "UPI")?.upiId}&am=${total.toFixed(2)}&cu=INR`}
                    size={130}
                  />
                </div>
                <div className="text-center w-full bg-surface-container-lowest p-2.5 rounded-xl border border-outline-variant/40">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wide font-bold mb-0.5">UPI ID</p>
                  <p className="text-body-sm font-mono font-bold text-primary truncate">
                    {methods.find((m) => m.type === "UPI")?.upiId}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-error bg-error/10 p-3 rounded-xl text-center font-medium">
                UPI ID not configured in Admin → Payment Methods.
              </p>
            )}

            <div className="w-full mt-1">
              <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wide block mb-1">
                Transaction Reference
              </label>
              <input
                type="text"
                value={upiReference}
                onChange={(e) => setUpiReference(e.target.value)}
                placeholder="UPI Ref / TXN ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md text-on-surface focus:outline-none focus:border-primary transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3.5 py-3.5 space-y-2.5 shrink-0 border-t border-outline-variant bg-surface-container-lowest">
        {numBuffer && selectedProductId && focusedInput === "numpad" && (
          <button
            onClick={applyNumpadValue}
            className="w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-label-md hover:bg-secondary/90 transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            Apply {numpadMode === "qty" ? "Quantity" : "Value"}
          </button>
        )}
        <button
          onClick={handleValidatePayment}
          disabled={sending || cartLines.length === 0}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-md"
        >
          {sending ? (
            <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
          ) : (
            <svg className="w-5 h-5 text-on-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {sending ? "Validating..." : "Validate Payment"}
        </button>
      </div>

      {/* Payment screen receipt display */}
      <PaymentScreen
        method={selectedMethod}
        upiId={methods.find((m) => m.type === "UPI")?.upiId ?? null}
        externalReceipt={externalReceipt}
        onClearExternalReceipt={() => setExternalReceipt(null)}
      />
    </div>
  );
};

export default PaymentPanel;

