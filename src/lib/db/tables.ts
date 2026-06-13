import { prisma } from "@/lib/prisma";

const tableSelect = {
  id: true,
  floorId: true,
  number: true,
  seats: true,
  isActive: true,
  floor: { select: { id: true, name: true } },
} as const;

// Compatibility aliases & exports
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
  return create(data);
}

export function updateTable(
  id: string,
  data: { number?: number; seats?: number; isActive?: boolean }
) {
  return update(id, data);
}

export async function hasActiveOrder(tableId: string): Promise<boolean> {
  const activeOrder = await prisma.order.findFirst({
    where: { tableId, status: "DRAFT" },
    select: { id: true },
  });
  return activeOrder !== null;
}

// Refined methods conforming to checklist2.md
export async function getAll() {
  const tables = await prisma.table.findMany({
    include: {
      floor: true,
      orders: {
        where: { status: "DRAFT" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: [{ floorId: "asc" }, { number: "asc" }],
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0] || null;
    return {
      id: t.id,
      floorId: t.floorId,
      number: t.number,
      seats: t.seats,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      floor: t.floor,
      hasActiveOrder: activeOrder !== null,
      activeOrderId: activeOrder ? activeOrder.id : null,
    };
  });
}

export async function getById(id: string) {
  const t = await prisma.table.findUnique({
    where: { id },
    include: {
      floor: true,
      orders: {
        where: { status: "DRAFT" },
        select: { id: true },
        take: 1,
      },
    },
  });
  if (!t) return null;

  const activeOrder = t.orders[0] || null;
  return {
    id: t.id,
    floorId: t.floorId,
    number: t.number,
    seats: t.seats,
    isActive: t.isActive,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    floor: t.floor,
    hasActiveOrder: activeOrder !== null,
    activeOrderId: activeOrder ? activeOrder.id : null,
  };
}

export async function getByFloor(floorId: string) {
  const tables = await prisma.table.findMany({
    where: { floorId },
    include: {
      floor: true,
      orders: {
        where: { status: "DRAFT" },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { number: "asc" },
  });

  return tables.map((t) => {
    const activeOrder = t.orders[0] || null;
    return {
      id: t.id,
      floorId: t.floorId,
      number: t.number,
      seats: t.seats,
      isActive: t.isActive,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      floor: t.floor,
      hasActiveOrder: activeOrder !== null,
      activeOrderId: activeOrder ? activeOrder.id : null,
    };
  });
}

export async function create(
  floorIdOrData: string | { floorId: string; number: number; seats: number; isActive?: boolean },
  number?: number,
  seats?: number,
  isActive?: boolean
) {
  let tableData: { floorId: string; number: number; seats: number; isActive: boolean };

  if (typeof floorIdOrData === "string") {
    tableData = {
      floorId: floorIdOrData,
      number: number!,
      seats: seats!,
      isActive: isActive !== undefined ? isActive : true,
    };
  } else {
    tableData = {
      floorId: floorIdOrData.floorId,
      number: floorIdOrData.number,
      seats: floorIdOrData.seats,
      isActive: floorIdOrData.isActive !== undefined ? floorIdOrData.isActive : true,
    };
  }

  // 1. floorId exists validation
  const floor = await prisma.floor.findUnique({ where: { id: tableData.floorId } });
  if (!floor) {
    throw new Error("Floor does not exist");
  }

  // 2. number > 0
  if (tableData.number <= 0) {
    throw new Error("Table number must be greater than 0");
  }

  // 3. seats > 0
  if (tableData.seats <= 0) {
    throw new Error("Table seats must be greater than 0");
  }

  // 4. Composite unique on (floor_id, number)
  const existing = await prisma.table.findUnique({
    where: {
      floorId_number: {
        floorId: tableData.floorId,
        number: tableData.number,
      },
    },
  });
  if (existing) {
    throw new Error("Table number already exists on this floor");
  }

  return prisma.table.create({ data: tableData, include: { floor: true } });
}

export async function update(
  id: string,
  numberOrData?: number | { number?: number; seats?: number; isActive?: boolean },
  seats?: number,
  isActive?: boolean
) {
  const existing = await prisma.table.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Table not found");
  }

  let updateData: { number?: number; seats?: number; isActive?: boolean } = {};

  if (numberOrData !== undefined) {
    if (typeof numberOrData === "number") {
      updateData = {
        number: numberOrData,
        seats,
        isActive,
      };
    } else {
      updateData = numberOrData;
    }
  }

  // 1. number > 0
  if (updateData.number !== undefined) {
    if (updateData.number <= 0) {
      throw new Error("Table number must be greater than 0");
    }

    // Composite unique check on (floorId, number) if number changes
    if (updateData.number !== existing.number) {
      const duplicate = await prisma.table.findUnique({
        where: {
          floorId_number: {
            floorId: existing.floorId,
            number: updateData.number,
          },
        },
      });
      if (duplicate) {
        throw new Error("Table number already exists on this floor");
      }
    }
  }

  // 2. seats > 0
  if (updateData.seats !== undefined && updateData.seats <= 0) {
    throw new Error("Table seats must be greater than 0");
  }

  return prisma.table.update({
    where: { id },
    data: updateData,
    include: { floor: true },
  });
}

export function deleteTable(id: string) {
  return prisma.table.delete({ where: { id } });
}

export { deleteTable as delete };

