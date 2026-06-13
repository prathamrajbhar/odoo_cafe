"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";
import OrderDetail from "@/components/pos/OrderDetail";

interface OrderSummary {
  id: string;
  orderNumber: string;
  status: "DRAFT" | "PAID" | "CANCELLED";
  total: number;
  createdAt: string;
  customer: { id: string; name: string } | null;
  table: { id: string; number: number } | null;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
};

export const OrdersList: React.FC = () => {
  const { activeModal, setActiveModal, sessionId } = usePOS();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const isOpen = activeModal === "orders";

  const fetchOrders = useCallback(() => {
    if (!sessionId) return;
    setLoading(true);
    api.get<{ data: { orders: OrderSummary[] } }>(`/orders?sessionId=${sessionId}`)
      .then((res) => setOrders(res.data.orders))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => {
    if (isOpen) fetchOrders();
  }, [isOpen, fetchOrders]);

  const filtered = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customer?.name ?? "").toLowerCase().includes(q) ||
      new Date(o.createdAt).toLocaleDateString().includes(q)
    );
  });

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setActiveModal(null)} title="Orders" size="xl">
        {/* Search */}
        <div className="relative mb-5">
          <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer, date…"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-body-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="w-8 h-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant/80">
            <svg className="w-14 h-14 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-body-md font-medium">{search ? "No orders match your search" : "No orders in this session"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-outline-variant/60 rounded-xl bg-surface-container-lowest">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/80 bg-surface-container-low text-label-sm font-bold text-on-surface-variant">
                  <th className="px-4 py-3.5">Order #</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Table</th>
                  <th className="px-4 py-3.5 text-right pr-6">Amount</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className="hover:bg-surface-container-low/60 cursor-pointer transition-colors duration-150 text-body-sm"
                  >
                    <td className="px-4 py-3.5 font-bold text-on-surface">{order.orderNumber}</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleString([], {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3.5 text-on-surface-variant">{order.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">
                      {order.table ? `T${order.table.number}` : "—"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-on-surface text-right pr-6">
                      ₹{Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLES[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Order detail — nested modal */}
      {selectedOrderId && (
        <OrderDetail
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onDeleted={() => { setSelectedOrderId(null); fetchOrders(); }}
        />
      )}
    </>
  );
};

export default OrdersList;
