import { prisma } from "@/lib/prisma";

const productSelect = {
  id: true,
  name: true,
  price: true,
  taxRate: true,
  stock: true,
  description: true,
  imageUrl: true,
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
  stock?: number;
  description?: string | null;
  imageUrl?: string | null;
}) {
  return prisma.product.create({ data: data as any, select: productSelect });
}

export function updateProduct(
  id: string,
  data: { name?: string; categoryId?: string; price?: number; taxRate?: number; stock?: number; description?: string | null; imageUrl?: string | null }
) {
  return prisma.product.update({ where: { id }, data: data as any, select: productSelect });
}

export function archiveProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isArchived: true }, select: productSelect });
}

// Decrement stock for multiple lines atomically — call inside a transaction
export async function decrementStockForLines(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  lines: Array<{ productId: string; qty: number }>
) {
  for (const line of lines) {
    const product = await tx.product.findUnique({ where: { id: line.productId }, select: { stock: true, name: true } });
    if (!product) throw new Error(`Product ${line.productId} not found`);
    if (product.stock < line.qty) throw new Error(`Insufficient stock for "${product.name}" (available: ${product.stock}, requested: ${line.qty})`);
    await tx.product.update({
      where: { id: line.productId },
      data: { stock: { decrement: line.qty } },
    });
  }
}

// Add stock (restock from admin panel)
export function restockProduct(id: string, quantity: number) {
  return prisma.product.update({
    where: { id },
    data: { stock: { increment: quantity } },
    select: productSelect,
  });
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
  nameOrData: string | { name: string; categoryId: string; price: number; taxRate: number; stock?: number; description?: string | null; imageUrl?: string | null },
  categoryId?: string,
  price?: number,
  taxRate?: number,
  description?: string | null,
  imageUrl?: string | null
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
      imageUrl: imageUrl ?? null,
    });
  }
}

export function update(
  id: string,
  dataOrName?: { name?: string; categoryId?: string; price?: number; taxRate?: number; stock?: number; description?: string | null; imageUrl?: string | null } | string,
  categoryId?: string,
  price?: number,
  taxRate?: number,
  description?: string | null,
  imageUrl?: string | null
) {
  if (typeof dataOrName === "object" && dataOrName !== null) {
    return updateProduct(id, dataOrName);
  } else {
    const data: { name?: string; categoryId?: string; price?: number; taxRate?: number; description?: string | null; imageUrl?: string | null } = {};
    if (dataOrName !== undefined) data.name = dataOrName;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (price !== undefined) data.price = price;
    if (taxRate !== undefined) data.taxRate = taxRate;
    if (description !== undefined) data.description = description;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
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
