"use client";

import React, { useState } from "react";
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
  const [isArchivingId, setIsArchivingId] = useState<string | null>(null);
  const pageSize = 8; // Fits nicely on desktop dashboards

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

  return (
    <div className="space-y-4 select-none">
      <div className="w-full overflow-x-auto border border-available-border bg-surface-container-lowest rounded-lg shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-surface-container-low border-b border-available-border text-label-md text-on-surface-variant select-none">
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
                <td colSpan={6} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => {
                const catColor = product.category?.colorHex || "#57344f";
                const isRowLoading = isArchivingId === product.id;

                return (
                  <tr
                    key={product.id}
                    className="text-body-sm text-on-surface hover:bg-surface-container-low/40 transition-colors duration-150"
                  >
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
                          disabled={isRowLoading}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchive(product.id, product.name)}
                          isLoading={isRowLoading}
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
