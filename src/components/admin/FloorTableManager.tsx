"use client";

import React, { useState } from "react";
import Modal from "@/components/shared/Modal";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

interface Table {
  id: string;
  number: number;
  seats: number;
  isActive: boolean;
}

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
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(
    new Set(floors.map((f) => f.id))
  );

  // Floor state
  const [floorModal, setFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorName, setFloorName] = useState("");
  const [savingFloor, setSavingFloor] = useState(false);
  const [deletingFloorId, setDeletingFloorId] = useState<string | null>(null);

  // Table state
  const [tableModal, setTableModal] = useState<{ floorId: string; table?: Table } | null>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableSeats, setTableSeats] = useState("");
  const [tableActive, setTableActive] = useState(true);
  const [savingTable, setSavingTable] = useState(false);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);
  const [togglingTableId, setTogglingTableId] = useState<string | null>(null);

  const toggleFloor = (id: string) =>
    setExpandedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });

  // Floor handlers
  const openNewFloor = () => {
    setEditingFloor(null);
    setFloorName("");
    setFloorModal(true);
  };

  const openEditFloor = (f: Floor) => {
    setEditingFloor(f);
    setFloorName(f.name);
    setFloorModal(true);
  };

  const handleSaveFloor = async () => {
    if (!floorName.trim()) { toast.error("Floor name is required"); return; }
    setSavingFloor(true);
    try {
      if (editingFloor) {
        await api.put(`/floors/${editingFloor.id}`, { name: floorName.trim() });
        toast.success("Floor updated");
      } else {
        await api.post("/floors", { name: floorName.trim() });
        toast.success("Floor created");
      }
      setFloorModal(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save floor");
    } finally {
      setSavingFloor(false);
    }
  };

  const handleDeleteFloor = async (f: Floor) => {
    if (!confirm(`Delete floor "${f.name}" and all its tables?`)) return;
    setDeletingFloorId(f.id);
    try {
      await api.delete(`/floors/${f.id}`);
      toast.success("Floor deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete floor");
    } finally {
      setDeletingFloorId(null);
    }
  };

  // Table handlers
  const openNewTable = (floorId: string) => {
    setTableModal({ floorId });
    setTableNumber("");
    setTableSeats("");
    setTableActive(true);
  };

  const openEditTable = (floorId: string, t: Table) => {
    setTableModal({ floorId, table: t });
    setTableNumber(String(t.number));
    setTableSeats(String(t.seats));
    setTableActive(t.isActive);
  };

  const handleSaveTable = async () => {
    if (!tableModal) return;
    if (!tableNumber) { toast.error("Table number is required"); return; }
    if (!tableSeats) { toast.error("Seat count is required"); return; }

    setSavingTable(true);
    const payload = {
      number: parseInt(tableNumber),
      seats: parseInt(tableSeats),
      isActive: tableActive,
      floorId: tableModal.floorId,
    };

    try {
      if (tableModal.table) {
        await api.put(`/tables/${tableModal.table.id}`, payload);
        toast.success("Table updated");
      } else {
        await api.post("/tables", payload);
        toast.success("Table created");
      }
      setTableModal(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save table");
    } finally {
      setSavingTable(false);
    }
  };

  const handleDeleteTable = async (t: Table) => {
    if (!confirm(`Delete Table ${t.number}?`)) return;
    setDeletingTableId(t.id);
    try {
      await api.delete(`/tables/${t.id}`);
      toast.success("Table deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete table");
    } finally {
      setDeletingTableId(null);
    }
  };

  const handleToggleTable = async (t: Table) => {
    setTogglingTableId(t.id);
    try {
      await api.patch(`/tables/${t.id}`, { isActive: !t.isActive });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update table");
    } finally {
      setTogglingTableId(null);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5 mb-6">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">Floor Plan Management</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">Configure restaurant floors and table layouts.</p>
        </div>
        <Button
          variant="primary"
          onClick={openNewFloor}
          leftIcon={<span className="material-symbols-outlined text-[18px]">add</span>}
        >
          New Floor
        </Button>
      </div>

      {/* Floors */}
      {floors.length === 0 ? (
        <div className="bg-surface-container-lowest border border-available-border rounded-xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-3 block">layers</span>
          <p className="text-body-sm text-on-surface-variant italic">No floors yet. Click "New Floor" to create one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {floors.map((floor) => {
            const expanded = expandedFloors.has(floor.id);
            return (
              <div key={floor.id} className="bg-surface-container-lowest border border-available-border rounded-xl shadow-sm overflow-hidden">
                {/* Floor header */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors"
                  onClick={() => toggleFloor(floor.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
                    <span className="text-label-lg font-bold text-on-surface">{floor.name}</span>
                    <span className="text-label-md text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                      {floor.tables.length} table{floor.tables.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditFloor(floor); }}
                      className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition-colors"
                      title="Edit floor"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFloor(floor); }}
                      disabled={deletingFloorId === floor.id}
                      className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-danger rounded transition-colors disabled:opacity-50"
                      title="Delete floor"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] ml-1">
                      {expanded ? "expand_less" : "expand_more"}
                    </span>
                  </div>
                </div>

                {/* Tables */}
                {expanded && (
                  <div className="border-t border-available-border">
                    {/* Table list */}
                    {floor.tables.length > 0 && (
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-6 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Table #</th>
                            <th className="px-6 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Seats</th>
                            <th className="px-6 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide">Status</th>
                            <th className="px-6 py-3 text-label-md text-on-surface-variant font-bold uppercase tracking-wide text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-available-border">
                          {floor.tables.map((t) => (
                            <tr key={t.id} className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="px-6 py-3 font-semibold text-on-surface">Table {t.number}</td>
                              <td className="px-6 py-3 text-body-sm text-on-surface-variant">
                                <div className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px]">person</span>
                                  {t.seats}
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <button
                                  onClick={() => handleToggleTable(t)}
                                  disabled={togglingTableId === t.id}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 focus:outline-none ${
                                    t.isActive ? "bg-primary" : "bg-surface-container-highest"
                                  }`}
                                  title={t.isActive ? "Deactivate" : "Activate"}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                      t.isActive ? "translate-x-4" : "translate-x-0.5"
                                    }`}
                                  />
                                </button>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() => openEditTable(floor.id, t)}
                                    className="p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-primary rounded transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTable(t)}
                                    disabled={deletingTableId === t.id}
                                    className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-danger rounded transition-colors disabled:opacity-50"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {/* Add table row */}
                    <div className="px-6 py-3 border-t border-dashed border-outline-variant">
                      <button
                        onClick={() => openNewTable(floor.id)}
                        className="flex items-center gap-2 text-label-md text-primary hover:text-primary/80 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Add Table
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floor Modal */}
      <Modal
        isOpen={floorModal}
        onClose={() => setFloorModal(false)}
        title={editingFloor ? "Edit Floor" : "New Floor"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setFloorModal(false)} disabled={savingFloor}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveFloor} isLoading={savingFloor}>
              {editingFloor ? "Save" : "Create Floor"}
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

      {/* Table Modal */}
      <Modal
        isOpen={!!tableModal}
        onClose={() => setTableModal(null)}
        title={tableModal?.table ? "Edit Table" : "New Table"}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setTableModal(null)} disabled={savingTable}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveTable} isLoading={savingTable}>
              {tableModal?.table ? "Save" : "Create Table"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Table Number"
            type="number"
            min="1"
            placeholder="e.g. 5"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />
          <Input
            label="Seats"
            type="number"
            min="1"
            placeholder="e.g. 4"
            value={tableSeats}
            onChange={(e) => setTableSeats(e.target.value)}
            required
          />
          <div className="flex items-center justify-between pt-2 border-t border-available-border">
            <div>
              <div className="text-label-md text-on-surface font-semibold">Active</div>
              <div className="text-body-sm text-on-surface-variant">Table appears in POS</div>
            </div>
            <button
              role="switch"
              aria-checked={tableActive}
              onClick={() => setTableActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                tableActive ? "bg-primary" : "bg-surface-container-highest"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  tableActive ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FloorTableManager;
