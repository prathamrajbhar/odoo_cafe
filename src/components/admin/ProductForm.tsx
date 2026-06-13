"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/shared/Modal";
import Input from "@/components/shared/Input";
import Select from "@/components/shared/Select";
import Button from "@/components/shared/Button";
import CategoryForm from "./CategoryForm";
import { productCreateSchema, productUpdateSchema } from "@/schemas/product";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: string | number;
  taxRate: number;
  description: string | null;
}

export interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryOption[];
  productToEdit?: Product | null;
  onRefreshCategories: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  productToEdit = null,
  onRefreshCategories,
}) => {
  const isEditing = !!productToEdit;

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [taxRate, setTaxRate] = useState<string>("5");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    categoryId?: string;
    price?: string;
    taxRate?: string;
    description?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Load values when editing
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setCategoryId(productToEdit.categoryId);
      setPrice(productToEdit.price.toString());
      setTaxRate(productToEdit.taxRate.toString());
      setDescription(productToEdit.description || "");
    } else {
      setName("");
      setCategoryId(categories[0]?.id || "");
      setPrice("");
      setTaxRate("5");
      setDescription("");
    }
    setErrors({});
  }, [productToEdit, categories, isOpen]);

  const handleInlineCategorySuccess = (newCategory: any) => {
    // Refresh the categories list in the parent
    onRefreshCategories();
    // Auto-select the newly created category
    setCategoryId(newCategory.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Parse values for validation
    const parsedPrice = parseFloat(price);
    const parsedTax = parseInt(taxRate);

    const payload = {
      name,
      categoryId,
      price: isNaN(parsedPrice) ? undefined : parsedPrice,
      taxRate: isNaN(parsedTax) ? undefined : (parsedTax as 5 | 18 | 28),
      description: description || null,
    };

    const schema = isEditing ? productUpdateSchema : productCreateSchema;
    const result = schema.safeParse(payload);

    if (!result.success) {
      const formattedErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof typeof errors;
        formattedErrors[path] = err.message;
      });
      setErrors(formattedErrors);
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && productToEdit) {
        await api.put(`/products/${productToEdit.id}`, payload);
        toast.success("Product updated successfully!");
      } else {
        await api.post("/products", payload);
        toast.success("Product created successfully!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? "Edit Product" : "Create New Product"}
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name */}
          <Input
            label="Product Name"
            placeholder="e.g. Double Espresso, Butter Croissant"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isLoading}
            required
          />

          {/* Category Dropdown Selector */}
          <div className="flex gap-2 items-end w-full">
            <div className="flex-1">
              <Select
                label="Product Category"
                placeholder={categories.length === 0 ? "No categories available" : undefined}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                error={errors.categoryId}
                disabled={isLoading || categories.length === 0}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="touch-target h-[44px] px-3 bg-surface-container hover:bg-surface-container-high border border-available-border rounded-default text-primary hover:text-primary-container transition-all flex items-center justify-center font-bold text-lg select-none cursor-pointer"
              title="Add New Category"
            >
              +
            </button>
          </div>

          {/* Price & Tax Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price (INR)"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              error={errors.price}
              disabled={isLoading}
              required
            />

            <Select
              label="Tax Rate (GST)"
              options={[
                { value: "5", label: "5% (Standard Cafe)" },
                { value: "18", label: "18% (Beverages)" },
                { value: "28", label: "28% (Luxury items)" },
              ]}
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              error={errors.taxRate}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-label-md text-on-surface-variant font-semibold select-none">
              Description (Optional)
            </label>
            <textarea
              placeholder="e.g. Arabica beans double shot extraction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-body-md bg-surface-container-lowest text-on-surface border border-available-border rounded-default transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-on-surface-variant/50 min-h-[80px]"
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-xs text-error font-medium">{errors.description}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Inline Category Creation Modal */}
      <CategoryForm
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleInlineCategorySuccess}
      />
    </>
  );
};

export default ProductForm;
