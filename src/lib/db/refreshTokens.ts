import { prisma } from "@/lib/prisma";

export function createRefreshToken(userId: string, token: string, expiresAt: Date) {
  return prisma.refreshToken.create({ data: { userId, token, expiresAt } });
}

export function getRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({ where: { token }, include: { user: true } });
}

export function deleteRefreshToken(token: string) {
  return prisma.refreshToken.delete({ where: { token } });
}

export function deleteAllForUser(userId: string) {
  return prisma.refreshToken.deleteMany({ where: { userId } });
}
