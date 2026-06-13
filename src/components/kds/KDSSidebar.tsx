"use client";

import React from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  selectedCategories: Set<string>;
  onCategoryToggle: (id: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function KDSSidebar({
  categories,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
  hasActiveFilters,
}: Props) {
  return (
    <aside className="w-56 shrink-0 flex flex-col gap-4 p-4 border-r border-outline-variant bg-surface-container-lowest h-screen overflow-y-auto">
      {/* Category filter */}
      <div>
        <label className="text-label-md text-on-surface-variant uppercase tracking-wider mb-2 block">
          Category
        </label>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const active = selectedCategories.has(cat.id);
            return (
              <li key={cat.id}>
                <button
                  onClick={() => onCategoryToggle(cat.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-body-sm transition-colors ${
                    active
                      ? "bg-primary text-on-primary font-semibold"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            );
          })}
          {categories.length === 0 && (
            <li className="text-label-md text-on-surface-variant px-3 py-2">No categories yet</li>
          )}
        </ul>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="mt-auto text-label-md text-primary hover:underline text-left"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}

export default KDSSidebar;
