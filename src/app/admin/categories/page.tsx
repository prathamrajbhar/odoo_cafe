"use client";

import React, { useState, useEffect, useCallback } from "react";
import CategoryList from "@/components/admin/CategoryList";
import CategoryForm from "@/components/admin/CategoryForm";
import Button from "@/components/shared/Button";
import { SkeletonTable } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response: any = await api.get("/categories");
      setCategories(response.data.categories || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-available-border pb-5 select-none">
        <div>
          <h1 className="text-headline-lg text-primary font-bold">
            Product Categories
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1.5">
            Manage category divisions and visual color groupings.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsFormOpen(true)}
          leftIcon={
            <svg className="h-5 w-5 text-current" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        >
          New Category
        </Button>
      </div>

      {/* Categories Content Grid */}
      <div className="pt-2">
        {isLoading ? (
          <SkeletonTable rows={4} cols={4} />
        ) : (
          <CategoryList categories={categories} onRefresh={fetchCategories} />
        )}
      </div>

      {/* Creation Modal Form */}
      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
