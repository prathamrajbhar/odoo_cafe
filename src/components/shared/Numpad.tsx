import React from "react";

export type NumpadMode = "qty" | "disc" | "price";

export interface NumpadProps {
  onKeyPress: (key: string) => void;
  activeMode?: NumpadMode;
  onModeChange?: (mode: NumpadMode) => void;
  className?: string;
}

export const Numpad: React.FC<NumpadProps> = ({
  onKeyPress,
  activeMode = "qty",
  onModeChange,
  className = "",
}) => {
  const numberKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+/-", "0", "."];

  const handleModeClick = (mode: NumpadMode) => {
    if (onModeChange) {
      onModeChange(mode);
    } else {
      onKeyPress(`mode-${mode}`);
    }
  };

  const getModeClass = (mode: NumpadMode) => {
    return activeMode === mode
      ? "bg-primary text-on-primary font-bold shadow-md scale-[0.98]"
      : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:bg-surface-container-high";
  };

  return (
    <div className={`flex flex-col gap-3 p-3 bg-surface-container border border-available-border rounded-lg select-none w-full max-w-[340px] ${className}`}>
      <div className="grid grid-cols-4 gap-2">
        {/* Numpad numbers (cols 1-3) & Actions (col 4) */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {numberKeys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onKeyPress(key)}
              className="touch-target min-h-[50px] min-w-[50px] flex items-center justify-center text-body-lg font-semibold rounded-default bg-surface-container-lowest border border-available-border text-on-surface hover:bg-surface-container-low active:bg-surface-container-high active:scale-[0.95] transition-all cursor-pointer"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Right action column */}
        <div className="col-span-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => handleModeClick("qty")}
            className={`touch-target min-h-[50px] flex items-center justify-center text-body-sm font-semibold rounded-default transition-all cursor-pointer ${getModeClass("qty")}`}
          >
            Qty
          </button>
          <button
            type="button"
            onClick={() => handleModeClick("disc")}
            className={`touch-target min-h-[50px] flex items-center justify-center text-body-sm font-semibold rounded-default transition-all cursor-pointer ${getModeClass("disc")}`}
          >
            % Disc
          </button>
          <button
            type="button"
            onClick={() => handleModeClick("price")}
            className={`touch-target min-h-[50px] flex items-center justify-center text-body-sm font-semibold rounded-default transition-all cursor-pointer ${getModeClass("price")}`}
          >
            Price
          </button>
          <button
            type="button"
            onClick={() => onKeyPress("Backspace")}
            className="touch-target min-h-[50px] flex items-center justify-center text-body-sm font-semibold rounded-default bg-surface-container-high text-on-surface hover:bg-surface-container-highest active:bg-surface-container-high active:scale-[0.95] transition-all cursor-pointer"
            aria-label="Backspace"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Clear Key at the bottom */}
      <button
        type="button"
        onClick={() => onKeyPress("Clear")}
        className="touch-target min-h-[48px] w-full flex items-center justify-center text-body-md font-bold rounded-default bg-danger text-white hover:bg-danger/90 active:bg-danger active:scale-[0.97] transition-all cursor-pointer"
      >
        Clear Key
      </button>
    </div>
  );
};

export default Numpad;
