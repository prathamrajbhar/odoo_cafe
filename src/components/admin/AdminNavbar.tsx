"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
      window.location.href = "/login";
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
    }
  };

  const navItems = [
    { name: "Products", href: "/admin/products" },
    { name: "Categories", href: "/admin/categories" },
    { name: "Floors & Tables", href: "/admin/floors" },
    { name: "Payment Methods", href: "/admin/payment-methods" },
    { name: "Promotions", href: "/admin/promotions" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Session", href: "/admin/session" },
    { name: "Employees", href: "/admin/users" },
  ];

  const getLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `text-body-sm font-semibold px-3 py-2 rounded-default transition-all duration-150
      ${
        isActive
          ? "bg-primary-container text-on-primary-container"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
      }`;
  };

  return (
    <header className="bg-surface-container-lowest border-b border-available-border sticky top-0 z-40 select-none">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/pos" className="text-headline-sm text-primary font-bold tracking-tight">
            Odoo POS
          </Link>
          <span className="h-5 w-px bg-available-border hidden md:block" />
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="text-body-sm font-bold text-secondary border border-secondary/30 hover:bg-secondary-container/20 rounded-default px-3 py-1.5 transition-colors flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
            </svg>
            POS Terminal
          </Link>

          <button
            onClick={handleLogout}
            type="button"
            className="text-body-sm font-semibold text-danger border border-danger/20 hover:bg-error-container/20 rounded-default px-3 py-1.5 transition-colors flex items-center gap-1 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="md:hidden flex overflow-x-auto border-t border-available-border bg-surface-container-low px-4 py-2 gap-1.5 scrollbar-none">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${getLinkClass(item.href)} whitespace-nowrap`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </header>
  );
};

export default AdminNavbar;
