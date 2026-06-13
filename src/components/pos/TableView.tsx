"use client";

import React, { useState, useEffect, useCallback } from "react";
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

export const TableView: React.FC = () => {
  const { activeModal, setActiveModal, setActiveTable, setCurrentOrderId, activeTable, loadOrderIntoCart } = usePOS();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const isOpen = activeModal === "tables";

  const fetchTables = useCallback(() => {
    setLoading(true);
    api.get<{ data: { tables: Table[] } }>("/tables")
      .then((res) => {
        const active = res.data.tables.filter((t) => t.isActive);
        setTables(active);
        if (active.length > 0 && !selectedFloorId) {
          setSelectedFloorId(active[0].floorId);
        }
      })
      .catch(() => toast.error("Failed to load tables"))
      .finally(() => setLoading(false));
  }, [selectedFloorId]);

  useEffect(() => {
    if (isOpen) fetchTables();
  }, [isOpen, fetchTables]);

  // Group tables by floor
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

  const currentFloor = floors.find((f) => f.id === selectedFloorId) ?? floors[0];

  const handleTableClick = (table: Table) => {
    const next: ActiveTable = { id: table.id, number: table.number, floorId: table.floorId };
    setActiveTable(next);

    if (table.hasActiveOrder && table.activeOrderId) {
      // Load existing DRAFT order into context
      setCurrentOrderId(table.activeOrderId);
    } else {
      setCurrentOrderId(null);
    }

    setActiveModal(null);
    toast.success(`Table ${table.number} selected`);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => setActiveModal(null)} title="Table View" size="xl">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
            progress_activity
          </span>
        </div>
      ) : floors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px]">layers</span>
          <p className="text-body-md">No active tables found</p>
          <p className="text-body-sm">Add tables in Admin → Floor &amp; Tables</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Floor tabs */}
          {floors.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {floors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setSelectedFloorId(floor.id)}
                  className={`shrink-0 px-4 py-2 rounded-full text-label-md font-semibold transition-all ${
                    selectedFloorId === floor.id
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {floor.name}
                </button>
              ))}
            </div>
          )}

          {/* Table grid */}
          {currentFloor && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {currentFloor.tables.map((table) => {
                const isOccupied = table.hasActiveOrder;
                const isSelected = activeTable?.id === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => handleTableClick(table)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 aspect-square rounded-2xl border-2 font-bold transition-all active:scale-[0.95] ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary shadow-lg"
                        : isOccupied
                        ? "border-[var(--occupied-text)] bg-[var(--occupied-pink)] text-[var(--occupied-text)] hover:shadow-md"
                        : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:shadow-md"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[24px]">table_restaurant</span>
                    <span className="text-label-lg leading-none">{table.number}</span>
                    <span className="text-[10px] font-normal opacity-70">{table.seats} seats</span>

                    {isOccupied && !isSelected && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--occupied-text)]" />
                    )}

                    {isOccupied && (
                      <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] font-semibold opacity-80">
                        OCCUPIED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Summary */}
          <div className="flex items-center gap-6 pt-2 border-t border-outline-variant text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full border-2 border-outline-variant bg-surface-container-lowest" />
              <span>Free ({currentFloor?.tables.filter((t) => !t.hasActiveOrder).length ?? 0})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[var(--occupied-text)]" />
              <span>Occupied ({currentFloor?.tables.filter((t) => t.hasActiveOrder).length ?? 0})</span>
            </div>
            <button
              onClick={fetchTables}
              className="ml-auto flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Refresh
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default TableView;
