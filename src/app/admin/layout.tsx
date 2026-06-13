import React from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <AdminNavbar />
      {/* Sidebar takes 256px on desktop; mobile gets top-bar padding */}
      <main className="md:ml-64 pt-16 md:pt-0 min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
