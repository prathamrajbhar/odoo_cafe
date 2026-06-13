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
  stock: number;
  description: string | null;
  category: Category;
}

export interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onRefresh: () => void;
}

const getReadableColor = (hex: string): string => {
  let c = hex.replace(/^#/, "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  if (c.length !== 6) return hex;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance > 0.65) {
    return `#${Math.floor(r * 0.45).toString(16).padStart(2, "0")}${Math.floor(g * 0.45).toString(16).padStart(2, "0")}${Math.floor(b * 0.45).toString(16).padStart(2, "0")}`;
  }
  return hex;
};

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10 text-error text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        Out of Stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[11px] font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
        {stock} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[11px] font-bold">
      <span className="w-1.5 h-1.5 rounded-full bg-success" />
      {stock}
    </span>
  );
}

function RestockModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [qty, setQty] = useState("10");
  const [loading, setLoading] = useState(false);

  const handleRestock = async () => {
    const n = parseInt(qty);
    if (isNaN(n) || n < 1) { toast.error("Enter a valid quantity"); return; }
    setLoading(true);
    try {
      await api.patch(`/products/${product.id}/restock`, { quantity: n });
      toast.success(`Added ${n} units to "${product.name}"`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Restock failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div>
          <h3 className="text-label-lg font-bold text-on-surface">Restock Product</h3>
          <p className="text-body-sm text-on-surface-variant mt-1">
            <span className="font-semibold">{product.name}</span> — current stock: <span className="font-semibold">{product.stock}</span>
          </p>
        </div>
        <div>
          <label className="text-label-md text-on-surface-variant font-semibold block mb-1.5">
            Quantity to add
          </label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3.5 py-2.5 text-body-md bg-surface-container border border-available-border rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            autoFocus
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRestock} isLoading={loading} className="flex-1">
            Add Stock
          </Button>
        </div>
      </div>
    </div>
  );
}

export const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isArchivingId, setIsArchivingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const pageSize = 8;

  useEffect(() => {
    const productIds = new Set(products.map((p) => p.id));
    setSelectedIds((prev) => prev.filter((id) => productIds.has(id)));
  }, [products]);

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"?`)) return;
    setIsArchivingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product archived successfully!");
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to archive product");
    } finally {
      setIsArchivingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Archive ${selectedIds.length} selected products?`)) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => api.delete(`/products/${id}`)));
      toast.success("Selected products archived!");
      setSelectedIds([]);
      onRefresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to archive some products");
      onRefresh();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = products.slice(startIndex, endIndex);

  const pageProductIds = paginatedProducts.map((p) => p.id);
  const isAllSelected = pageProductIds.length > 0 && pageProductIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = pageProductIds.length > 0 && pageProductIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckboxRef.current) headerCheckboxRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageProductIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const next = [...prev];
        pageProductIds.forEach((id) => { if (!next.includes(id)) next.push(id); });
        return next;
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <>
      {restockProduct && (
        <RestockModal
          product={restockProduct}
          onClose={() => setRestockProduct(null)}
          onSuccess={onRefresh}
        />
      )}

      <div className="space-y-4 select-none">
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-primary/5 border border-primary/20 rounded-lg shadow-sm">
            <div className="text-body-sm text-on-surface-variant font-medium">
              <span className="font-semibold text-primary">{selectedIds.length}</span>{" "}
              {selectedIds.length === 1 ? "product" : "products"} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} disabled={isBulkDeleting}>
                Clear Selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                isLoading={isBulkDeleting}
                leftIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-available-border text-label-md text-on-surface-variant select-none">
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs w-12 text-center align-middle">
                  <label className="inline-flex items-center justify-center cursor-pointer group">
                    <input type="checkbox" ref={headerCheckboxRef} className="sr-only peer" checked={isAllSelected} onChange={handleToggleSelectAll} />
                    <span className={`w-4 h-4 flex items-center justify-center rounded border transition-all ${isAllSelected || isSomeSelected ? "bg-primary border-primary text-on-primary" : "border-outline bg-surface-container-lowest group-hover:border-primary"}`}>
                      {isAllSelected && <svg className="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                      {!isAllSelected && isSomeSelected && <span className="w-2 h-0.5 bg-current rounded-full" />}
                    </span>
                  </label>
                </th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Product Name</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Category</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Price</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Tax</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Stock</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs">Description</th>
                <th className="px-5 py-3.5 font-bold tracking-wide text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-available-border">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-body-sm text-on-surface-variant/75 italic">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const catColor = getReadableColor(product.category?.colorHex || "#57344f");
                  const isRowLoading = isArchivingId === product.id;
                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr
                      key={product.id}
                      className={`text-body-sm text-on-surface hover:bg-surface-container-low/40 transition-colors ${isSelected ? "bg-surface-container-low/60" : ""}`}
                    >
                      <td className="px-5 py-3.5 align-middle text-center w-12">
                        <label className="inline-flex items-center justify-center cursor-pointer group">
                          <input type="checkbox" className="sr-only peer" checked={isSelected} onChange={() => handleToggleSelect(product.id)} disabled={isRowLoading || isBulkDeleting} />
                          <span className={`w-4 h-4 flex items-center justify-center rounded border transition-all ${isSelected ? "bg-primary border-primary text-on-primary" : "border-outline bg-surface-container-lowest group-hover:border-primary"} peer-disabled:opacity-50`}>
                            {isSelected && <svg className="w-3 h-3 stroke-current stroke-[3] fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                          </span>
                        </label>
                      </td>

                      <td className="px-5 py-3.5 align-middle font-bold text-body-md">{product.name}</td>

                      <td className="px-5 py-3.5 align-middle">
                        <Badge style={{ backgroundColor: `${catColor}12`, borderColor: `${catColor}33`, color: catColor }}>
                          {product.category?.name || "Uncategorized"}
                        </Badge>
                      </td>

                      <td className="px-5 py-3.5 align-middle font-semibold text-[#1b5e20]">
                        {formatCurrency(product.price)}
                      </td>

                      <td className="px-5 py-3.5 align-middle font-medium text-on-surface-variant">
                        {product.taxRate}%
                      </td>

                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <StockBadge stock={product.stock ?? 0} />
                          <button
                            onClick={() => setRestockProduct(product)}
                            disabled={isRowLoading || isBulkDeleting}
                            title="Restock"
                            className="p-1 rounded-lg text-on-surface-variant/60 hover:text-primary hover:bg-primary/10 transition-all disabled:opacity-40 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 align-middle text-on-surface-variant/90 max-w-xs truncate" title={product.description || ""}>
                        {product.description || "—"}
                      </td>

                      <td className="px-5 py-3.5 align-middle text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => onEdit(product)} disabled={isRowLoading || isBulkDeleting}>
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container-lowest border border-available-border rounded-lg shadow-sm">
            <div className="text-body-sm text-on-surface-variant/80 font-medium">
              Showing <span className="font-semibold text-on-surface">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-on-surface">{endIndex}</span> of{" "}
              <span className="font-semibold text-on-surface">{totalItems}</span> products
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductList;
