import React, { forwardRef, SelectHTMLAttributes, useId } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helperText, placeholder, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;


    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="text-label-md text-on-surface-variant font-semibold select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full px-3.5 py-2.5 text-body-md bg-surface-container-lowest text-on-surface border rounded-default transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/10 touch-target cursor-pointer appearance-none pr-10
              ${
                error
                  ? "border-error focus:border-error focus:ring-error/10"
                  : "border-available-border focus:border-primary"
              } 
              ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom Arrow Down Icon */}
          <span className="absolute right-3.5 text-on-surface-variant pointer-events-none flex items-center justify-center">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>

        {error ? (
          <p className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-on-surface-variant/70 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
