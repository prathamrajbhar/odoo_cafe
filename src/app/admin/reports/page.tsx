"use client";

import React, { useState, useEffect, useCallback } from "react";
import Reports from "@/components/admin/Reports";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function ReportsPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitial = useCallback(async () => {
    try {
      const [reportRes, usersRes, sessionsRes, productsRes]: any[] = await Promise.all([
        api.get("/reports?period=today"),
        api.get("/users"),
        api.get("/sessions"),
        api.get("/products"),
      ]);
      setInitialData(reportRes.data ?? null);
      setEmployees(
        (usersRes.data?.users ?? []).filter((u: any) => u.status === "ACTIVE")
      );
      setSessions(sessionsRes.data?.sessions ?? []);
      setProducts(productsRes.data?.products ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-container-high rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-surface-container-high rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />
      </div>
    );
  }

  return <Reports initialData={initialData} employees={employees} sessions={sessions} products={products} />;
}
