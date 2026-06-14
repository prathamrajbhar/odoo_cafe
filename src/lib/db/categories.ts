import { prisma } from "@/lib/prisma";

export function listCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      colorHex: true,
      _count: {
        select: { products: true }
      }
    },
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

// Checklist-specific exports
export function getAll() {
  return listCategories();
}

export function getById(id: string) {
  return getCategoryById(id);
}

export function create(nameOrData: string | { name: string; colorHex: string }, colorHex?: string) {
  if (typeof nameOrData === "object" && nameOrData !== null) {
    return createCategory(nameOrData);
  } else {
    return createCategory({ name: nameOrData, colorHex: colorHex! });
  }
}

export function update(
  id: string,
  dataOrName?: { name?: string; colorHex?: string } | string,
  colorHex?: string
) {
  if (typeof dataOrName === "object" && dataOrName !== null) {
    return updateCategory(id, dataOrName);
  } else {
    const data: { name?: string; colorHex?: string } = {};
    if (dataOrName !== undefined) data.name = dataOrName;
    if (colorHex !== undefined) data.colorHex = colorHex;
    return updateCategory(id, data);
  }
}

async function _delete(id: string) {
  return deleteCategory(id);
}
export { _delete as delete };

export function getWithProductCount(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  });
}

