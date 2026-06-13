import { prisma } from "@/lib/prisma";

export async function toggle(itemId: string) {
  const item = await prisma.kdsTicketItem.findUnique({
    where: { id: itemId },
  });
  if (!item) {
    throw new Error("Ticket item not found");
  }

  return prisma.kdsTicketItem.update({
    where: { id: itemId },
    data: {
      isStruckThrough: !item.isStruckThrough,
    },
  });
}

export function getByTicket(ticketId: string) {
  return prisma.kdsTicketItem.findMany({
    where: { ticketId },
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
  });
}
