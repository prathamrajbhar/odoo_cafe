"use client";

import React, { useEffect, useState } from "react";

interface KDSItem {
  id: string;
  name: string;
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

interface Props {
  ticket: KDSTicket;
  onAdvance: (ticketId: string) => void;
  onToggleItem: (ticketId: string, itemId: string) => void;
}

const STATUS_LABEL: Record<KDSTicket["status"], string> = {
  TO_COOK: "To Cook",
  PREPARING: "Preparing",
  COMPLETED: "Completed",
};

const HEADER_CLASS: Record<KDSTicket["status"], string> = {
  TO_COOK: "stage-cooking",
  PREPARING: "stage-preparing",
  COMPLETED: "stage-completed",
};

function useElapsed(createdAt: string) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const seconds = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      if (seconds < 60) {
        setElapsed(`${seconds}s`);
      } else {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        setElapsed(`${m}m ${s}s`);
      }
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [createdAt]);

  return elapsed;
}

function elapsedWarningClass(createdAt: string, status: KDSTicket["status"]): string {
  if (status === "COMPLETED") return "";
  const minutes = (Date.now() - new Date(createdAt).getTime()) / 60000;
  if (minutes >= 15) return " alert-danger";
  if (minutes >= 8) return " alert-warning";
  return "";
}

export function TicketCard({ ticket, onAdvance, onToggleItem }: Props) {
  const elapsed = useElapsed(ticket.createdAt);
  const [advancing, setAdvancing] = useState(false);

  const headerClass = `kds-ticket-header ${HEADER_CLASS[ticket.status]}${elapsedWarningClass(ticket.createdAt, ticket.status)}`;

  const handleCardClick = async () => {
    if (advancing || ticket.status === "COMPLETED") return;
    setAdvancing(true);
    await onAdvance(ticket.id);
    setAdvancing(false);
  };

  return (
    <div
      className="kds-ticket-card cursor-pointer select-none"
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className={headerClass}>
        <span className="text-label-lg">#{ticket.orderNumber}</span>
        <div className="flex items-center gap-2">
          <span className="text-label-md opacity-80">{STATUS_LABEL[ticket.status]}</span>
          <span className="text-label-md font-mono opacity-75">{elapsed}</span>
          {advancing && (
            <span className="w-3 h-3 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Items */}
      <ul className="divide-y divide-outline-variant/40">
        {ticket.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors"
            onClick={(e) => {
              // stop propagation so item click doesn't also advance the ticket
              e.stopPropagation();
              onToggleItem(ticket.id, item.id);
            }}
          >
            <span
              className={`text-body-md ${
                item.isStruckThrough ? "kds-item-strikethrough" : "text-on-surface"
              }`}
            >
              {item.name}
            </span>
            <span
              className={`text-label-lg min-w-[2rem] text-right ${
                item.isStruckThrough ? "opacity-40" : "text-primary"
              }`}
            >
              ×{item.qty}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer hint */}
      {ticket.status !== "COMPLETED" && (
        <div className="px-4 py-2 border-t border-outline-variant/40 bg-surface-container/50">
          <p className="text-label-md text-on-surface-variant text-center">
            Tap card to advance · Tap item to strike
          </p>
        </div>
      )}
    </div>
  );
}

export default TicketCard;
