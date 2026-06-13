import {
  getActiveProductPromos,
  getActiveOrderPromos,
  getPromotionByCode,
} from "@/lib/db/promotions";

type DiscountType = "PERCENT" | "FIXED";

export type AppliedPromo = {
  promoId: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
};

export type ProductPromoResult = AppliedPromo & { productId: string };

export type OrderPromoResult = AppliedPromo & { discountAmount: number };

export async function evaluateProductPromos(
  lines: Array<{ productId: string; qty: number }>
): Promise<ProductPromoResult[]> {
  const promos = await getActiveProductPromos();
  const results: ProductPromoResult[] = [];

  for (const promo of promos) {
    if (!promo.productId || promo.minQty === null) continue;
    const line = lines.find((l) => l.productId === promo.productId);
    if (line && line.qty >= promo.minQty) {
      results.push({
        promoId: promo.id,
        name: promo.name,
        discountType: promo.discountType as DiscountType,
        discountValue: Number(promo.discountValue),
        productId: promo.productId,
      });
    }
  }

  return results;
}

export async function evaluateOrderPromos(subtotal: number): Promise<OrderPromoResult[]> {
  const promos = await getActiveOrderPromos();
  const results: OrderPromoResult[] = [];

  for (const promo of promos) {
    if (promo.minOrderAmount === null) continue;
    if (subtotal >= Number(promo.minOrderAmount)) {
      const dv = Number(promo.discountValue);
      const dt = promo.discountType as DiscountType;
      const discountAmount = dt === "PERCENT" ? (subtotal * dv) / 100 : dv;
      results.push({
        promoId: promo.id,
        name: promo.name,
        discountType: dt,
        discountValue: dv,
        discountAmount: Math.round(discountAmount * 100) / 100,
      });
    }
  }

  return results;
}

export async function validateCoupon(code: string): Promise<AppliedPromo | null> {
  const promo = await getPromotionByCode(code);
  if (!promo || !promo.isActive || promo.promoType !== "COUPON") return null;
  return {
    promoId: promo.id,
    name: promo.name,
    discountType: promo.discountType as DiscountType,
    discountValue: Number(promo.discountValue),
  };
}
