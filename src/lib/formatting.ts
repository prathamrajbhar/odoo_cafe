// Data formatting helper utilities for Odoo Cafe POS

/**
 * Formats a numeric value into Indian Rupee (INR) currency representation
 * Example: 120 -> ₹120.00, 1500.5 -> ₹1,500.50
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats a Date object or string/timestamp into a readable POS terminal date string
 * Example: Date -> Nov 25, 2026, 14:30
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(d);
}

/**
 * Formats a decimal number to a specific precision length
 * Example: formatNumber(5.6789, 2) -> "5.68"
 */
export function formatNumber(value: number | string, decimals = 2): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toFixed(decimals);
}