"use client";

import React, { useState, useEffect } from "react";
import { usePOS, ActiveTable } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import Modal from "@/components/shared/Modal";

interface Table {
  id: string;
  floorId: string;
  number: number;
  seats: number;
  isActive: boolean;
  hasActiveOrder: boolean;
  activeOrderId: string | null;
  floor: { id: string; name: string };
}

export const FloorPopup: React.FC = () => {
  const { activeModal, setActiveModal, setActiveTable, activeTable } = usePOS();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === "floor";

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get<{ data: { tables: Table[] } }>("/tables")
      .then((res) => setTables(res.data.tables.filter((t) => t.isActive)))
      .catch(() => toast.error("Failed to load tables"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const floors = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string; tables: Table[] }>();
    for (const t of tables) {
      if (!map.has(t.floorId)) {
        map.set(t.floorId, { id: t.floor.id, name: t.floor.name, tables: [] });
      }
      map.get(t.floorId)!.tables.push(t);
    }
    return Array.from(map.values());
  }, [tables]);

  const [confirmTable, setConfirmTable] = useState<Table | null>(null);

  const handleSelect = (table: Table) => {
    // Warn if occupied by a different active order (not the current one)
    if (table.hasActiveOrder) {
      setConfirmTable(table);
      return;
    }
    applySelect(table);
  };

  const applySelect = (table: Table) => {
    const next: ActiveTable = { id: table.id, number: table.number, floorId: table.floorId };
    setActiveTable(next);
    setActiveModal(null);
    setConfirmTable(null);
    toast.success(`Table ${table.number} selected`);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setActiveModal(null)} title="Select Table" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
        </div>
      ) : floors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px]">layers</span>
          <p className="text-body-md">No active tables found</p>
          <p className="text-body-sm">Add tables in Admin → Floor &amp; Tables</p>
        </div>
      ) : (
        <div className="space-y-6">
          {floors.map((floor) => (
            <div key={floor.id}>
              <p className="text-label-md font-bold text-on-surface-variant mb-3 uppercase tracking-wider">
                {floor.name}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {floor.tables.map((table) => {
                  const isOccupied = table.hasActiveOrder;
                  const isSelected = activeTable?.id === table.id;
                  return (
                    <button
                      key={table.id}
                      onClick={() => handleSelect(table)}
                      className={`relative flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-2 font-bold transition-all active:scale-[0.95] ${
                        isSelected
                          ? "border-primary bg-primary text-on-primary shadow-lg"
                          : isOccupied
                          ? "border-[var(--occupied-text)] bg-[var(--occupied-pink)] text-[var(--occupied-text)] hover:shadow-md"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:shadow-md"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">table_restaurant</span>
                      <span className="text-label-lg">{table.number}</span>
                      <span className="text-[10px] font-normal opacity-70">{table.seats} seats</span>
                      {isOccupied && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--occupied-text)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-outline-variant">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full border-2 border-outline-variant bg-surface-container-lowest" />
          <span className="text-body-sm text-on-surface-variant">Free</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[var(--occupied-text)]" />
          <span className="text-body-sm text-on-surface-variant">Occupied</span>
        </div>
        {activeTable && (
          <button
            onClick={() => { setActiveTable(null); setActiveModal(null); }}
            className="ml-auto text-label-sm text-error hover:underline"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Occupied table confirmation */}
      {confirmTable && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConfirmTable(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-warning text-[28px]">warning</span>
              <p className="text-label-lg font-bold text-on-surface">Table {confirmTable.number} is Occupied</p>
            </div>
            <p className="text-body-md text-on-surface-variant">
              This table already has an active order. Do you want to switch to it?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTable(null)}
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-on-surface font-semibold text-label-md hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applySelect(confirmTable)}
                className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary-container hover:text-on-primary-container transition-all"
              >
                Switch to Table
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default FloorPopup;
