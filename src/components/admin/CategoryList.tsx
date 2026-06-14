"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";
import EditCategoryModal, { Category } from "./EditCategoryModal";

export interface CategoryListProps {
  categories: Category[];
  onRefresh: () => void;
}

const PRESET_COLORS = [
  { hex: "#57344f", name: "Odoo Purple" },
  { hex: "#00696e", name: "Secondary Teal" },
  { hex: "#28a745", name: "Success Green" },
  { hex: "#ffc107", name: "Warning Yellow" },
  { hex: "#dc3545", name: "Danger Red" },
  { hex: "#714b67", name: "Dark Purple" },
];

export const CategoryList: React.FC<CategoryListProps> = ({ categories, onRefresh }) => {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleColorChange = async (id: string, name: string, colorHex: string) => {
    setSavingId(id);
    try {
      await api.put(`/categories/${id}`, { name, colorHex });
      toast.success("Category color updated");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update color");
    } finally {
      setSavingId(null);
    }
  };

  const handleEditSubmit = async (id: string, data: { name: string; colorHex: string }) => {
    await api.put(`/categories/${id}`, data);
    toast.success("Category updated successfully");
    onRefresh();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This will unlink it from all associated products.`)) return;
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

  if (categories.length === 0) {
    return (
      <div className="w-full bg-surface-container-lowest border border-available-border rounded-2xl px-6 py-16 text-center select-none shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-surface-container-low flex items-center justify-center text-primary/60 border border-available-border">
          <span className="material-symbols-outlined text-[28px]">category</span>
        </div>
        <h3 className="text-title-md font-bold text-on-surface">No categories found</h3>
        <p className="text-body-sm text-on-surface-variant/70 mt-1 max-w-xs mx-auto">
          Create groups to organize your products. Click <strong className="text-primary font-semibold">New Category</strong> above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const productCount = cat._count?.products ?? 0;
          return (
            <div
              key={cat.id}
              className="group relative bg-surface-container-lowest border border-available-border rounded-xl shadow-sm hover:shadow-md hover:border-outline transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Category Color Accent Header Bar */}
              <div
                className="h-1.5 w-full transition-colors duration-300"
                style={{ backgroundColor: cat.colorHex }}
              />

              <div className="p-5 flex-1 flex flex-col justify-between">
                {/* Title & Count Info */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-title-md font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>

                    {/* Actions dropdown/buttons */}
                    <div className="flex gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        title="Edit category"
                        onClick={() => setEditingCategory(cat)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Delete category"
                        disabled={deletingId === cat.id}
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-danger hover:bg-error-container/20 transition-all disabled:opacity-40"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Product count badge */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">
                      inventory_2
                    </span>
                    <span className="text-body-sm text-on-surface-variant font-medium">
                      {productCount} {productCount === 1 ? "product" : "products"}
                    </span>
                  </div>
                </div>

                {/* Direct color picker swatch row */}
                <div className="border-t border-available-border pt-4 mt-auto">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant/50">
                      Quick Color
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_COLORS.map((color) => {
                        const isSelected = cat.colorHex.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.hex}
                            type="button"
                            title={color.name}
                            disabled={savingId === cat.id}
                            onClick={() => !isSelected && handleColorChange(cat.id, cat.name, color.hex)}
                            className={`w-5 h-5 rounded-full transition-all focus:outline-none disabled:cursor-wait relative ${
                              isSelected
                                ? "ring-2 ring-primary ring-offset-1 scale-110 shadow-sm z-10"
                                : "hover:scale-110 cursor-pointer border border-transparent hover:border-outline-variant"
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid view Footer status info */}
      <div className="px-6 py-4 bg-surface-container-lowest border border-available-border rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-sm select-none">
        <span className="text-body-sm font-semibold text-on-surface-variant">
          Showing {categories.length} {categories.length === 1 ? "Category" : "Categories"}
        </span>
        <span className="text-body-sm font-semibold text-secondary flex items-center gap-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
          </svg>
          All changes synchronized
        </span>
      </div>

      {/* Edit modal */}
      {editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSaved={onRefresh}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

export default CategoryList;
