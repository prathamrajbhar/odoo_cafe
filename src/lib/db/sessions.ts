import { prisma } from "@/lib/prisma";

export function getActive(userId: string) {
  return prisma.session.findFirst({
    where: {
      openedByUserId: userId,
      closedAt: null,
    },
    include: { openedBy: { select: { name: true } } },
  });
}

export async function create(userId: string) {
  const active = await prisma.session.findFirst({
    where: { openedByUserId: userId, closedAt: null },
  });
  if (active) throw new Error("User already has an active session");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User does not exist");

  return prisma.session.create({ data: { openedByUserId: userId } });
}

export async function close(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { orders: { where: { status: "PAID" }, select: { total: true } } },
  });
  if (!session) throw new Error("Session not found");
  if (session.closedAt !== null) throw new Error("Session is already closed");

  const closingSaleAmount = session.orders.reduce((sum, o) => sum + Number(o.total), 0);

  return prisma.session.update({
    where: { id: sessionId },
    data: { closedAt: new Date(), closingSaleAmount },
  });
}

function formatDuration(openedAt: Date, closedAt: Date): string {
  const minutes = Math.floor((closedAt.getTime() - openedAt.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

export async function getSummary(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { orders: { select: { status: true, total: true } } },
  });

  if (!session) throw new Error("Session not found");

  const paidOrders = session.orders.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);
  const closedAt = session.closedAt ?? new Date();

  return {
    totalOrders: session.orders.length,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    openedAt: session.openedAt,
    closedAt,
    shiftDuration: formatDuration(session.openedAt, closedAt),
  };
}
