import { prisma } from "@/lib/prisma";
import { applyPromos } from "@/lib/promo";
import { getIO } from "@/lib/socket";
import { decrementStockForLines } from "@/lib/db/products";

export function getBySession(sessionId: string) {
  return prisma.order.findMany({
    where: { sessionId },
    include: {
      customer: { select: { id: true, name: true } },
      table: { select: { id: true, number: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export function getById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      table: { select: { id: true, number: true } },
      employee: { select: { id: true, name: true } },
      orderLines: {
        include: {
          product: { select: { id: true, name: true } },
          appliedPromo: true,
        },
      },
    },
  });
}

export async function generateOrderNumber(): Promise<string> {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { orderNumber: true },
  });

  if (!lastOrder) {
    return "ORD-0001";
  }

  const parts = lastOrder.orderNumber.split("-");
  const numPart = parseInt(parts[1], 10);
  if (isNaN(numPart)) {
    return "ORD-0001";
  }
  const nextNum = numPart + 1;
  return `ORD-${String(nextNum).padStart(4, "0")}`;
}

export async function create(data: {
  sessionId: string;
  tableId?: string | null;
  customerId?: string | null;
  employeeId: string;
  lines: Array<{ productId: string; qty: number }>;
  couponCode?: string | null;
}) {
  const { sessionId, tableId, customerId, employeeId, lines, couponCode } = data;

  // 1. Session exists and is active validation
  const session = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!session) {
    throw new Error("Session does not exist");
  }
  if (session.closedAt !== null) {
    throw new Error("Session is closed");
  }

  // 2. Table exists validation
  if (tableId) {
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new Error("Table does not exist");
    }
  }

  // 3. Customer exists validation
  if (customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new Error("Customer does not exist");
    }
  }

  // 4. Products exist validation
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: lines.map((l) => l.productId) } },
  });
  if (dbProducts.length !== lines.length) {
    throw new Error("One or more products do not exist or are invalid");
  }

  // Enforce tax rate and archive checks on products
  for (const product of dbProducts) {
    if (product.isArchived) {
      throw new Error(`Product ${product.name} is archived`);
    }
  }

  // 5. Calculate subtotal & Re-validate promos
  let subtotal = 0;
  for (const line of lines) {
    const product = dbProducts.find((p) => p.id === line.productId)!;
    subtotal += line.qty * Number(product.price);
  }

  const promoResult = await applyPromos(lines, subtotal, couponCode);

  // Map product promos to lines
  const linesWithPromo = lines.map((line) => {
    const dbProduct = dbProducts.find((p) => p.id === line.productId)!;
    const linePromo = promoResult.appliedPromos.find(
      (p) => p.scope === "LINE" && p.productId === line.productId
    );
    return {
      productId: line.productId,
      qty: line.qty,
      unitPrice: Number(dbProduct.price),
      appliedPromoId: linePromo ? linePromo.promoId : null,
    };
  });

  // Calculate tax amount (gross)
  let taxAmount = 0;
  for (const line of linesWithPromo) {
    const product = dbProducts.find((p) => p.id === line.productId)!;
    const lineTax = (line.qty * line.unitPrice * product.taxRate) / 100;
    taxAmount += lineTax;
  }

  const discountAmount = promoResult.discountAmount;
  const total = subtotal + taxAmount - discountAmount;

  // Round values
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedTax = Math.round(taxAmount * 100) / 100;
  const roundedDiscount = Math.round(discountAmount * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  const orderNumber = await generateOrderNumber();

  // 6. DB Transaction
  const order = await prisma.$transaction(async (tx) => {
    // Decrement stock for all lines — throws if any product is out of stock
    await decrementStockForLines(tx, lines.map((l) => ({ productId: l.productId, qty: l.qty })));

    const ord = await tx.order.create({
      data: {
        orderNumber,
        sessionId,
        tableId: tableId || null,
        customerId: customerId || null,
        employeeId,
        status: "DRAFT",
        subtotal: roundedSubtotal,
        taxAmount: roundedTax,
        discountAmount: roundedDiscount,
        total: roundedTotal,
      },
    });

    const createdLines = [];
    for (const line of linesWithPromo) {
      const createdLine = await tx.orderLine.create({
        data: {
          orderId: ord.id,
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          lineTotal: Math.round(line.qty * line.unitPrice * 100) / 100,
          appliedPromoId: line.appliedPromoId,
        },
      });
      createdLines.push(createdLine);
    }

    const kdsTicket = await tx.kdsTicket.create({
      data: {
        orderId: ord.id,
        status: "TO_COOK",
      },
    });

    const kdsItems = [];
    for (const line of createdLines) {
      const item = await tx.kdsTicketItem.create({
        data: {
          ticketId: kdsTicket.id,
          orderLineId: line.id,
          isStruckThrough: false,
        },
      });
      kdsItems.push(item);
    }

    return {
      ...ord,
      lines: createdLines,
      kdsTicketId: kdsTicket.id,
      kdsItems,
    };
  });

  // 7. Socket.io Event Emission
  try {
    const io = getIO();
    const items = order.kdsItems.map((ki: any) => {
      const line = order.lines.find((l: any) => l.id === ki.orderLineId)!;
      const product = dbProducts.find((p) => p.id === line.productId)!;
      return {
        id: ki.id,
        name: product.name,
        qty: line.qty,
        isStruckThrough: ki.isStruckThrough,
      };
    });

    io.to("kds").emit("ticket:new", {
      id: order.kdsTicketId,
      orderNumber: order.orderNumber,
      status: "TO_COOK",
      items,
    });
  } catch {
    // skip socket warning if not initialized
  }

  return order;
}

export function updateStatus(id: string, status: "DRAFT" | "PAID" | "CANCELLED") {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

export async function markPaid(
  id: string,
  method: "CASH" | "CARD" | "UPI",
  reference?: string | null,
  changeDue?: number | null
) {
  const order = await getById(id);
  if (!order) throw new Error("Order not found");
  if (order.status !== "DRAFT") throw new Error("Order is not in DRAFT status");

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "PAID" },
  });

  const lines = order.orderLines.map((l) => ({
    name: l.product.name,
    qty: l.qty,
    unitPrice: Number(l.unitPrice),
    lineTotal: Number(l.lineTotal),
  }));

  const receipt = {
    orderNumber: order.orderNumber,
    date: updated.updatedAt,
    customer: order.customer ? order.customer.name : null,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    method,
    changeDue: changeDue || null,
    reference: reference || null,
    paidAt: updated.updatedAt,
    items: lines,
  };

  return {
    order: updated,
    receipt,
  };
}

export async function deleteOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.status !== "DRAFT") {
    throw new Error("Only DRAFT orders can be deleted");
  }

  const kdsTicket = await prisma.kdsTicket.findUnique({ where: { orderId: id } });
  if (kdsTicket) {
    await prisma.kdsTicketItem.deleteMany({ where: { ticketId: kdsTicket.id } });
    await prisma.kdsTicket.delete({ where: { id: kdsTicket.id } });
  }

  await prisma.orderLine.deleteMany({ where: { orderId: id } });
  return prisma.order.delete({ where: { id } });
}

export { deleteOrder as delete };
