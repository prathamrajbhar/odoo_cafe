import { prisma } from "@/lib/prisma";
import { Role, Status } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/bcrypt";

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export function countUsers() {
  return prisma.user.count();
}

export function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}) {
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export function updateUser(
  id: string,
  data: { name?: string; email?: string; role?: Role; status?: Status }
) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
}

export function updatePasswordHash(id: string, passwordHash: string) {
  return prisma.user.update({ where: { id }, data: { passwordHash } });
}

export function deleteUser(id: string) {
  return prisma.user.delete({ where: { id } });
}

// Checklist-specific exports
export function getAll() {
  return listUsers();
}

export function getById(id: string) {
  return getUserById(id);
}

export function getByEmail(email: string) {
  return getUserByEmail(email);
}

export async function create(
  nameOrData: string | { name: string; email: string; password?: string; passwordHash?: string; role: Role },
  email?: string,
  password?: string,
  role?: Role
) {
  if (typeof nameOrData === "object" && nameOrData !== null) {
    const passwordHash = nameOrData.passwordHash || (nameOrData.password ? await hashPassword(nameOrData.password) : "");
    return createUser({
      name: nameOrData.name,
      email: nameOrData.email,
      passwordHash,
      role: nameOrData.role,
    });
  } else {
    const passwordHash = password ? await hashPassword(password) : "";
    return createUser({
      name: nameOrData,
      email: email!,
      passwordHash,
      role: role!,
    });
  }
}

export function update(
  id: string,
  dataOrName?: { name?: string; email?: string; role?: Role; status?: Status } | string,
  email?: string,
  role?: Role,
  status?: Status
) {
  if (typeof dataOrName === "object" && dataOrName !== null) {
    return updateUser(id, dataOrName);
  } else {
    const data: { name?: string; email?: string; role?: Role; status?: Status } = {};
    if (dataOrName !== undefined) data.name = dataOrName;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (status !== undefined) data.status = status;
    return updateUser(id, data);
  }
}

async function _delete(id: string) {
  return deleteUser(id);
}
export { _delete as delete };

export async function updatePassword(id: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  return updatePasswordHash(id, passwordHash);
}

