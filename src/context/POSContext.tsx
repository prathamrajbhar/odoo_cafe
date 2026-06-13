"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  qty: number;
  appliedPromoId: string | null;
  promoDiscount: number; // line-level discount amount
}

export interface AppliedPromo {
  promoId: string;
  name: string;
  discountValue: number;
  discountType: "PERCENT" | "FIXED";
  scope: "LINE" | "ORDER";
  productId: string | null;
}

export interface ActiveTable {
  id: string;
  number: number;
  floorId: string;
}

export type ActiveModal =
  | "floor"
  | "discount"
  | "payment"
  | "customer"
  | "orders"
  | "tables"
  | null;

interface POSState {
  sessionId: string | null;
  activeTable: ActiveTable | null;
  cartLines: CartLine[];
  currentOrderId: string | null;
  customerId: string | null;
  customerName: string | null;
  couponCode: string | null;
  appliedPromos: AppliedPromo[];
  orderDiscountAmount: number;
  activeModal: ActiveModal;
}

interface POSContextType extends POSState {
  setSessionId: (id: string) => void;
  setActiveTable: (table: ActiveTable | null) => void;
  addToCart: (item: Omit<CartLine, "qty" | "appliedPromoId" | "promoDiscount">) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  setCurrentOrderId: (id: string | null) => void;
  setCustomer: (id: string | null, name: string | null) => void;
  setCouponCode: (code: string | null) => void;
  setAppliedPromos: (promos: AppliedPromo[], discountAmount: number) => void;
  setActiveModal: (modal: ActiveModal) => void;
  loadOrderIntoCart: (lines: CartLine[], orderId: string) => void;
  clearCart: () => void;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode; initialSessionId: string }> = ({
  children,
  initialSessionId,
}) => {
  const [state, setState] = useState<POSState>({
    sessionId: initialSessionId,
    activeTable: null,
    cartLines: [],
    currentOrderId: null,
    customerId: null,
    customerName: null,
    couponCode: null,
    appliedPromos: [],
    orderDiscountAmount: 0,
    activeModal: null,
  });

  const setSessionId = useCallback((id: string) => {
    setState((s) => ({ ...s, sessionId: id }));
  }, []);

  const setActiveTable = useCallback((table: ActiveTable | null) => {
    setState((s) => ({ ...s, activeTable: table }));
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartLine, "qty" | "appliedPromoId" | "promoDiscount">) => {
      setState((s) => {
        const existing = s.cartLines.find((l) => l.productId === item.productId);
        if (existing) {
          return {
            ...s,
            cartLines: s.cartLines.map((l) =>
              l.productId === item.productId ? { ...l, qty: l.qty + 1 } : l
            ),
          };
        }
        return {
          ...s,
          cartLines: [
            ...s.cartLines,
            { ...item, qty: 1, appliedPromoId: null, promoDiscount: 0 },
          ],
        };
      });
    },
    []
  );

  const updateQty = useCallback((productId: string, qty: number) => {
    setState((s) => {
      if (qty <= 0) {
        return { ...s, cartLines: s.cartLines.filter((l) => l.productId !== productId) };
      }
      return {
        ...s,
        cartLines: s.cartLines.map((l) => (l.productId === productId ? { ...l, qty } : l)),
      };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setState((s) => ({ ...s, cartLines: s.cartLines.filter((l) => l.productId !== productId) }));
  }, []);

  const setCurrentOrderId = useCallback((id: string | null) => {
    setState((s) => ({ ...s, currentOrderId: id }));
  }, []);

  const setCustomer = useCallback((id: string | null, name: string | null) => {
    setState((s) => ({ ...s, customerId: id, customerName: name }));
  }, []);

  const setCouponCode = useCallback((code: string | null) => {
    setState((s) => ({ ...s, couponCode: code }));
  }, []);

  const setAppliedPromos = useCallback((promos: AppliedPromo[], discountAmount: number) => {
    setState((s) => ({ ...s, appliedPromos: promos, orderDiscountAmount: discountAmount }));
  }, []);

  const setActiveModal = useCallback((modal: ActiveModal) => {
    setState((s) => ({ ...s, activeModal: modal }));
  }, []);

  const loadOrderIntoCart = useCallback((lines: CartLine[], orderId: string) => {
    setState((s) => ({
      ...s,
      cartLines: lines,
      currentOrderId: orderId,
      appliedPromos: [],
      orderDiscountAmount: 0,
      couponCode: null,
    }));
  }, []);

  const clearCart = useCallback(() => {
    setState((s) => ({
      ...s,
      cartLines: [],
      currentOrderId: null,
      customerId: null,
      customerName: null,
      couponCode: null,
      appliedPromos: [],
      orderDiscountAmount: 0,
      activeTable: null,
    }));
  }, []);

  // Derived totals
  const subtotal = state.cartLines.reduce((sum, l) => sum + l.unitPrice * l.qty - l.promoDiscount, 0);
  const taxAmount = state.cartLines.reduce(
    (sum, l) => sum + (l.unitPrice * l.qty - l.promoDiscount) * (l.taxRate / 100),
    0
  );
  const discountAmount = state.orderDiscountAmount;
  const total = subtotal + taxAmount - discountAmount;

  return (
    <POSContext.Provider
      value={{
        ...state,
        setSessionId,
        setActiveTable,
        addToCart,
        updateQty,
        removeFromCart,
        setCurrentOrderId,
        setCustomer,
        setCouponCode,
        setAppliedPromos,
        setActiveModal,
        loadOrderIntoCart,
        clearCart,
        subtotal,
        taxAmount,
        discountAmount,
        total,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const ctx = useContext(POSContext);
  if (!ctx) throw new Error("usePOS must be used within POSProvider");
  return ctx;
};
