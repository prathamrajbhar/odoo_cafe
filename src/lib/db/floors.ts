import { prisma } from "@/lib/prisma";

export function listFloors() {
  return prisma.floor.findMany({
    select: {
      id: true,
      name: true,
      createdAt: true,
      tables: {
        select: { id: true, number: true, seats: true, isActive: true },
        orderBy: { number: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

export function getFloorById(id: string) {
  return prisma.floor.findUnique({ where: { id } });
}

export function createFloor(data: { name: string }) {
  return prisma.floor.create({ data });
}

export function updateFloor(id: string, data: { name?: string }) {
  return prisma.floor.update({ where: { id }, data });
}

export function deleteFloor(id: string) {
  return prisma.floor.delete({ where: { id } });
}
