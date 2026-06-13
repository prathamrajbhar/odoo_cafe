"use client";

import React, { useState, useEffect, useRef } from "react";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";
import { formatCurrency } from "@/lib/formatting";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export interface Category {
  id: string;
  name: string;
  colorHex: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: string | number;
  taxRate: number;
  description: string | null;
  category: Category;
}

export interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onRefresh,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchivingId, setIsArchivingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const pageSize = 8; // Fits nicely on desktop dashboards

  // Clean up selected IDs that are no longer in products list (e.g., if archived)
  useEffect(() => {
    const productIds = new Set(products.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => productIds.has(id)));
  }, [products]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive the product "${name}"?`)) {
      return;
    }

    setIsArchivingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product archived successfully!");
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive product");
    } finally {
      setIsArchivingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to archive the ${selectedIds.length} selected products?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/products/${id}`)));
      toast.success("Selected products archived successfully!");
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive some products");
      onRefresh();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Pagination calculations
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = products.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Selection calculations
  const pageProductIds = paginatedProducts.map((p) => p.id);
  const isAllSelected =
    pageProductIds.length > 0 &&
    pageProductIds.every((id) => selectedIds.includes(id));
  const isSomeSelected =
    pageProductIds.length > 0 &&
    pageProductIds.some((id) => selectedIds.includes(id)) &&
    !isAllSelected;

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageProductIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const newSelection = [...prev];
        pageProductIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 select-none">
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border border-primary/20 rounded-lg shadow-sm animate-fade-in">
          <div className="text-body-sm text-on-surface-variant font-medium">
            <span className="font-semibold text-primary">{selectedIds.length}</span>{" "}
            {selectedIds.length === 1 ? "product" : "products"} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              disabled={isBulkDeleting}
            >
              Clear Selection
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleBulkDelete}
              isLoading={isBulkDeleting}
              leftIcon={
                <svg className="h-4 w-4 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto border border-available-border bg-surface-container-lowest rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-available-border text-label-md text-on-surface-variant select-none">
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs w-12 text-center align-middle">
                <label className="inline-flex items-center justify-center cursor-pointer group">
                  <input
                    type="checkbox"
                    ref={headerCheckboxRef}
                    className="sr-only peer"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                  />
                  <span className={`w-4 h-4 flex items-center justify-center rounded border transition-all duration-200
                    peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
                    ${isAllSelected 
                      ? "bg-primary border-primary text-on-primary" 
                      : isSomeSelected 
                        ? "bg-primary border-primary text-on-primary" 
                        : "border-outline bg-surface-container-lowest group-hover:border-primary group-hover:bg-surface-container-low"
                    }
                  `}>
                    {isAllSelected && (
                      <svg className="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                    {!isAllSelected && isSomeSelected && (
                      <span className="w-2 h-0.5 bg-current rounded-full" />
                    )}
                  </span>
                </label>
              </th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Product Name</th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Category</th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Price</th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Tax (GST)</th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Description</th>
              <th className="px-5 py-3.5 font-bold tracking-wide text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-available-border">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const catColor = product.category?.colorHex || "#57344f";
                const isRowLoading = isArchivingId === product.id;
                const isSelected = selectedIds.includes(product.id);

                return (
                  <tr
                    key={product.id}
                    className={`text-body-sm text-on-surface hover:bg-surface-container-low/40 transition-colors duration-150 ${
                      isSelected ? "bg-surface-container-low/60" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-5 py-3.5 align-middle text-center w-12">
                      <label className="inline-flex items-center justify-center cursor-pointer group">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(product.id)}
                          disabled={isRowLoading || isBulkDeleting}
                        />
                        <span className={`w-4 h-4 flex items-center justify-center rounded border transition-all duration-200
                          peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1
                          ${isSelected 
                            ? "bg-primary border-primary text-on-primary" 
                            : "border-outline bg-surface-container-lowest group-hover:border-primary group-hover:bg-surface-container-low"
                          }
                          peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </span>
                      </label>
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3.5 align-middle font-bold text-body-md">
                      {product.name}
                    </td>

                    {/* Category (Dynamic colored badge) */}
                    <td className="px-5 py-3.5 align-middle">
                      <Badge
                        style={{
                          backgroundColor: `${catColor}12`,
                          borderColor: `${catColor}33`,
                          color: catColor,
                        }}
                      >
                        {product.category?.name || "Uncategorized"}
                      </Badge>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-3.5 align-middle font-semibold text-[#1b5e20]">
                      {formatCurrency(product.price)}
                    </td>

                    {/* Tax */}
                    <td className="px-5 py-3.5 align-middle font-medium text-on-surface-variant">
                      {product.taxRate}%
                    </td>

                    {/* Description */}
                    <td className="px-5 py-3.5 align-middle text-on-surface-variant/90 max-w-xs truncate" title={product.description || ""}>
                      {product.description || "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 align-middle text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(product)}
                          disabled={isRowLoading || isBulkDeleting}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(product.id, product.name)}
                          isLoading={isRowLoading}
                          disabled={isBulkDeleting}
                          className="text-danger hover:text-danger/95 hover:bg-error-container/20"
                        >
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest border border-available-border rounded-lg shadow-sm">
          <div className="text-body-sm text-on-surface-variant/80 font-medium">
            Showing <span className="font-semibold text-on-surface">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-on-surface">{endIndex}</span> of{" "}
            <span className="font-semibold text-on-surface">{totalItems}</span> products
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
