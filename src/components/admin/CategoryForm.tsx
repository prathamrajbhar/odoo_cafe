"use client";

import React, { useState } from "react";
import Modal from "@/components/shared/Modal";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";
import { categoryCreateSchema } from "@/schemas/category";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: any) => void;
}

const PRESET_COLORS = [
  { name: "Odoo Purple", hex: "#57344f" },
  { name: "Secondary Teal", hex: "#00696e" },
  { name: "Success Green", hex: "#28a745" },
  { name: "Warning Yellow", hex: "#ffc107" },
  { name: "Danger Red", hex: "#dc3545" },
  { name: "Dark Purple", hex: "#714b67" },
];

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [colorHex, setColorHex] = useState("#57344f"); // Default to Odoo Purple
  const [errors, setErrors] = useState<{ name?: string; colorHex?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = categoryCreateSchema.safeParse({ name, colorHex });
    if (!result.success) {
      const formattedErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "name") formattedErrors.name = err.message;
        if (err.path[0] === "colorHex") formattedErrors.colorHex = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response: any = await api.post("/categories", { name, colorHex });
      toast.success("Category created successfully!");
      setName("");
      setColorHex("#57344f");
      onSuccess(response.data.category);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Category"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Create Category
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name */}
        <Input
          label="Category Name"
          placeholder="e.g. Cold Drinks, Pastries"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
          }}
          error={errors.name}
          disabled={isLoading}
          required
        />

        {/* Color Hex Input & Swatches */}
        <div className="space-y-2.5">
          <label className="text-label-md text-on-surface font-semibold select-none block">
            Category Accent Color
          </label>
          <div className="flex gap-2.5 items-center">
            {/* Color Swatch Preview Indicator */}
            <div
              className="h-10 w-10 rounded-lg border border-available-border flex-shrink-0 shadow-sm transition-colors duration-200"
              style={{ backgroundColor: colorHex }}
            />
            <Input
              type="text"
              placeholder="#57344f"
              value={colorHex}
              onChange={(e) => {
                setColorHex(e.target.value);
                if (errors.colorHex) setErrors((p) => ({ ...p, colorHex: undefined }));
              }}
              error={errors.colorHex}
              disabled={isLoading}
              className="font-mono"
              required
            />
          </div>

          {/* Quick Swatches Picker */}
          <div className="pt-2">
            <span className="text-xs text-on-surface-variant/70 font-semibold block mb-2 select-none">
              Quick select:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map((swatch) => {
                const isSelected = colorHex.toLowerCase() === swatch.hex.toLowerCase();
                return (
                  <button
                    key={swatch.hex}
                    type="button"
                    onClick={() => setColorHex(swatch.hex)}
                    title={swatch.name}
                    className={`h-7 w-7 rounded-full border transition-all cursor-pointer hover:scale-110 active:scale-95
                      ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20 scale-105 shadow-sm"
                          : "border-outline-variant hover:border-on-surface"
                      }
                    `}
                    style={{ backgroundColor: swatch.hex }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryForm;
