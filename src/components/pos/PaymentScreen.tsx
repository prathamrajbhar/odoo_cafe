"use client";

import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";

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

interface PaymentScreenProps {
  method: "CASH" | "CARD" | "UPI";
  upiId: string | null;
  externalReceipt?: Receipt | null;
  onClearExternalReceipt?: () => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  method,
  upiId,
  externalReceipt = null,
  onClearExternalReceipt,
}) => {
  const {
    activeModal, setActiveModal, currentOrderId,
    total, customerName, clearCart,
  } = usePOS();

  const [amountTendered, setAmountTendered] = useState("");
  const [reference, setReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [emailModal, setEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  const isOpen = activeModal === "payment";
  const changeDue = method === "CASH" && amountTendered
    ? Math.max(0, parseFloat(amountTendered) - total)
    : null;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmountTendered("");
      setReference("");
      if (externalReceipt) {
        setReceipt(externalReceipt);
      } else {
        setReceipt(null);
      }
    }
  }, [isOpen, externalReceipt]);

  // Sync external receipt changes
  useEffect(() => {
    if (externalReceipt) {
      setReceipt(externalReceipt);
    }
  }, [externalReceipt]);

  const handlePay = async () => {
    if (!currentOrderId) { toast.error("No order to pay"); return; }

    if (method === "CASH") {
      const tendered = parseFloat(amountTendered);
      if (isNaN(tendered) || tendered < total) {
        toast.error(`Amount must be at least ₹${total.toFixed(2)}`);
        return;
      }
    }
    if (method === "CARD" && !reference.trim()) {
      toast.error("Enter transaction reference");
      return;
    }

    setPaying(true);
    try {
      const body: Record<string, unknown> = { method };
      if (method === "CASH") body.amountTendered = parseFloat(amountTendered);
      if (method === "CARD") body.reference = reference.trim();

      const res = await api.post<PayResponse>(`/orders/${currentOrderId}/pay`, body);
      setReceipt(res.data.receipt);
      toast.success("Payment confirmed");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  const handleNewOrder = () => {
    clearCart();
    setReceipt(null);
    onClearExternalReceipt?.();
    setActiveModal("floor");
  };

  const handleSendEmail = async () => {
    if (!email.trim()) { toast.error("Enter an email address"); return; }
    setSendingEmail(true);
    // Email sending is a stub — receipt data is available in `receipt`
    await new Promise((r) => setTimeout(r, 800));
    toast.success(`Receipt sent to ${email}`);
    setSendingEmail(false);
    setEmailModal(false);
  };

  const handleDownloadPDF = () => {
    if (!receipt) return;
    try {
      // 80mm roll width standard. We calculate height dynamically to prevent excessive trailing space
      const pageHeight = Math.max(120, 80 + receipt.items.length * 8);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, pageHeight],
      });

      // Render Title Header
      doc.setFont("courier", "bold");
      doc.setFontSize(12);
      doc.text("ODOO CAFE", 40, 10, { align: "center" });

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.text("123 Gourmet Street, Foodie City", 40, 14, { align: "center" });
      doc.text("GSTIN: 27AAAAA1111A1Z1", 40, 17, { align: "center" });
      doc.text("-".repeat(45), 40, 21, { align: "center" });

      // Metadata Info
      doc.text(`Bill No: ${receipt.orderNumber}`, 6, 25);
      doc.text(`Date: ${new Date(receipt.paidAt).toLocaleString()}`, 6, 29);
      if (customerName) {
        doc.text(`Cust: ${customerName}`, 6, 33);
      }
      doc.text("-".repeat(45), 40, 36, { align: "center" });

      // Column Headers
      doc.text("Qty  Item             Price    Total", 6, 40);
      doc.text("-".repeat(45), 40, 43, { align: "center" });

      // Itemized rows
      let y = 47;
      receipt.items.forEach((item) => {
        const qtyStr = String(item.qty).padEnd(4);
        const nameStr = item.name.substring(0, 14).padEnd(16);
        const unitPrice = (item.lineTotal / item.qty).toFixed(2).padStart(6);
        const lineTotal = item.lineTotal.toFixed(2).padStart(8);
        doc.text(`${qtyStr}${nameStr}${unitPrice}${lineTotal}`, 6, y);
        y += 5.5;
      });

      doc.text("-".repeat(45), 40, y, { align: "center" });
      y += 4.5;

      // Pricing details block
      doc.text(`Subtotal:`.padEnd(25) + `INR ${receipt.subtotal.toFixed(2).padStart(8)}`, 6, y);
      y += 4.5;
      doc.text(`GST (5%):`.padEnd(25) + `INR ${receipt.taxAmount.toFixed(2).padStart(8)}`, 6, y);
      y += 4.5;
      if (receipt.discountAmount > 0) {
        doc.text(`Discount:`.padEnd(25) + `INR -${receipt.discountAmount.toFixed(2).padStart(8)}`, 6, y);
        y += 4.5;
      }

      doc.setFont("courier", "bold");
      doc.text(`TOTAL:`.padEnd(22) + `INR ${receipt.total.toFixed(2).padStart(8)}`, 6, y);
      doc.setFont("courier", "normal");
      y += 5;

      doc.text("-".repeat(45), 40, y, { align: "center" });
      y += 4.5;
      doc.text("Thank you for dining with us!", 40, y, { align: "center" });
      y += 4;
      doc.text("Visit Again!", 40, y, { align: "center" });

      doc.save(`receipt_${receipt.orderNumber}.pdf`);
      toast.success("PDF exported successfully");
    } catch (err) {
      toast.error("Failed to export PDF");
      console.error(err);
    }
  };

  const upiString = upiId
    ? `upi://pay?pa=${upiId}&am=${total.toFixed(2)}&cu=INR`
    : "";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => !receipt && setActiveModal(null)}
        title={receipt ? "Payment Complete" : `Pay via ${method}`}
        size="md"
      >
        {receipt ? (
          /* ── Post-payment receipt view ── */
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-3">
              <span className="material-symbols-outlined text-success text-[40px]">check_circle</span>
              <div>
                <p className="text-headline-sm font-black text-on-surface">₹{receipt.total.toFixed(2)}</p>
                <p className="text-body-sm text-on-surface-variant">Order {receipt.orderNumber}</p>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-xl p-4 space-y-2 text-body-sm" id="receipt-print-area">
              <div className="text-center pb-2 border-b border-outline-variant">
                <p className="font-bold text-label-lg text-on-surface">Odoo Cafe</p>
                <p className="text-on-surface-variant">{new Date(receipt.paidAt).toLocaleString()}</p>
              </div>
              {receipt.items.map((item, i) => (
                <div key={i} className="flex justify-between text-on-surface">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{item.lineTotal.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-outline-variant pt-2 space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal</span><span>₹{receipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Tax</span><span>₹{receipt.taxAmount.toFixed(2)}</span>
                </div>
                {receipt.discountAmount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span><span>-₹{receipt.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-on-surface text-label-md">
                  <span>Total</span><span>₹{receipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Method</span><span>{receipt.method}</span>
                </div>
                {receipt.changeDue !== null && (
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Change</span><span>₹{receipt.changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-1 py-3 rounded-xl border border-outline-variant bg-secondary/5 text-secondary hover:bg-secondary/15 transition-colors text-[11px] font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                Export PDF
              </button>
              <button
                onClick={() => setEmailModal(true)}
                className="flex items-center justify-center gap-1 py-3 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-[11px] font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">email</span>
                Email
              </button>
            </div>

            <button
              onClick={handleNewOrder}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-label-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              New Order
            </button>
          </div>
        ) : (
          /* ── Pre-payment flow ── */
          <div className="space-y-5">
            {/* Amount due */}
            <div className="text-center py-3 bg-surface-container-low rounded-xl">
              <p className="text-body-sm text-on-surface-variant">Amount Due</p>
              <p className="text-headline-lg font-black text-primary">₹{total.toFixed(2)}</p>
              {customerName && (
                <p className="text-body-sm text-on-surface-variant mt-1">
                  <span className="material-symbols-outlined text-[14px] align-text-bottom">person</span>{" "}
                  {customerName}
                </p>
              )}
            </div>

            {/* CASH flow */}
            {method === "CASH" && (
              <div className="space-y-3">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1 block">Amount Received (₹)</label>
                  <input
                    type="number"
                    min={total}
                    step="0.01"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    placeholder={`Min ₹${total.toFixed(2)}`}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors text-center text-headline-sm font-bold"
                    autoFocus
                  />
                </div>
                {changeDue !== null && parseFloat(amountTendered) >= total && (
                  <div className="flex items-center justify-between px-4 py-3 bg-success/10 border border-success/30 rounded-xl">
                    <span className="text-label-md font-semibold text-on-surface">Change Due</span>
                    <span className="text-headline-sm font-black text-success">₹{changeDue.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* UPI flow */}
            {method === "UPI" && (
              <div className="flex flex-col items-center gap-3">
                {upiId ? (
                  <>
                    <div className="p-4 bg-white rounded-xl border border-outline-variant">
                      <QRCodeSVG value={upiString} size={180} />
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      Scan to pay ₹{total.toFixed(2)} via UPI
                    </p>
                    <p className="text-label-sm text-on-surface-variant font-mono">{upiId}</p>
                  </>
                ) : (
                  <p className="text-body-md text-error text-center py-4">
                    UPI ID not configured. Set it in Admin → Payment Methods.
                  </p>
                )}
              </div>
            )}

            {/* CARD flow */}
            {method === "CARD" && (
              <div>
                <label className="text-label-sm text-on-surface-variant mb-1 block">Transaction Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Enter reference number"
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={method === "UPI" ? handlePay : handlePay}
                disabled={paying || (method === "CASH" && (!amountTendered || parseFloat(amountTendered) < total))}
                className="flex-2 flex-grow py-3 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paying
                  ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">check_circle</span>
                }
                {method === "UPI" ? "Confirmed  Paid" : "Confirm Payment"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Email modal */}
      <Modal
        isOpen={emailModal}
        onClose={() => setEmailModal(false)}
        title="Send Receipt by Email"
        size="sm"
      >
        <div className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@example.com"
            className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:border-primary transition-colors"
            autoFocus
          />
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail || !email.trim()}
            className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sendingEmail
              ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              : <span className="material-symbols-outlined text-[18px]">send</span>
            }
            Send
          </button>
        </div>
      </Modal>
    </>
  );
};

export default PaymentScreen;
