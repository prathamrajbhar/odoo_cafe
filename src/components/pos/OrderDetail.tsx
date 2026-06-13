"use client";

import React, { useState, useEffect } from "react";
import { usePOS, CartLine } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";
import { useRouter } from "next/navigation";

interface OrderLine {
  id: string;
  product: { id: string; name: string };
  qty: number;
  unitPrice: number;
  lineTotal: number;
  appliedPromo: { id: string; name: string } | null;
}

interface OrderFull {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "PAID" | "CANCELLED";
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  createdAt: string;
  customer: { id: string; name: string; email: string | null } | null;
  table: { id: string; number: number } | null;
  lines: OrderLine[];
}

interface OrderDetailProps {
  orderId: string;
  onClose: () => void;
  onDeleted: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-warning/10 text-warning border-warning/30",
  PAID: "bg-success/10 text-success border-success/30",
  CANCELLED: "bg-error/10 text-error border-error/30",
};

export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId, onClose, onDeleted }) => {
  const { setActiveModal, loadOrderIntoCart, setActiveTable } = usePOS();
  const router = useRouter();
  const [order, setOrder] = useState<OrderFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get<{ data: { order: OrderFull } }>(`/orders/${orderId}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleDelete = async () => {
    if (!order) return;
    setDeleting(true);
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success(`Order ${order.orderNumber} deleted`);
      onDeleted();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success(`Order ${order.orderNumber} cancelled`);
      onDeleted();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

  const handleEdit = () => {
    if (!order) return;
    const cartLines: CartLine[] = order.lines.map((l) => ({
      productId: l.product.id,
      name: l.product.name,
      unitPrice: l.unitPrice,
      taxRate: 0, // tax is already baked into order totals; use 0 to avoid double-counting
      qty: l.qty,
      appliedPromoId: l.appliedPromo?.id ?? null,
      promoDiscount: 0,
    }));
    loadOrderIntoCart(cartLines, order.id);
    onClose();
    setActiveModal(null);
    router.push("/pos");
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Order Detail" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
        </div>
      ) : !order ? (
        <p className="text-body-md text-error text-center py-8">Order not found</p>
      ) : (
        <div className="space-y-5">
          {/* Header info */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-headline-sm font-black text-on-surface">{order.orderNumber}</p>
              <p className="text-body-sm text-on-surface-variant">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`inline-block px-3 py-1 rounded-full border text-label-md font-semibold ${STATUS_STYLES[order.status]}`}>
              {order.status}
            </span>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="px-4 py-3 bg-surface-container-low rounded-xl">
              <p className="text-label-sm text-on-surface-variant">Customer</p>
              <p className="text-label-md font-semibold text-on-surface mt-0.5">
                {order.customer?.name ?? "—"}
              </p>
            </div>
            <div className="px-4 py-3 bg-surface-container-low rounded-xl">
              <p className="text-label-sm text-on-surface-variant">Table</p>
              <p className="text-label-md font-semibold text-on-surface mt-0.5">
                {order.table ? `Table ${order.table.number}` : "—"}
              </p>
            </div>
          </div>

          {/* Lines */}
          <div>
            <p className="text-label-md font-semibold text-on-surface mb-2">Items</p>
            <div className="border border-outline-variant rounded-xl overflow-hidden divide-y divide-outline-variant">
              {order.lines.map((line) => (
                <div key={line.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-label-md font-semibold text-on-surface">{line.product.name}</p>
                    {line.appliedPromo && (
                      <p className="text-body-sm text-success flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">sell</span>
                        {line.appliedPromo.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-label-md text-on-surface-variant">× {line.qty}</p>
                    <p className="text-label-md font-semibold text-on-surface">
                      ₹{Number(line.lineTotal).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 px-4 py-3 bg-surface-container-low rounded-xl">
            <div className="flex justify-between text-body-sm text-on-surface-variant">
              <span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-body-sm text-on-surface-variant">
              <span>Tax</span><span>₹{Number(order.taxAmount).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-body-sm text-success">
                <span>Discount</span><span>-₹{Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-label-lg font-black text-on-surface pt-1.5 border-t border-outline-variant">
              <span>Total</span><span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions — DRAFT only */}
          {order.status === "DRAFT" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-error/40 text-error hover:bg-error/10 transition-colors font-semibold text-label-md disabled:opacity-50"
                >
                  {deleting
                    ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    : <span className="material-symbols-outlined text-[18px]">delete</span>
                  }
                  Delete
                </button>
                <button
                  onClick={handleEdit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all font-semibold text-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                  Edit Order
                </button>
              </div>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-semibold text-label-md disabled:opacity-50"
              >
                {cancelling
                  ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  : <span className="material-symbols-outlined text-[18px]">cancel</span>
                }
                Cancel Order
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default OrderDetail;
