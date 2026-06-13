"use client";

import React, { useState, useEffect, useCallback } from "react";
import PromotionList from "@/components/admin/PromotionList";
import { SkeletonTable } from "@/components/shared/Loading";
import { api } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [promoRes, prodRes]: any[] = await Promise.all([
        api.get("/promotions"),
        api.get("/products"),
      ]);
      setPromotions(promoRes.data?.promotions ?? []);
      setProducts(prodRes.data?.products ?? []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return <SkeletonTable rows={4} cols={5} />;

  return <PromotionList promotions={promotions} products={products} onRefresh={fetchData} />;
}
