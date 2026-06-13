import { prisma } from "@/lib/prisma";

const promoSelect = {
  id: true,
  name: true,
  promoType: true,
  code: true,
  productId: true,
  minQty: true,
  minOrderAmount: true,
  discountValue: true,
  discountType: true,
  isActive: true,
  createdAt: true,
} as const;

export function listPromotions() {
  return prisma.promotion.findMany({
    select: promoSelect,
    orderBy: { name: "asc" },
  });
}

export function getPromotionById(id: string) {
  return prisma.promotion.findUnique({ where: { id }, select: promoSelect });
}

export function getPromotionByCode(code: string) {
  return prisma.promotion.findUnique({ where: { code }, select: promoSelect });
}

export function getActiveProductPromos() {
  return prisma.promotion.findMany({
    where: { isActive: true, promoType: "PRODUCT_BASED" },
    select: promoSelect,
  });
}

export function getActiveOrderPromos() {
  return prisma.promotion.findMany({
    where: { isActive: true, promoType: "ORDER_BASED" },
    select: promoSelect,
  });
}

export function createPromotion(data: {
  name: string;
  promoType: "COUPON" | "PRODUCT_BASED" | "ORDER_BASED";
  code?: string;
  productId?: string;
  minQty?: number;
  minOrderAmount?: number;
  discountValue: number;
  discountType: "PERCENT" | "FIXED";
  isActive: boolean;
}) {
  return prisma.promotion.create({ data, select: promoSelect });
}

export function updatePromotion(
  id: string,
  data: {
    name?: string;
    code?: string;
    productId?: string;
    minQty?: number;
    minOrderAmount?: number;
    discountValue?: number;
    discountType?: "PERCENT" | "FIXED";
    isActive?: boolean;
  }
) {
  return prisma.promotion.update({ where: { id }, data, select: promoSelect });
}

export function deletePromotion(id: string) {
  return prisma.promotion.delete({ where: { id } });
}
