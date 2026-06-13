import React, { ReactNode } from "react";
import { SkeletonTable } from "./Loading";

export interface TableColumn {
  key: string;
  header: ReactNode;
  className?: string;
}

export interface TableProps {
  columns: TableColumn[];
  rows: Record<string, any>[];
  renderRowCell?: (row: any, key: string, rowIndex: number) => ReactNode;
  onRowClick?: (row: any, rowIndex: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  rows,
  renderRowCell,
  onRowClick,
  isLoading = false,
  emptyMessage = "No records found.",
  className = "",
}) => {
  if (isLoading) {
    return <SkeletonTable rows={5} cols={columns.length} />;
  }

  const handleRowClick = (row: any, index: number) => {
    if (onRowClick) {
      onRowClick(row, index);
    }
  };

  return (
    <div className={`w-full overflow-x-auto border border-available-border rounded-lg bg-surface-container-lowest shadow-sm ${className}`}>
      <table className="w-full text-left border-collapse min-w-[500px]">
        {/* Table Header */}
        <thead>
          <tr className="bg-surface-container-low border-b border-available-border text-label-md text-on-surface-variant select-none">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3.5 font-bold tracking-wide text-xs ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-available-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-body-sm text-on-surface-variant/70 italic"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <svg
                    className="h-8 w-8 text-on-surface-variant/40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25m-2.25-2.25l-2.25 2.25m2.25-2.25l2.25-2.25M3.75 7.5L5.621 3.82a2.25 2.25 0 011.986-1.17h8.786a2.25 2.25 0 011.986 1.17L20.25 7.5m-16.5 0h16.5"
                    />
                  </svg>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => handleRowClick(row, rowIndex)}
                className={`text-body-sm text-on-surface transition-colors duration-150
                  ${onRowClick ? "hover:bg-surface-container-low cursor-pointer" : "hover:bg-surface-container-lowest"}
                `}
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  return (
                    <td
                      key={col.key}
                      className={`px-5 py-3.5 font-medium ${col.className || ""}`}
                    >
                      {renderRowCell ? renderRowCell(row, col.key, rowIndex) : val}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
