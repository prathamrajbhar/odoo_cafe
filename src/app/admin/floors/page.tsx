"use client";

import React, { useState, useEffect, useCallback } from "react";
import FloorTableManager from "@/components/admin/FloorTableManager";
import { SkeletonTable } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function FloorsPage() {
  const [floors, setFloors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFloors = useCallback(async () => {
    try {
      const res: any = await api.get("/floors");
      setFloors(res.data?.floors ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load floors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchFloors(); }, [fetchFloors]);

  if (isLoading) return <SkeletonTable rows={3} cols={4} />;

  // Escape the admin layout's padding container so the floor editor fills the viewport
  return (
    <div className="-mx-4 md:-mx-6 -my-6 md:-my-8 h-[calc(100vh-64px)] md:h-screen overflow-hidden">
      <FloorTableManager floors={floors} onRefresh={fetchFloors} />
    </div>
  );
}
