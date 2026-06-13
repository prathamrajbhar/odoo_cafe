import React from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
