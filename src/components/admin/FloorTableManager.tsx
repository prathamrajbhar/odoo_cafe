"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import { FloorCanvas, Table } from "./FloorCanvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { SidebarTools } from "./SidebarTools";

interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

interface Props {
  floors: Floor[];
  onRefresh: () => void;
}

export const FloorTableManager: React.FC<Props> = ({ floors, onRefresh }) => {
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [localTables, setLocalTables] = useState<Table[]>([]);
  const localTablesRef = useRef<Table[]>([]);
  const [deletedTableIds, setDeletedTableIds] = useState<string[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState<Table[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyRef = useRef({ history: [] as Table[][], index: -1 });

  // Floor modal
  const [floorModal, setFloorModal] = useState(false);
  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [floorName, setFloorName] = useState("");
  const [savingFloor, setSavingFloor] = useState(false);

  // Keep ref in sync for drag callbacks
  useEffect(() => {
    localTablesRef.current = localTables;
  }, [localTables]);

  // Default to first floor
  useEffect(() => {
    if (floors.length > 0 && !selectedFloorId) {
      setSelectedFloorId(floors[0].id);
    }
    // If selected floor was deleted, reset
    if (selectedFloorId && !floors.find((f) => f.id === selectedFloorId)) {
      setSelectedFloorId(floors.length > 0 ? floors[0].id : null);
    }
  }, [floors, selectedFloorId]);

  // Sync tables when floor changes — auto-spread tables that are stacked at same position
  useEffect(() => {
    if (!selectedFloorId) return;
    const floor = floors.find((f) => f.id === selectedFloorId);
    const raw = (floor?.tables ?? []).map((t) => ({
      ...t,
      x: t.x ?? 100,
      y: t.y ?? 100,
      width: t.width ?? 80,
      height: t.height ?? 80,
      shape: t.shape ?? "SQUARE",
    }));

    // Detect stacked tables (same x/y) and auto-layout them
    const seen = new Set<string>();
    let needsSpread = false;
    for (const t of raw) {
      const key = `${t.x},${t.y}`;
      if (seen.has(key)) { needsSpread = true; break; }
      seen.add(key);
    }

    let tables: Table[];
    if (needsSpread) {
      const COLS = 6;
      const CELL_W = 110;
      const CELL_H = 110;
      const OFFSET_X = 60;
      const OFFSET_Y = 90;
      tables = raw.map((t, i) => ({
        ...t,
        x: OFFSET_X + (i % COLS) * CELL_W,
        y: OFFSET_Y + Math.floor(i / COLS) * CELL_H,
      }));
    } else {
      tables = raw;
    }

    setLocalTables(tables);
    localTablesRef.current = tables;
    setDeletedTableIds([]);
    setSelectedTableId(null);
    setHistory([tables]);
    setHistoryIndex(0);
    historyRef.current = { history: [tables], index: 0 };
  }, [selectedFloorId, floors]);

  const pushHistory = useCallback((tables: Table[]) => {
    const { history: h, index: i } = historyRef.current;
    const next = [...h.slice(0, i + 1), tables];
    historyRef.current = { history: next, index: next.length - 1 };
    setHistory(next);
    setHistoryIndex(next.length - 1);
  }, []);

  const handleUpdateTablePosition = useCallback((id: string, x: number, y: number) => {
    setLocalTables((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, x, y } : t));
      localTablesRef.current = updated;
      return updated;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    pushHistory(localTablesRef.current);
  }, [pushHistory]);

  const handleUpdateTableProperties = useCallback(
    (id: string, properties: Partial<Table>) => {
      setLocalTables((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...properties } : t));
        localTablesRef.current = updated;
        pushHistory(updated);
        return updated;
      });
    },
    [pushHistory]
  );

  const handleAddTableOfShape = (shape: "SQUARE" | "ROUND") => {
    if (!selectedFloorId) return;
    const current = localTablesRef.current;
    const nextNum = current.reduce((max, t) => Math.max(max, t.number), 0) + 1;

    // Auto-place: find a spot that doesn't overlap any existing table
    const GRID = 100;
    const findFreePos = () => {
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 6; col++) {
          const cx = col * GRID + 80;
          const cy = row * GRID + 90;
          const overlaps = current.some(
            (t) => Math.abs(t.x - cx) < 80 && Math.abs(t.y - cy) < 80
          );
          if (!overlaps) return { x: cx, y: cy };
        }
      }
      return { x: 80, y: 90 };
    };

    const pos = findFreePos();
    const newTable: Table = {
      id: `temp-${Date.now()}`,
      number: nextNum,
      seats: 4,
      isActive: true,
      x: pos.x,
      y: pos.y,
      width: 80,
      height: 80,
      shape,
    };
    const updated = [...current, newTable];
    setLocalTables(updated);
    localTablesRef.current = updated;
    setSelectedTableId(newTable.id);
    pushHistory(updated);
  };

  const handleDeleteTable = useCallback(
    (id: string) => {
      if (!id.startsWith("temp-")) {
        setDeletedTableIds((prev) => [...prev, id]);
      }
      setLocalTables((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        localTablesRef.current = updated;
        pushHistory(updated);
        return updated;
      });
      setSelectedTableId(null);
    },
    [pushHistory]
  );

  const handleUndo = () => {
    const { history: h, index: i } = historyRef.current;
    if (i <= 0) return;
    const nextIndex = i - 1;
    historyRef.current.index = nextIndex;
    setHistoryIndex(nextIndex);
    setLocalTables(h[nextIndex]);
    localTablesRef.current = h[nextIndex];
  };

  const handleRedo = () => {
    const { history: h, index: i } = historyRef.current;
    if (i >= h.length - 1) return;
    const nextIndex = i + 1;
    historyRef.current.index = nextIndex;
    setHistoryIndex(nextIndex);
    setLocalTables(h[nextIndex]);
    localTablesRef.current = h[nextIndex];
  };

  const handleSaveLayout = async () => {
    if (!selectedFloorId) return;
    setSaving(true);
    try {
      await Promise.all(deletedTableIds.map((id) => api.delete(`/tables/${id}`)));
      await Promise.all(
        localTablesRef.current.map((table) => {
          const payload = {
            number: table.number,
            seats: table.seats,
            x: table.x,
            y: table.y,
            width: table.width,
            height: table.height,
            shape: table.shape,
            isActive: table.isActive,
            floorId: selectedFloorId,
          };
          return table.id.startsWith("temp-")
            ? api.post("/tables", payload)
            : api.put(`/tables/${table.id}`, payload);
        })
      );
      toast.success("Layout saved");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save layout");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFloor = async () => {
    if (!floorName.trim()) return;
    setSavingFloor(true);
    try {
      if (editingFloorId) {
        await api.put(`/floors/${editingFloorId}`, { name: floorName.trim() });
        toast.success("Floor renamed");
      } else {
        const res: any = await api.post("/floors", { name: floorName.trim() });
        if (res.data?.floor?.id) setSelectedFloorId(res.data.floor.id);
        toast.success("Floor created");
      }
      setFloorModal(false);
      setFloorName("");
      setEditingFloorId(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save floor");
    } finally {
      setSavingFloor(false);
    }
  };

  const handleDeleteFloor = async (floorId: string) => {
    const floor = floors.find((f) => f.id === floorId);
    if (!floor) return;
    if (!confirm(`Delete floor "${floor.name}" and all its tables?`)) return;
    try {
      await api.delete(`/floors/${floorId}`);
      toast.success("Floor deleted");
      if (selectedFloorId === floorId) {
        setSelectedFloorId(null);
      }
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete floor");
    }
  };

  const openEditFloor = (id: string, name: string) => {
    setEditingFloorId(id);
    setFloorName(name);
    setFloorModal(true);
  };

  const activeTable = localTables.find((t) => t.id === selectedTableId) ?? null;
  const hasChanges = historyIndex > 0 || deletedTableIds.length > 0;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-surface">
      {/* Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant px-6 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10 shrink-0">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface leading-tight">
            Floor Plan Management
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Design and manage your restaurant layout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo"
            className="w-9 h-9 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 7v6h6" /><path d="M3 13C5.5 7.5 11 4 17 4a9 9 0 010 18H3" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo"
            className="w-9 h-9 flex items-center justify-center border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 7v6h-6" /><path d="M21 13C18.5 7.5 13 4 7 4a9 9 0 000 18h18" />
            </svg>
          </button>

          <div className="w-px h-7 bg-outline-variant mx-1" />

          {selectedFloorId && (
            <>
              <button
                onClick={() => handleAddTableOfShape("SQUARE")}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container transition-colors font-semibold"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Table
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={saving || !hasChanges}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg text-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {saving ? "Saving..." : "Save Layout"}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarTools
          floors={floors}
          selectedFloorId={selectedFloorId}
          onSelectFloor={setSelectedFloorId}
          onAddFloor={() => {
            setEditingFloorId(null);
            setFloorName("");
            setFloorModal(true);
          }}
          onEditFloor={openEditFloor}
          onDeleteFloor={handleDeleteFloor}
          onAddTableOfShape={handleAddTableOfShape}
        />

        {/* Canvas */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-surface-container-low/30">
          {selectedFloorId ? (
            <>
              <FloorCanvas
                tables={localTables}
                selectedTableId={selectedTableId}
                onSelectTable={setSelectedTableId}
                onUpdateTablePosition={handleUpdateTablePosition}
                onDragEnd={handleDragEnd}
                zoom={zoom}
              />

              {/* Zoom controls */}
              <div className="absolute bottom-6 right-6 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl shadow-md overflow-hidden z-20">
                <button
                  onClick={() => setZoom((z) => Math.min(200, z + 10))}
                  className="p-2.5 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <div className="w-full h-px bg-outline-variant" />
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1.5 text-xs font-mono text-on-surface hover:bg-surface-container text-center transition-colors"
                >
                  {zoom}%
                </button>
                <div className="w-full h-px bg-outline-variant" />
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 10))}
                  className="p-2.5 text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4.5 12h15" />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant/40" aria-hidden="true">
                  <polygon points="2 3 6 3 6 21 2 21" /><polygon points="10 3 14 3 14 21 10 21" /><polygon points="18 3 22 3 22 21 18 21" />
                </svg>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                No floor selected. Create one in the sidebar to start designing.
              </p>
            </div>
          )}
        </div>

        <PropertiesPanel
          table={activeTable}
          onUpdateTableProperties={handleUpdateTableProperties}
          onDeleteTable={handleDeleteTable}
        />
      </div>

      {/* Floor modal */}
      <Modal
        isOpen={floorModal}
        onClose={() => { setFloorModal(false); setFloorName(""); setEditingFloorId(null); }}
        title={editingFloorId ? "Rename Floor" : "New Floor"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => { setFloorModal(false); setFloorName(""); setEditingFloorId(null); }} disabled={savingFloor}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveFloor} isLoading={savingFloor}>
              {editingFloorId ? "Save" : "Create Floor"}
            </Button>
          </>
        }
      >
        <Input
          label="Floor Name"
          placeholder="e.g. Ground Floor, Rooftop"
          value={floorName}
          onChange={(e) => setFloorName(e.target.value)}
          required
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default FloorTableManager;
