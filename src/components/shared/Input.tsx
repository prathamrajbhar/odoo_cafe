import React, { forwardRef, InputHTMLAttributes, ReactNode, useId } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;


    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-label-md text-on-surface-variant font-semibold select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-outline pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full py-2.5 text-body-md bg-surface-container-lowest text-on-surface border rounded-default transition-all duration-200 outline-none focus:ring-2 focus:ring-primary/10 touch-target
              ${leftIcon ? "pl-11" : "pl-3.5"}
              ${rightIcon ? "pr-11" : "pr-3.5"}
              ${
                error
                  ? "border-error focus:border-error focus:ring-error/10"
                  : "border-available-border focus:border-primary"
              } 
              ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center justify-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = "Input";

export default Input;
