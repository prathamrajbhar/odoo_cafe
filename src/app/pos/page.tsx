"use client";

import React, { useState } from "react";
import ProductPanel from "@/components/pos/ProductPanel";
import CartPanel from "@/components/pos/CartPanel";
import PaymentPanel from "@/components/pos/PaymentPanel";
import FloorPopup from "@/components/pos/FloorPopup";
import DiscountPopup from "@/components/pos/DiscountPopup";
import OrdersList from "@/components/pos/OrdersList";
import CustomerPanel from "@/components/pos/CustomerPanel";
import TableView from "@/components/pos/TableView";

export default function PosPage() {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left — Products (fills remaining space) */}
        <div className="flex-1 overflow-hidden">
          <ProductPanel
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
          />
        </div>

        {/* Middle — Cart (fixed width) */}
        <CartPanel
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />

        {/* Right — Payment (fixed width) */}
        <PaymentPanel
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />
      </div>

      {/* Modals */}
      <FloorPopup />
      <DiscountPopup />
      <OrdersList />
      <CustomerPanel />
      <TableView />
    </>
  );
}
