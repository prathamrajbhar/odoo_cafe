import React, { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = "button",
  ...props
}) => {
  // Styles mapping to Stitch Corporate Modern design system
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-default transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-target active:scale-[0.98]";

  const variants = {
    primary: "bg-primary text-on-primary hover:bg-primary-container active:bg-primary hover:shadow-sm",
    secondary: "bg-secondary text-on-secondary hover:bg-secondary/90 active:bg-secondary hover:shadow-sm",
    danger: "bg-danger text-white hover:bg-danger/90 active:bg-danger hover:shadow-sm",
    outline:
      "border border-outline text-on-surface hover:bg-surface-container-low active:bg-surface-container-high",
    ghost: "text-on-surface hover:bg-surface-container-low active:bg-surface-container-high",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-body-sm gap-1.5",
    md: "px-4 py-2 text-body-md gap-2",
    lg: "px-6 py-3 text-body-lg gap-2.5",
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
