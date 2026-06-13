import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — no auth required (matches the rest of /api/kds/*)
export async function GET() {
  const tickets = await prisma.kdsTicket.findMany({
    where: { status: { not: "COMPLETED" } },
    include: {
      order: { select: { orderNumber: true } },
      items: {
        include: {
          orderLine: {
            include: {
              product: {
                select: { id: true, name: true, category: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    data: {
      tickets: tickets.map((t) => ({
        id: t.id,
        orderNumber: t.order.orderNumber,
        status: t.status,
        createdAt: t.createdAt,
        items: t.items.map((i) => ({
          id: i.id,
          name: i.orderLine.product.name,
          productId: i.orderLine.product.id,
          categoryId: i.orderLine.product.category.id,
          categoryName: i.orderLine.product.category.name,
          qty: i.orderLine.qty,
          isStruckThrough: i.isStruckThrough,
        })),
      })),
    },
  });
}
