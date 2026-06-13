import React, { useState, useEffect, useRef, InputHTMLAttributes } from "react";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch: (value: string) => void;
  debounceTime?: number;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  debounceTime = 350,
  initialValue = "",
  placeholder = "Search products, categories, orders...",
  className = "",
  ...props
}) => {
  const [value, setValue] = useState(initialValue);
  const isMounted = useRef(false);

  // Sync initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce logic
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const handler = setTimeout(() => {
      onSearch(value);
    }, debounceTime);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceTime, onSearch]);

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Magnifier Glass SVG Icon */}
      <span className="absolute left-3.5 text-on-surface-variant flex items-center justify-center pointer-events-none">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 text-body-md bg-surface-container-lowest text-on-surface border border-outline-variant rounded-default transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/60 touch-target"
        {...props}
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-on-surface-variant hover:text-on-surface p-1 transition-colors rounded-full hover:bg-surface-container flex items-center justify-center cursor-pointer"
          aria-label="Clear search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
