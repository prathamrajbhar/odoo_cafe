import { prisma } from "@/lib/prisma";

export function getAll(search?: string) {
  if (search && search.trim() !== "") {
    return prisma.customer.findMany({
      where: {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { name: "asc" },
    });
  }
  return prisma.customer.findMany({
    orderBy: { name: "asc" },
  });
}

export function getById(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export async function create(
  nameOrData: string | { name: string; email?: string | null; phone?: string | null },
  email?: string | null,
  phone?: string | null
) {
  let customerData: { name: string; email?: string | null; phone?: string | null };

  if (typeof nameOrData === "string") {
    customerData = {
      name: nameOrData,
      email: email || null,
      phone: phone || null,
    };
  } else {
    customerData = {
      name: nameOrData.name,
      email: nameOrData.email || null,
      phone: nameOrData.phone || null,
    };
  }

  if (!customerData.name || customerData.name.trim() === "") {
    throw new Error("Customer name cannot be empty");
  }

  return prisma.customer.create({ data: customerData });
}

export async function update(
  id: string,
  nameOrData?: string | { name?: string; email?: string | null; phone?: string | null },
  email?: string | null,
  phone?: string | null
) {
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Customer not found");
  }

  let updateData: { name?: string; email?: string | null; phone?: string | null } = {};

  if (nameOrData !== undefined) {
    if (typeof nameOrData === "string") {
      updateData = {
        name: nameOrData,
        email: email || null,
        phone: phone || null,
      };
    } else {
      updateData = {
        name: nameOrData.name,
        email: nameOrData.email !== undefined ? nameOrData.email : undefined,
        phone: nameOrData.phone !== undefined ? nameOrData.phone : undefined,
      };
    }
  }

  if (updateData.name !== undefined && updateData.name.trim() === "") {
    throw new Error("Customer name cannot be empty");
  }

  // filter undefined values
  const data: Record<string, any> = {};
  if (updateData.name !== undefined) data.name = updateData.name;
  if (updateData.email !== undefined) data.email = updateData.email;
  if (updateData.phone !== undefined) data.phone = updateData.phone;

  return prisma.customer.update({
    where: { id },
    data,
  });
}

export function deleteCustomer(id: string) {
  return prisma.customer.delete({ where: { id } });
}

export { deleteCustomer as delete };
