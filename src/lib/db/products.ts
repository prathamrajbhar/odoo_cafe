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
  description?: string | null;
}) {
  return prisma.product.create({ data: data as any, select: productSelect });
}

export function updateProduct(
  id: string,
  data: { name?: string; categoryId?: string; price?: number; taxRate?: number; description?: string | null }
) {
  return prisma.product.update({ where: { id }, data: data as any, select: productSelect });
}

export function archiveProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isArchived: true }, select: productSelect });
}

// Checklist-specific exports
export function getAll(archived = false) {
  return prisma.product.findMany({
    where: { isArchived: archived },
    select: productSelect,
    orderBy: { name: "asc" },
  });
}

export function getById(id: string) {
  return getProductById(id);
}

export function getByCategory(categoryId: string) {
  return prisma.product.findMany({
    where: { categoryId, isArchived: false },
    select: productSelect,
    orderBy: { name: "asc" },
  });
}

export function create(
  nameOrData: string | { name: string; categoryId: string; price: number; taxRate: number; description?: string | null },
  categoryId?: string,
  price?: number,
  taxRate?: number,
  description?: string | null
) {
  if (typeof nameOrData === "object" && nameOrData !== null) {
    return createProduct(nameOrData);
  } else {
    return createProduct({
      name: nameOrData,
      categoryId: categoryId!,
      price: price!,
      taxRate: taxRate!,
      description: description ?? null,
    });
  }
}

export function update(
  id: string,
  dataOrName?: { name?: string; categoryId?: string; price?: number; taxRate?: number; description?: string | null } | string,
  categoryId?: string,
  price?: number,
  taxRate?: number,
  description?: string | null
) {
  if (typeof dataOrName === "object" && dataOrName !== null) {
    return updateProduct(id, dataOrName);
  } else {
    const data: { name?: string; categoryId?: string; price?: number; taxRate?: number; description?: string | null } = {};
    if (dataOrName !== undefined) data.name = dataOrName;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (price !== undefined) data.price = price;
    if (taxRate !== undefined) data.taxRate = taxRate;
    if (description !== undefined) data.description = description;
    return updateProduct(id, data);
  }
}

export function archive(id: string) {
  return archiveProduct(id);
}

async function _delete(id: string) {
  return prisma.product.delete({ where: { id } });
}
export { _delete as delete };

