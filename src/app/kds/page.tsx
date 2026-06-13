"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import TicketCard from "@/components/kds/TicketCard";
import KDSSidebar from "@/components/kds/KDSSidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KDSItem {
  id: string;
  name: string;
  productId: string;
  categoryId: string;
  categoryName: string;
  qty: number;
  isStruckThrough: boolean;
}

interface KDSTicket {
  id: string;
  orderNumber: string;
  status: "TO_COOK" | "PREPARING" | "COMPLETED";
  createdAt: string;
  items: KDSItem[];
}

type Tab = "ALL" | "TO_COOK" | "PREPARING" | "COMPLETED";

const TABS: { key: Tab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TO_COOK", label: "To Cook" },
  { key: "PREPARING", label: "Preparing" },
  { key: "COMPLETED", label: "Completed" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KdsPage() {
  const [tickets, setTickets] = useState<Map<string, KDSTicket>>(new Map());
  const [tab, setTab] = useState<Tab>("TO_COOK");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState<boolean | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // ── Session status — one fetch on mount, then pure socket events ────────
  useEffect(() => {
    fetch("/api/kds/session-status")
      .then((r) => r.json())
      .then((json) => setSessionActive(json.data.active))
      .catch(() => setSessionActive(false));
  }, []);

  // ── Initial fetch ────────────────────────────────────────────────────────
  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/kds/tickets");
      const json = await res.json();
      const map = new Map<string, KDSTicket>();
      for (const t of json.data.tickets) map.set(t.id, t);
      setTickets(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ── Socket.io ────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("session:opened", () => {
      setSessionActive(true);
      fetchTickets();
    });

    socket.on("session:closed", () => {
      setSessionActive(false);
      setTickets(new Map());
    });

    // New ticket: re-fetch to get full data including category info
    socket.on("ticket:new", () => {
      fetchTickets();
    });

    // Partial update: patch status and/or items in-place
    socket.on(
      "ticket:updated",
      (payload: { id: string; status?: string; items?: { id: string; isStruckThrough: boolean }[] }) => {
        setTickets((prev) => {
          const ticket = prev.get(payload.id);
          if (!ticket) return prev;

          const next = new Map(prev);
          next.set(payload.id, {
            ...ticket,
            ...(payload.status ? { status: payload.status as KDSTicket["status"] } : {}),
            items: payload.items
              ? ticket.items.map((item) => {
                  const updated = payload.items!.find((u) => u.id === item.id);
                  return updated ? { ...item, isStruckThrough: updated.isStruckThrough } : item;
                })
              : ticket.items,
          });
          return next;
        });
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [fetchTickets]);

  // ── Advance ticket ───────────────────────────────────────────────────────
  const handleAdvance = useCallback(async (ticketId: string) => {
    const res = await fetch(`/api/kds/tickets/${ticketId}/advance`, { method: "POST" });
    if (!res.ok) return;
    // socket event will update state; optimistically advance locally too
    setTickets((prev) => {
      const ticket = prev.get(ticketId);
      if (!ticket || ticket.status === "COMPLETED") return prev;
      const nextStatus =
        ticket.status === "TO_COOK" ? "PREPARING" : "COMPLETED";
      const next = new Map(prev);
      next.set(ticketId, { ...ticket, status: nextStatus });
      return next;
    });
  }, []);

  // ── Toggle item strikethrough ────────────────────────────────────────────
  const handleToggleItem = useCallback(async (ticketId: string, itemId: string) => {
    // Optimistic update
    setTickets((prev) => {
      const ticket = prev.get(ticketId);
      if (!ticket) return prev;
      const next = new Map(prev);
      next.set(ticketId, {
        ...ticket,
        items: ticket.items.map((i) =>
          i.id === itemId ? { ...i, isStruckThrough: !i.isStruckThrough } : i
        ),
      });
      return next;
    });
    // Fire and forget — socket will confirm
    await fetch(`/api/kds/tickets/${ticketId}/items/${itemId}/toggle`, { method: "POST" });
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const allTickets = useMemo(() => Array.from(tickets.values()), [tickets]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const t of allTickets)
      for (const i of t.items)
        if (i.categoryId && !seen.has(i.categoryId))
          seen.set(i.categoryId, i.categoryName);
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [allTickets]);

  const counts = useMemo(
    () => ({
      ALL: allTickets.length,
      TO_COOK: allTickets.filter((t) => t.status === "TO_COOK").length,
      PREPARING: allTickets.filter((t) => t.status === "PREPARING").length,
      COMPLETED: allTickets.filter((t) => t.status === "COMPLETED").length,
    }),
    [allTickets]
  );

  const visibleTickets = useMemo(() => {
    let list = tab === "ALL" ? allTickets : allTickets.filter((t) => t.status === tab);

    if (selectedCategories.size > 0) {
      list = list.filter((t) =>
        t.items.some((i) => selectedCategories.has(i.categoryId))
      );
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.orderNumber.toLowerCase().includes(q) ||
          t.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    return list.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allTickets, tab, selectedCategories, search]);

  const handleCategoryToggle = useCallback((id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSelectedCategories(new Set());
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Session-off overlay */}
      {sessionActive === false && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-surface">
          <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-[56px] text-on-surface-variant">
              power_off
            </span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-headline-md font-bold text-on-surface">No Active Session</h2>
            <p className="text-body-md text-on-surface-variant max-w-xs">
              The POS session is currently closed. Ask a manager to open a session to start receiving orders.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant">
            <span className="w-2 h-2 rounded-full bg-error" />
            <span className="text-label-md text-on-surface-variant">Session Offline</span>
          </div>
        </div>
      )}
      {/* Sidebar */}
      <KDSSidebar
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
        hasActiveFilters={selectedCategories.size > 0}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3 shrink-0">
            <span className="material-symbols-outlined text-primary text-[28px]">restaurant</span>
            <h1 className="text-headline-sm font-bold text-on-surface">Kitchen Display</h1>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders or items…"
              className="w-full pl-9 pr-9 py-2 text-body-sm bg-surface-container border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connected ? "bg-success animate-pulse" : "bg-error"
              }`}
            />
            <span className="text-label-md text-on-surface-variant">
              {connected ? "Live" : "Reconnecting…"}
            </span>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 px-6 pt-4 pb-0 shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-label-lg transition-colors border border-b-0 ${
                tab === key
                  ? "bg-surface-container-lowest border-outline-variant text-primary"
                  : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
              <span
                className={`text-label-md px-1.5 py-0.5 rounded-full ${
                  tab === key
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {counts[key]}
              </span>
            </button>
          ))}
        </nav>

        {/* Ticket grid */}
        <main className="flex-1 overflow-hidden border-t border-outline-variant bg-surface-container-lowest">
          {loading ? (
            <div className="kds-flex-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="kds-ticket-card h-48 animate-pulse bg-surface-container"
                />
              ))}
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-[56px] opacity-40">
                restaurant_menu
              </span>
              <p className="text-body-lg">
                {tab === "ALL" ? "No active tickets" : `No ${tab.toLowerCase().replace("_", " ")} tickets`}
              </p>
            </div>
          ) : (
            <div className="kds-flex-grid">
              {visibleTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onAdvance={handleAdvance}
                  onToggleItem={handleToggleItem}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
