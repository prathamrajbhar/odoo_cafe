"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";


export const POSNavbar: React.FC = () => {
  const router = useRouter();
  const { activeTable, setActiveModal } = usePOS();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post("/auth/logout");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-surface-container-lowest border-b border-outline-variant flex items-center gap-2 px-3">
        {/* Logo */}
        <Link href="/pos" className="flex items-center gap-2 shrink-0 mr-1">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container font-black text-label-lg">
            O
          </div>
          <span className="text-label-lg font-black text-primary hidden sm:block">Odoo Cafe</span>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Table indicator */}
        <button
          onClick={() => setActiveModal("floor")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">table_restaurant</span>
          <span className="hidden sm:block">
            {activeTable ? `Table ${activeTable.number}` : "Select Table"}
          </span>
        </button>

        {/* Orders icon */}
        <button
          onClick={() => setActiveModal("orders")}
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Orders"
        >
          <span className="material-symbols-outlined text-[22px]">receipt_long</span>
        </button>

        {/* Table view icon */}
        <button
          onClick={() => setActiveModal("tables")}
          className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Table view"
        >
          <span className="material-symbols-outlined text-[22px]">grid_view</span>
        </button>



        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-lg text-error hover:bg-error-container/20 transition-colors disabled:opacity-50"
          aria-label="Log Out"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
        </button>
      </header>


    </>
  );
};

export default POSNavbar;
