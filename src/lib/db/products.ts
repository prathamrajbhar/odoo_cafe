import { prisma } from "@/lib/prisma";

const productSelect = {
  id: true,
  name: true,
  price: true,
  taxRate: true,
  description: true,
  isArchived: true,
  category: { select: { id: true, name: true, colorHex: true } },
} as const;

export function listProducts() {
  return prisma.product.findMany({
    where: { isArchived: false },
    select: productSelect,
    orderBy: { name: "asc" },
  });
}

export function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, select: productSelect });
}

export function createProduct(data: {
  name: string;
  categoryId: string;
  price: number;
  taxRate: number;
  description?: string;
}) {
  return prisma.product.create({ data, select: productSelect });
}

export function updateProduct(
  id: string,
  data: { name?: string; categoryId?: string; price?: number; taxRate?: number; description?: string }
) {
  return prisma.product.update({ where: { id }, data, select: productSelect });
}

export function archiveProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isArchived: true } });
}
