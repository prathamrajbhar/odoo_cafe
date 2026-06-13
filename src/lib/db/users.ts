import { prisma } from "@/lib/prisma";
import { Role, Status } from "@/generated/prisma/client";

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
