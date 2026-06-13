"use client";

import React, { useState } from "react";

interface Category {
  id: string;
  name: string;
  count?: number;
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-outline-variant bg-surface-container-lowest h-screen shadow-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-outline-variant bg-surface-container-low/50 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-label-md font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">filter_list</span>
            Categories
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-label-sm text-primary hover:text-primary-hover font-semibold transition flex items-center gap-0.5"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category search input */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category..."
            className="w-full pl-8 pr-8 py-1.5 text-body-xs bg-surface-container border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary/30 transition text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {filteredCategories.map((cat) => {
          const active = selectedCategories.has(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryToggle(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-body-sm transition-all duration-150 group cursor-pointer ${
                active
                  ? "bg-primary text-on-primary font-semibold shadow-sm scale-[0.98]"
                  : "text-on-surface hover:bg-surface-container-high active:scale-[0.98]"
              }`}
            >
              <span className="truncate flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                    active ? "bg-on-primary scale-125" : "bg-outline-variant group-hover:bg-primary"
                  }`}
                />
                {cat.name}
              </span>
              {typeof cat.count === "number" && cat.count > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    active
                      ? "bg-on-primary/20 text-on-primary"
                      : "bg-surface-container-highest text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary"
                  }`}
                >
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}
        {filteredCategories.length === 0 && (
          <div className="text-center py-6 text-label-md text-on-surface-variant">
            {searchQuery ? "No matches found" : "No categories yet"}
          </div>
        )}
      </div>
    </aside>
  );
}

export default KDSSidebar;
