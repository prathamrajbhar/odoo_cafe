"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  _count?: { products: number };
}

export interface CategoryListProps {
  categories: Category[];
  onRefresh: () => void;
}

const PRESET_COLORS = [
  { hex: "#dc3545", name: "Red" },
  { hex: "#ffc107", name: "Yellow" },
  { hex: "#00696e", name: "Teal" },
  { hex: "#714b67", name: "Purple" },
  { hex: "#28a745", name: "Green" },
];

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onRefresh }) => {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleColorChange = async (id: string, name: string, colorHex: string) => {
    setSavingId(id);
    try {
      await api.put(`/categories/${id}`, { name, colorHex });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full border border-available-border bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-available-border select-none">
              <th className="px-6 py-4 text-xs font-semibold tracking-widest text-on-surface-variant/60 uppercase">Category Name</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-widest text-on-surface-variant/60 uppercase">Color Tag</th>
              <th className="px-6 py-4 text-xs font-semibold tracking-widest text-on-surface-variant/60 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-available-border">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/60 italic">
                  No categories yet. Click &quot;New Category&quot; to add one.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-container-low/50 transition-colors">
                  {/* Name */}
                  <td className="px-6 py-4 align-middle">
                    <span className="text-body-md text-on-surface">{cat.name}</span>
                  </td>

                  {/* Color dots */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = cat.colorHex.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.hex}
                            type="button"
                            title={color.name}
                            disabled={savingId === cat.id}
                            onClick={() => !isSelected && handleColorChange(cat.id, cat.name, color.hex)}
                            className={`w-6 h-6 rounded-full transition-transform focus:outline-none disabled:cursor-wait
                              ${isSelected
                                ? "ring-2 ring-offset-1 ring-on-surface/40 scale-110"
                                : "hover:scale-110 cursor-pointer"
                              }
                            `}
                            style={{ backgroundColor: color.hex }}
                          />
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex items-center gap-0.5 justify-end">
                      <button
                        type="button"
                        title="Delete category"
                        disabled={deletingId === cat.id}
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 rounded-lg text-on-surface-variant/50 hover:text-danger hover:bg-error-container/20 transition-colors disabled:opacity-40"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-available-border flex items-center justify-between">
        <span className="text-body-sm text-on-surface-variant">
          {categories.length} {categories.length === 1 ? "Category" : "Categories"} total
        </span>
        <span className="text-body-sm text-secondary flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          All changes saved
        </span>
      </div>
    </div>
  );
};

export default CategoryList;
