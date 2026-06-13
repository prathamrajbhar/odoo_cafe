import { prisma } from "@/lib/prisma";

export function getActive(userId: string) {
  return prisma.session.findFirst({
    where: {
      openedByUserId: userId,
      closedAt: null,
    },
  });
}

export async function create(userId: string) {
  // Enforce one active session constraint
  const active = await getActive(userId);
  if (active) {
    throw new Error("User already has an active session");
  }

  // Verify user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User does not exist");
  }

  return prisma.session.create({
    data: {
      openedByUserId: userId,
    },
  });
}

export async function close(sessionId: string, closingSaleAmount: number) {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new Error("Session not found");
  }
  if (session.closedAt !== null) {
    throw new Error("Session is already closed");
  }

  if (closingSaleAmount === undefined || closingSaleAmount === null || Number(closingSaleAmount) < 0) {
    throw new Error("closingSaleAmount must be a non-negative number");
  }

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      closedAt: new Date(),
      closingSaleAmount,
    },
  });
}

export async function getSummary(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      orders: {
        select: {
          status: true,
          total: true,
        },
      },
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const totalOrders = session.orders.length;
  // Sum totals of PAID orders
  const paidOrders = session.orders.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  return {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
  };
}
