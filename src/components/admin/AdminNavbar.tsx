"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

const NAV_ITEMS = [
  { label: "Products", href: "/admin/products", icon: "inventory_2" },
  { label: "Categories", href: "/admin/categories", icon: "category" },
  { label: "Payments", href: "/admin/payment-methods", icon: "payments" },
  { label: "Promotions", href: "/admin/promotions", icon: "sell" },
  { label: "Floors", href: "/admin/floors", icon: "layers" },
  { label: "Users", href: "/admin/users", icon: "group" },
  { label: "Reports", href: "/admin/reports", icon: "assessment" },
  { label: "Session", href: "/admin/session", icon: "point_of_sale" },
];

const EXTERNAL_ITEMS = [
  { label: "KDS", href: "/kds", icon: "restaurant" },
];

export const AdminNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 z-40 flex-col bg-surface-container-low border-r border-outline-variant">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-headline-sm">
              O
            </div>
            <div>
              <div className="text-headline-sm font-black text-primary leading-tight">Backend</div>
              <div className="text-label-md text-on-surface-variant">Management</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md font-semibold transition-all ${active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-outline-variant space-y-0.5">
          <Link
            href="/kds"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">restaurant</span>
            KDS
            <span className="material-symbols-outlined text-[14px] ml-auto opacity-50">open_in_new</span>
          </Link>
          <Link
            href="/pos"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            POS Terminal
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-label-md text-danger hover:bg-error-container/20 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg"
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-headline-sm font-black text-primary">Odoo POS</span>
        <Link href="/pos" className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg">
          <span className="material-symbols-outlined">point_of_sale</span>
        </Link>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-surface-container-low flex flex-col h-full shadow-xl">
            <div className="px-6 py-5 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <span className="text-headline-sm font-black text-primary">Odoo POS</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 text-on-surface-variant"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md font-semibold transition-all ${active
                        ? "bg-primary-container text-on-primary-container"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-outline-variant space-y-0.5">
              <Link
                href="/kds"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-label-md text-on-surface-variant hover:bg-surface-container-high transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
                KDS
                <span className="material-symbols-outlined text-[14px] ml-auto opacity-50">open_in_new</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-label-md text-danger hover:bg-error-container/20 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Log Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
