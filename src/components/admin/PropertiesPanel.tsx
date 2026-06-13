"use client";

import React from "react";
import { Table } from "./FloorCanvas";

interface PropertiesPanelProps {
  table: Table | null;
  onUpdateTableProperties: (id: string, properties: Partial<Table>) => void;
  onDeleteTable: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  table,
  onUpdateTableProperties,
  onDeleteTable,
}) => {
  if (!table) {
    return (
      <aside className="w-72 bg-surface-container-lowest border-l border-outline-variant flex flex-col items-center justify-center text-center px-6 gap-3 shrink-0 z-10">
        <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/40" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <h3 className="text-label-lg font-semibold text-on-surface">No Selection</h3>
          <p className="text-body-sm text-on-surface-variant mt-1 max-w-[180px]">
            Click a table on the canvas to configure its properties.
          </p>
        </div>
      </aside>
    );
  }

  const isRound = table.shape === "ROUND";

  return (
    <aside className="w-72 bg-surface-container-lowest border-l border-outline-variant flex flex-col gap-5 overflow-y-auto shrink-0 z-10 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-label-lg font-bold text-on-surface">Table Properties</h2>
        <button
          onClick={() => onDeleteTable(table.id)}
          title="Delete table"
          className="p-1.5 rounded-lg text-on-surface-variant/50 hover:text-danger hover:bg-error-container/20 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </button>
      </div>

      {/* Preview badge */}
      <div className="flex items-center gap-3 p-3 bg-primary-container rounded-xl text-on-primary-container">
        <div
          className={`w-12 h-12 bg-white border border-primary/30 shadow-sm flex items-center justify-center text-primary font-bold text-base shrink-0 ${isRound ? "rounded-full" : "rounded-lg"}`}
        >
          T{table.number}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-label-lg">{isRound ? "Round Table" : "Square Table"}</div>
          <div className="text-[10px] opacity-60 font-mono truncate max-w-[140px]">{table.id}</div>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4">
        {/* Table Number */}
        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1.5">
            Table Name / Number
          </label>
          <input
            type="number"
            min="1"
            value={table.number || ""}
            onChange={(e) =>
              onUpdateTableProperties(table.id, { number: parseInt(e.target.value) || 1 })
            }
            className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {/* Seats */}
        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1.5">
            Number of Seats
          </label>
          <div className="flex items-center">
            <button
              onClick={() => onUpdateTableProperties(table.id, { seats: Math.max(1, table.seats - 1) })}
              className="w-10 h-9 bg-surface-container border border-outline-variant rounded-l-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>
            </button>
            <input
              type="text"
              readOnly
              value={table.seats}
              className="w-14 h-9 border-y border-outline-variant bg-surface-container-lowest text-center text-body-md text-on-surface focus:outline-none"
            />
            <button
              onClick={() => onUpdateTableProperties(table.id, { seats: table.seats + 1 })}
              className="w-10 h-9 bg-surface-container border border-outline-variant rounded-r-lg flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>

        {/* Shape */}
        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1.5">
            Shape
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onUpdateTableProperties(table.id, { shape: "SQUARE" })}
              className={`py-2 rounded-lg text-label-md flex items-center justify-center gap-2 border transition-all font-medium
                ${!isRound
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container"
                }`}
            >
              <div className="w-4 h-4 border-2 border-current rounded-sm" />
              Square
            </button>
            <button
              onClick={() => onUpdateTableProperties(table.id, { shape: "ROUND" })}
              className={`py-2 rounded-lg text-label-md flex items-center justify-center gap-2 border transition-all font-medium
                ${isRound
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container"
                }`}
            >
              <div className="w-4 h-4 border-2 border-current rounded-full" />
              Round
            </button>
          </div>
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant mb-1.5">
            Dimensions (W × H)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="40"
              max="200"
              step="10"
              value={table.width}
              onChange={(e) =>
                onUpdateTableProperties(table.id, { width: parseInt(e.target.value) || 80 })
              }
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-on-surface-variant font-mono text-sm">×</span>
            <input
              type="number"
              min="40"
              max="200"
              step="10"
              value={table.height}
              onChange={(e) =>
                onUpdateTableProperties(table.id, { height: parseInt(e.target.value) || 80 })
              }
              className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
          <div>
            <div className="text-label-md font-semibold text-on-surface">Active Status</div>
            <div className="text-body-sm text-on-surface-variant">Table can be booked</div>
          </div>
          <button
            role="switch"
            aria-checked={table.isActive}
            onClick={() => onUpdateTableProperties(table.id, { isActive: !table.isActive })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
              ${table.isActive ? "bg-primary" : "bg-surface-container-highest"}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
                ${table.isActive ? "translate-x-5" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>
    </aside>
  );
};
