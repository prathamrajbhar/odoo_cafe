import React, { HTMLAttributes, ReactNode } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | "occupied";
  children: ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded-full text-mono-label font-bold uppercase tracking-wider text-xs border";

  const variants = {
    primary: "bg-primary-container/20 border-primary/30 text-primary",
    secondary: "bg-secondary-container/20 border-secondary/30 text-secondary",
    success: "bg-success/10 border-success/30 text-[#28A745]",
    warning: "bg-warning/10 border-warning/30 text-[#D4A017]",
    danger: "bg-error-container text-on-error-container border-error/20",
    neutral: "bg-surface-container-high border-outline-variant text-on-surface-variant",
    occupied: "bg-occupied-pink border-occupied-text/20 text-occupied-text",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
