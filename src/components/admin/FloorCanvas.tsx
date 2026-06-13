"use client";

import React, { useRef } from "react";

export interface Table {
  id: string;
  number: number;
  seats: number;
  isActive: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: string;
}

interface FloorCanvasProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelectTable: (id: string | null) => void;
  onUpdateTablePosition: (id: string, x: number, y: number) => void;
  onDragEnd?: () => void;
  zoom: number;
}

export const FloorCanvas: React.FC<FloorCanvasProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
  onUpdateTablePosition,
  onDragEnd,
  zoom,
}) => {
  const dragInfoRef = useRef<{
    tableId: string;
    startX: number;
    startY: number;
    pointerStartX: number;
    pointerStartY: number;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, table: Table) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectTable(table.id);
    dragInfoRef.current = {
      tableId: table.id,
      startX: table.x,
      startY: table.y,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current) return;
    const { tableId, startX, startY, pointerStartX, pointerStartY } = dragInfoRef.current;
    const scale = zoom / 100;
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    let newX = Math.round(startX + (e.clientX - pointerStartX) / scale);
    let newY = Math.round(startY + (e.clientY - pointerStartY) / scale);
    newX = Math.max(0, Math.min(800 - table.width, newX));
    newY = Math.max(0, Math.min(600 - table.height, newY));
    // Snap to 10px grid
    newX = Math.round(newX / 10) * 10;
    newY = Math.round(newY / 10) * 10;

    onUpdateTablePosition(tableId, newX, newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfoRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragInfoRef.current = null;
    if (onDragEnd) onDragEnd();
  };

  return (
    <div
      className="flex-1 relative overflow-auto flex items-center justify-center p-8"
      onClick={() => onSelectTable(null)}
    >
      <div
        className="w-[800px] h-[600px] relative shrink-0 origin-center transition-transform duration-75 rounded-xl overflow-hidden shadow-sm"
        style={{
          transform: `scale(${zoom / 100})`,
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Kitchen label */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-white/60 border-b border-gray-200/80 flex items-center justify-center pointer-events-none select-none">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-gray-400">
            Kitchen Area
          </span>
        </div>

        {/* Bar area */}
        <div className="absolute bottom-0 right-0 w-56 h-28 bg-white/60 border-t border-l border-gray-200/80 flex items-center justify-center rounded-tl-xl pointer-events-none select-none">
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-gray-400">
            Bar Area
          </span>
        </div>

        {/* Entrance */}
        <div className="absolute bottom-0 left-28 w-28 border-t-4 border-dashed border-emerald-400/60 flex items-end justify-center pb-1 pointer-events-none select-none">
          <span className="text-[10px] font-bold text-emerald-500/70 uppercase tracking-wider">
            Entrance
          </span>
        </div>

        {/* Tables */}
        {tables.map((table) => {
          const isSelected = selectedTableId === table.id;
          const isRound = table.shape === "ROUND";

          return (
            <div
              key={table.id}
              style={{
                left: `${table.x}px`,
                top: `${table.y}px`,
                width: `${table.width}px`,
                height: `${table.height}px`,
              }}
              className={`absolute flex flex-col items-center justify-center cursor-move select-none touch-none z-10 transition-shadow duration-75
                ${isRound ? "rounded-full" : "rounded-xl"}
                ${
                  isSelected
                    ? "bg-primary-container border-2 border-primary shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                    : table.isActive
                    ? "bg-[#EAF4F0] border border-[#9BBFB0] hover:border-primary/60 hover:shadow-md"
                    : "bg-white border-2 border-dashed border-gray-300 opacity-60"
                }
              `}
              onPointerDown={(e) => handlePointerDown(e, table)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`text-sm font-bold leading-none ${isSelected ? "text-on-primary-container" : "text-on-surface"}`}>
                T{table.number}
              </span>
              {table.isActive ? (
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? "text-on-primary-container/70" : "text-on-surface-variant"}`}>
                  ⌀ {table.seats}
                </span>
              ) : (
                <span className="text-[10px] mt-0.5 text-gray-400">—</span>
              )}

              {/* Selection handles */}
              {isSelected && (
                <>
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-full shadow-sm" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-full shadow-sm" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-primary border-2 border-white rounded-full shadow-sm" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-primary border-2 border-white rounded-full shadow-sm" />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
