import { prisma } from "@/lib/prisma";

// Original methods kept for backward compatibility
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
  return create(data);
}

export function updateFloor(id: string, data: { name?: string }) {
  return update(id, data);
}

// Refined methods conforming to checklist2.md
export function getAll() {
  return prisma.floor.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      tables: {
        orderBy: { number: "asc" },
      },
    },
  });
}

export function getById(id: string) {
  return prisma.floor.findUnique({
    where: { id },
    include: {
      tables: {
        orderBy: { number: "asc" },
      },
    },
  });
}

export async function create(nameOrData: string | { name: string }) {
  const name = typeof nameOrData === "string" ? nameOrData : nameOrData.name;
  if (!name || name.trim() === "") {
    throw new Error("Floor name cannot be empty");
  }

  // Enforce name uniqueness (case-insensitive check)
  const existing = await prisma.floor.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    throw new Error("Floor name already exists");
  }

  return prisma.floor.create({
    data: { name },
  });
}

export async function update(id: string, nameOrData: string | { name?: string }) {
  const name = typeof nameOrData === "string" ? nameOrData : nameOrData.name;

  if (name !== undefined) {
    if (name.trim() === "") {
      throw new Error("Floor name cannot be empty");
    }

    // Enforce name uniqueness (case-insensitive check)
    const existing = await prisma.floor.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        NOT: { id },
      },
    });
    if (existing) {
      throw new Error("Floor name already exists");
    }
  }

  const data = name !== undefined ? { name } : {};
  return prisma.floor.update({
    where: { id },
    data,
  });
}

export async function deleteFloor(id: string) {
  const [, deletedFloor] = await prisma.$transaction([
    prisma.table.deleteMany({ where: { floorId: id } }),
    prisma.floor.delete({ where: { id } }),
  ]);
  return deletedFloor;
}

export { deleteFloor as delete };

