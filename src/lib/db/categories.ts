import { prisma } from "@/lib/prisma";

export function listCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true, colorHex: true },
    orderBy: { name: "asc" },
  });
}

export function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export function createCategory(data: { name: string; colorHex: string }) {
  return prisma.category.create({ data });
}

export function updateCategory(id: string, data: { name?: string; colorHex?: string }) {
  return prisma.category.update({ where: { id }, data });
}

export function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
}
