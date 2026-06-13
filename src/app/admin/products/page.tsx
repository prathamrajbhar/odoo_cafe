"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProductList from "@/components/admin/ProductList";
import ProductFilters from "@/components/admin/ProductFilters";
import ProductForm from "@/components/admin/ProductForm";
import Button from "@/components/shared/Button";
import { SkeletonTable } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);

  // Filters state
  const [filters, setFilters] = useState({ search: "", categoryId: "" });

  const fetchCategories = useCallback(async () => {
    try {
      const response: any = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response: any = await api.get("/products");
      setProducts(response.data.products || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    }
  }, []);

  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchCategories(), fetchProducts()]);
    setIsLoading(false);
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  // Client-side filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory =
        !filters.categoryId ||
        product.categoryId === filters.categoryId;

      return matchesSearch && matchesCategory;
    });
  }, [products, filters]);

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setIsFormOpen(true);
  };

  const handleNewProduct = () => {
    setProductToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5 select-none">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">
            Products
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1.5">
            Configure menu options, pricing details, and tax regulations.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleNewProduct}
          leftIcon={
            <svg className="h-5 w-5 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          New Product
        </Button>
      </div>

      {/* Filter panel */}
      <ProductFilters categories={categories} onFilterChange={setFilters} />

      {/* Products list grid */}
      <div className="pt-2">
        {isLoading ? (
          <SkeletonTable rows={6} cols={6} />
        ) : (
          <ProductList
            products={filteredProducts}
            onEdit={handleEdit}
            onRefresh={fetchProducts}
          />
        )}
      </div>

      {/* Creation & Editing Modal Form */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setProductToEdit(null);
        }}
        onSuccess={loadPageData}
        categories={categories}
        productToEdit={productToEdit}
        onRefreshCategories={fetchCategories}
      />
    </div>
  );
}
