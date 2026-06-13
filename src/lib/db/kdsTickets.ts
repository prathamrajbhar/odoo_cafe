import { prisma } from "@/lib/prisma";
import { KDSStatus } from "@/generated/prisma/client";

export function getById(id: string) {
  return prisma.kdsTicket.findUnique({
    where: { id },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
        },
      },
      items: {
        include: {
          orderLine: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function advance(id: string) {
  const ticket = await prisma.kdsTicket.findUnique({ where: { id } });
  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.status === KDSStatus.COMPLETED) {
    throw new Error("Ticket is already COMPLETED");
  }

  let nextStatus: KDSStatus;
  if (ticket.status === KDSStatus.TO_COOK) {
    nextStatus = KDSStatus.PREPARING;
  } else {
    nextStatus = KDSStatus.COMPLETED;
  }

  return prisma.kdsTicket.update({
    where: { id },
    data: { status: nextStatus },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
        },
      },
      items: {
        include: {
          orderLine: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export function getByStatus(status: KDSStatus) {
  return prisma.kdsTicket.findMany({
    where: { status },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
        },
      },
      items: {
        include: {
          orderLine: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}
