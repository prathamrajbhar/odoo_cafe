import React from "react";

// Standard Spinner component
export const Spinner: React.FC<{ size?: "sm" | "md" | "lg"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "h-4 w-4 stroke-[3]",
    md: "h-8 w-8 stroke-[2.5]",
    lg: "h-12 w-12 stroke-[2]",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-primary ${sizes[size]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// Skeleton text row
export const SkeletonText: React.FC<{ width?: string; height?: string; className?: string }> = ({
  width = "w-full",
  height = "h-4",
  className = "",
}) => {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-sm ${width} ${height} ${className}`}
    />
  );
};

// Skeleton card (for products)
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse bg-surface-container-lowest border border-available-border rounded-lg p-4 flex flex-col justify-between h-[120px] ${className}`}
    >
      <div className="space-y-2">
        <SkeletonText width="w-3/4" height="h-5" />
        <SkeletonText width="w-1/2" height="h-3" />
      </div>
      <div className="flex justify-between items-center mt-4">
        <SkeletonText width="w-1/4" height="h-4" />
        <SkeletonText width="w-1/3" height="h-6" className="rounded-default" />
      </div>
    </div>
  );
};

// Skeleton Table (for orders, user accounts, and list tables)
export const SkeletonTable: React.FC<{ rows?: number; cols?: number; className?: string }> = ({
  rows = 5,
  cols = 4,
  className = "",
}) => {
  return (
    <div className={`w-full overflow-hidden border border-available-border rounded-lg bg-surface-container-lowest ${className}`}>
      <div className="flex border-b border-available-border bg-surface-container-low p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <SkeletonText width="w-2/3" height="h-4" />
          </div>
        ))}
      </div>
      <div className="divide-y divide-available-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex p-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1 px-2">
                <SkeletonText width={c === 0 ? "w-1/2" : "w-5/6"} height="h-4" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Loading: React.FC<{ fullPage?: boolean; size?: "sm" | "md" | "lg" }> = ({
  fullPage = false,
  size = "md",
}) => {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center gap-3">
        <Spinner size={size} />
        <p className="text-body-sm text-on-surface-variant font-medium tracking-wide">
          Loading Odoo Cafe POS...
        </p>
      </div>
    );
  }
  return <Spinner size={size} />;
};

export default Loading;
