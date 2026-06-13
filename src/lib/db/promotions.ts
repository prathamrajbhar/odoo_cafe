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

export function getAll(activeOnly: boolean = true) {
  const where = activeOnly ? { isActive: true } : {};
  return prisma.promotion.findMany({
    where,
    select: promoSelect,
    orderBy: { name: "asc" },
  });
}

export function getById(id: string) {
  return prisma.promotion.findUnique({ where: { id }, select: promoSelect });
}

export function getByCode(code: string) {
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

export async function create(
  typeOrData: "COUPON" | "PRODUCT_BASED" | "ORDER_BASED" | any,
  data?: any
) {
  let promoData: any;
  if (typeof typeOrData === "string" && data) {
    promoData = { ...data, promoType: typeOrData };
  } else {
    promoData = typeOrData;
  }

  const { promoType, code, productId, minQty, minOrderAmount, discountValue, discountType } = promoData;

  if (discountValue !== undefined && Number(discountValue) <= 0) {
    throw new Error("discountValue must be greater than 0");
  }

  if (discountType === "PERCENT" && Number(discountValue) > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  if (promoType === "COUPON") {
    if (!code) throw new Error("Coupon code is required for COUPON type");
    const existing = await getByCode(code);
    if (existing) throw new Error("Coupon code must be unique");
  } else if (promoType === "PRODUCT_BASED") {
    if (!productId) throw new Error("productId is required for PRODUCT_BASED type");
    if (minQty === undefined || minQty <= 0) throw new Error("minQty must be greater than 0");
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product does not exist");
  } else if (promoType === "ORDER_BASED") {
    if (minOrderAmount === undefined || Number(minOrderAmount) <= 0) {
      throw new Error("minOrderAmount must be greater than 0");
    }
  }

  return prisma.promotion.create({ data: promoData, select: promoSelect });
}

export async function update(id: string, data: any) {
  const existing = await getById(id);
  if (!existing) throw new Error("Promotion not found");

  const promoType = data.promoType || existing.promoType;
  const code = data.code !== undefined ? data.code : existing.code;
  const productId = data.productId !== undefined ? data.productId : existing.productId;
  const minQty = data.minQty !== undefined ? data.minQty : existing.minQty;
  const minOrderAmount = data.minOrderAmount !== undefined ? data.minOrderAmount : existing.minOrderAmount;
  const discountValue = data.discountValue !== undefined ? data.discountValue : Number(existing.discountValue);
  const discountType = data.discountType !== undefined ? data.discountType : existing.discountType;

  if (discountValue !== undefined && Number(discountValue) <= 0) {
    throw new Error("discountValue must be greater than 0");
  }

  if (discountType === "PERCENT" && Number(discountValue) > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  if (promoType === "COUPON") {
    if (!code) throw new Error("Coupon code is required for COUPON type");
    if (code !== existing.code) {
      const other = await getByCode(code);
      if (other) throw new Error("Coupon code must be unique");
    }
  } else if (promoType === "PRODUCT_BASED") {
    if (!productId) throw new Error("productId is required for PRODUCT_BASED type");
    if (minQty !== null && minQty <= 0) throw new Error("minQty must be greater than 0");
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error("Product does not exist");
  } else if (promoType === "ORDER_BASED") {
    if (minOrderAmount !== null && Number(minOrderAmount) <= 0) {
      throw new Error("minOrderAmount must be greater than 0");
    }
  }

  return prisma.promotion.update({ where: { id }, data, select: promoSelect });
}

export function deletePromo(id: string) {
  return prisma.promotion.delete({ where: { id } });
}

// Compatibility exports
export function listPromotions() {
  return getAll(false);
}

export function getPromotionById(id: string) {
  return getById(id);
}

export function getPromotionByCode(code: string) {
  return getByCode(code);
}

export function createPromotion(data: any) {
  return create(data);
}

export function updatePromotion(id: string, data: any) {
  return update(id, data);
}

export function deletePromotion(id: string) {
  return deletePromo(id);
}

export { deletePromo as delete };

