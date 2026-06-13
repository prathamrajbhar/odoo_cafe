import {
  getActiveProductPromos,
  getActiveOrderPromos,
  getPromotionByCode,
} from "@/lib/db/promotions";
import { prisma } from "@/lib/prisma";

type DiscountType = "PERCENT" | "FIXED";

export type AppliedPromo = {
  promoId: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
};

export type ProductPromoResult = AppliedPromo & { productId: string };

export type OrderPromoResult = AppliedPromo & { discountAmount: number };

export function calculateDiscount(
  discountValue: number,
  discountType: "PERCENT" | "FIXED",
  amount: number
): number {
  const discount = discountType === "PERCENT" ? (amount * discountValue) / 100 : discountValue;
  return Math.min(amount, Math.round(discount * 100) / 100);
}

export async function evaluateProductPromos(
  cartLines: Array<{ productId: string; qty: number }>,
  activePromos?: any[]
): Promise<any[]> {
  const promos = activePromos || (await getActiveProductPromos());
  const results = [];

  for (const promo of promos) {
    if (promo.promoType !== "PRODUCT_BASED" || !promo.productId || promo.minQty === null) continue;
    const line = cartLines.find((l) => l.productId === promo.productId);
    if (line && line.qty >= promo.minQty) {
      results.push(promo);
    }
  }

  return results;
}

export async function evaluateOrderPromos(
  subtotal: number,
  activePromos?: any[]
): Promise<any[]> {
  const promos = activePromos || (await getActiveOrderPromos());
  const results = [];

  for (const promo of promos) {
    if (promo.promoType !== "ORDER_BASED" || promo.minOrderAmount === null) continue;
    if (subtotal >= Number(promo.minOrderAmount)) {
      results.push(promo);
    }
  }

  return results;
}

export async function validateCoupon(
  code: string,
  activePromos?: any[]
): Promise<any> {
  let promo;
  if (activePromos) {
    promo = activePromos.find(
      (p) => p.promoType === "COUPON" && p.code?.toLowerCase() === code.toLowerCase()
    );
  } else {
    promo = await getPromotionByCode(code);
  }

  if (!promo || !promo.isActive || promo.promoType !== "COUPON") {
    throw new Error("Invalid or inactive coupon code");
  }

  return promo;
}

export async function applyPromos(
  cartLines: Array<{ productId: string; qty: number }>,
  subtotal: number,
  code?: string | null,
  activePromos?: any[]
): Promise<{
  appliedPromos: Array<{
    promoId: string;
    name: string;
    discountValue: number;
    discountType: "PERCENT" | "FIXED";
    scope: "LINE" | "ORDER";
    productId: string | null;
  }>;
  discountAmount: number;
}> {
  // If activePromos is not provided, fetch all active promotions from DB
  const promos = activePromos || (await prisma.promotion.findMany({
    where: { isActive: true },
  }));

  const appliedPromos: Array<{
    promoId: string;
    name: string;
    discountValue: number;
    discountType: "PERCENT" | "FIXED";
    scope: "LINE" | "ORDER";
    productId: string | null;
  }> = [];

  let totalDiscount = 0;

  // 1. Evaluate Product-based Promos
  const matchedProductPromos = await evaluateProductPromos(cartLines, promos);
  if (matchedProductPromos.length > 0) {
    const productIds = cartLines.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    for (const promo of matchedProductPromos) {
      const line = cartLines.find((l) => l.productId === promo.productId);
      const product = products.find((p) => p.id === promo.productId);
      if (line && product) {
        const lineSubtotal = line.qty * Number(product.price);
        const discount = calculateDiscount(
          Number(promo.discountValue),
          promo.discountType as "PERCENT" | "FIXED",
          lineSubtotal
        );
        appliedPromos.push({
          promoId: promo.id,
          name: promo.name,
          discountValue: Number(promo.discountValue),
          discountType: promo.discountType as "PERCENT" | "FIXED",
          scope: "LINE",
          productId: promo.productId,
        });
        totalDiscount += discount;
      }
    }
  }

  // 2. Evaluate Order-based Promos
  const matchedOrderPromos = await evaluateOrderPromos(subtotal, promos);
  for (const promo of matchedOrderPromos) {
    const discount = calculateDiscount(
      Number(promo.discountValue),
      promo.discountType as "PERCENT" | "FIXED",
      subtotal
    );
    appliedPromos.push({
      promoId: promo.id,
      name: promo.name,
      discountValue: Number(promo.discountValue),
      discountType: promo.discountType as "PERCENT" | "FIXED",
      scope: "ORDER",
      productId: null,
    });
    totalDiscount += discount;
  }

  // 3. Evaluate Coupon
  if (code) {
    const coupon = await validateCoupon(code, promos);
    if (coupon) {
      const discount = calculateDiscount(
        Number(coupon.discountValue),
        coupon.discountType as "PERCENT" | "FIXED",
        subtotal
      );
      appliedPromos.push({
        promoId: coupon.id,
        name: coupon.name,
        discountValue: Number(coupon.discountValue),
        discountType: coupon.discountType as "PERCENT" | "FIXED",
        scope: "ORDER",
        productId: null,
      });
      totalDiscount += discount;
    }
  }

  // Cap total discount at the subtotal
  totalDiscount = Math.min(subtotal, totalDiscount);
  totalDiscount = Math.round(totalDiscount * 100) / 100;

  return {
    appliedPromos,
    discountAmount: totalDiscount,
  };
}

