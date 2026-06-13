"use client";

import React from "react";

interface Floor {
  id: string;
  name: string;
}

interface SidebarToolsProps {
  floors: Floor[];
  selectedFloorId: string | null;
  onSelectFloor: (id: string) => void;
  onAddFloor: () => void;
  onEditFloor: (id: string, name: string) => void;
  onDeleteFloor: (id: string) => void;
  onAddTableOfShape: (shape: "SQUARE" | "ROUND") => void;
}

export const SidebarTools: React.FC<SidebarToolsProps> = ({
  floors,
  selectedFloorId,
  onSelectFloor,
  onAddFloor,
  onEditFloor,
  onDeleteFloor,
  onAddTableOfShape,
}) => {
  return (
    <aside className="w-60 bg-surface-container-lowest border-r border-outline-variant flex flex-col gap-0 overflow-y-auto shrink-0 z-10">
      {/* Floors section */}
      <div className="p-4 border-b border-outline-variant">
        <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="2 3 6 3 6 21 2 21" /><polygon points="10 3 14 3 14 21 10 21" /><polygon points="18 3 22 3 22 21 18 21" />
          </svg>
          Floors
        </h3>
        <div className="flex flex-col gap-1">
          {floors.map((floor) => {
            const isSelected = selectedFloorId === floor.id;
            return (
              <div key={floor.id} className="group flex items-center gap-0.5">
                <button
                  onClick={() => onSelectFloor(floor.id)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg text-label-md font-medium transition-all truncate
                    ${isSelected
                      ? "bg-primary-container text-on-primary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                >
                  {floor.name}
                </button>
                <button
                  onClick={() => onEditFloor(floor.id, floor.name)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container transition-all"
                  title="Rename floor"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteFloor(floor.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-on-surface-variant/50 hover:text-danger hover:bg-error-container/20 transition-all"
                  title="Delete floor"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            );
          })}
          <button
            onClick={onAddFloor}
            className="flex items-center gap-2 px-3 py-2 mt-1 border border-dashed border-outline-variant text-on-surface-variant/60 rounded-lg text-label-md w-full justify-center hover:bg-surface-container hover:text-primary hover:border-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Floor
          </button>
        </div>
      </div>

      {/* Elements palette */}
      <div className="p-4 border-b border-outline-variant">
        <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Elements
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAddTableOfShape("SQUARE")}
            className="border border-outline-variant rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all bg-surface active:scale-95 group"
          >
            <div className="w-9 h-9 border-2 border-outline-variant group-hover:border-primary/50 bg-surface-container rounded-md flex items-center justify-center text-xs font-bold text-on-surface-variant transition-colors">
              T
            </div>
            <span className="text-label-sm text-on-surface-variant">Square</span>
          </button>
          <button
            onClick={() => onAddTableOfShape("ROUND")}
            className="border border-outline-variant rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all bg-surface active:scale-95 group"
          >
            <div className="w-9 h-9 border-2 border-outline-variant group-hover:border-primary/50 bg-surface-container rounded-full flex items-center justify-center text-xs font-bold text-on-surface-variant transition-colors">
              T
            </div>
            <span className="text-label-sm text-on-surface-variant">Round</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 mt-auto">
        <h3 className="text-label-sm font-bold text-on-surface-variant uppercase tracking-widest mb-3 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Legend
        </h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 border border-[#9BBFB0] bg-[#EAF4F0] rounded-sm shrink-0" />
            <span className="text-body-sm text-on-surface-variant">Available</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 border-2 border-primary bg-primary-container rounded-sm shrink-0" />
            <span className="text-body-sm text-on-surface-variant">Selected / Edit</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 border-2 border-dashed border-outline-variant bg-surface rounded-sm shrink-0" />
            <span className="text-body-sm text-on-surface-variant">Inactive</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
