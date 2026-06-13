"use client";

import React, { useState } from "react";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { categoryUpdateSchema } from "@/schemas/category";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface Category {
  id: string;
  name: string;
  colorHex: string;
  _count?: {
    products: number;
  };
}

export interface CategoryListProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColorHex, setEditColorHex] = useState("");
  const [errors, setErrors] = useState<{ name?: string; colorHex?: string }>({});
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColorHex(cat.colorHex);
    setErrors({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrors({});
  };

  const saveEdit = async (id: string) => {
    setIsLoading(id);
    setErrors({});

    const result = categoryUpdateSchema.safeParse({ name: editName, colorHex: editColorHex });
    if (!result.success) {
      const formattedErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") formattedErrors.name = err.message;
        if (err.path[0] === "colorHex") formattedErrors.colorHex = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(null);
      return;
    }

    try {
      await api.put(`/categories/${id}`, { name: editName, colorHex: editColorHex });
      toast.success("Category updated successfully!");
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update category");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    setIsLoading(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted successfully!");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto border border-available-border bg-surface-container-lowest rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-surface-container-low border-b border-available-border text-label-md text-on-surface-variant select-none">
            <th className="px-6 py-4 font-bold tracking-wide text-xs">Swatch</th>
            <th className="px-6 py-4 font-bold tracking-wide text-xs">Category Name</th>
            <th className="px-6 py-4 font-bold tracking-wide text-xs">Hex Code</th>
            <th className="px-6 py-4 font-bold tracking-wide text-xs text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-available-border">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                No categories available. Click &quot;New Category&quot; to add one.
              </td>
            </tr>
          ) : (
            categories.map((cat) => {
              const isEditing = editingId === cat.id;
              const isRowLoading = isLoading === cat.id;

              return (
                <tr
                  key={cat.id}
                  className={`text-body-sm text-on-surface hover:bg-surface-container-low/50 transition-colors duration-150
                    ${isEditing ? "bg-primary/5 hover:bg-primary/5" : ""}
                  `}
                >
                  {/* Swatch Column */}
                  <td className="px-6 py-4.5 align-middle w-24">
                    {isEditing ? (
                      <div
                        className="h-9 w-9 rounded-default border border-available-border"
                        style={{ backgroundColor: editColorHex }}
                      />
                    ) : (
                      <div
                        className="h-9 w-9 rounded-default border border-available-border shadow-sm"
                        style={{ backgroundColor: cat.colorHex }}
                      />
                    )}
                  </td>

                  {/* Name Column */}
                  <td className="px-6 py-4.5 align-middle">
                    {isEditing ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        error={errors.name}
                        className="max-w-xs"
                        disabled={isRowLoading}
                      />
                    ) : (
                      <span className="font-semibold text-body-md text-on-surface">
                        {cat.name}
                      </span>
                    )}
                  </td>

                  {/* Hex Color Column */}
                  <td className="px-6 py-4.5 align-middle">
                    {isEditing ? (
                      <Input
                        value={editColorHex}
                        onChange={(e) => setEditColorHex(e.target.value)}
                        error={errors.colorHex}
                        className="max-w-xs font-mono"
                        disabled={isRowLoading}
                      />
                    ) : (
                      <code className="text-body-sm font-mono bg-surface-container px-2 py-1 rounded text-on-surface-variant">
                        {cat.colorHex}
                      </code>
                    )}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4.5 align-middle text-right w-64">
                    {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEdit}
                          disabled={isRowLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => saveEdit(cat.id)}
                          isLoading={isRowLoading}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(cat)}
                          disabled={isLoading !== null}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={isLoading !== null}
                          className="text-danger hover:text-danger/95 hover:bg-error-container/20"
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryList;
