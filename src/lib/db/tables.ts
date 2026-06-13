import { prisma } from "@/lib/prisma";

const tableSelect = {
  id: true,
  floorId: true,
  number: true,
  seats: true,
  isActive: true,
  floor: { select: { id: true, name: true } },
} as const;

export function listTables() {
  return prisma.table.findMany({
    select: {
      ...tableSelect,
      orders: {
        where: { status: "DRAFT" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: [{ floorId: "asc" }, { number: "asc" }],
  });
}

export function getTableById(id: string) {
  return prisma.table.findUnique({ where: { id }, select: tableSelect });
}

export function createTable(data: {
  floorId: string;
  number: number;
  seats: number;
  isActive: boolean;
}) {
  return prisma.table.create({ data, select: tableSelect });
}

export function updateTable(
  id: string,
  data: { number?: number; seats?: number; isActive?: boolean }
) {
  return prisma.table.update({ where: { id }, data, select: tableSelect });
}

export function deleteTable(id: string) {
  return prisma.table.delete({ where: { id } });
}
