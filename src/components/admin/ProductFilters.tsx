"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "@/components/shared/SearchBar";
import Select from "@/components/shared/Select";
import Button from "@/components/shared/Button";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFiltersProps {
  categories: CategoryOption[];
  onFilterChange: (filters: { search: string; categoryId: string }) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  onFilterChange,
}) => {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    onFilterChange({ search, categoryId });
  }, [search, categoryId, onFilterChange]);

  const handleClear = () => {
    setSearch("");
    setCategoryId("");
  };

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-end bg-surface-container-lowest border border-available-border p-4.5 rounded-lg shadow-sm w-full select-none">
      {/* Search Bar */}
      <div className="flex-1 w-full">
        <label className="text-label-md text-on-surface-variant font-semibold select-none mb-1.5 block">
          Search Products
        </label>
        <SearchBar
          onSearch={setSearch}
          initialValue={search}
          placeholder="Search by product name..."
        />
      </div>

      {/* Category Dropdown */}
      <div className="w-full sm:w-60">
        <Select
          label="Category Filter"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>

      {/* Clear Button */}
      {(search || categoryId) && (
        <Button
          variant="outline"
          onClick={handleClear}
          className="h-[44px] w-full sm:w-auto px-4 text-body-sm touch-target"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export default ProductFilters;
