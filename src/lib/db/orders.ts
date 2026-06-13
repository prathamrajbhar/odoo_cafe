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
      table: { select: { id: true, number: true, floorId: true } },
      employee: { select: { id: true, name: true } },
      orderLines: {
        include: {
          product: { select: { id: true, name: true, taxRate: true } },
          appliedPromo: true,
        },
      },
    },
  });
}

export async function generateOrderNumber(tx?: any): Promise<string> {
  const client = tx || prisma;
  const lastOrder = await client.order.findFirst({
    orderBy: { orderNumber: "desc" },
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
  lines: Array<{ productId: string; qty: number; unitPrice?: number; discountPercent?: number | null }>;
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
    const dbProduct = dbProducts.find((p) => p.id === line.productId)!;
    const price = line.unitPrice !== undefined ? line.unitPrice : Number(dbProduct.price);
    const lineDiscount = price * line.qty * ((line.discountPercent || 0) / 100);
    subtotal += (price * line.qty) - lineDiscount;
  }

  const promoResult = await applyPromos(lines, subtotal, couponCode);

  // Map product promos to lines
  const linesWithPromo = lines.map((line) => {
    const dbProduct = dbProducts.find((p) => p.id === line.productId)!;
    const price = line.unitPrice !== undefined ? line.unitPrice : Number(dbProduct.price);
    const lineDiscount = price * line.qty * ((line.discountPercent || 0) / 100);
    const linePromo = promoResult.appliedPromos.find(
      (p) => p.scope === "LINE" && p.productId === line.productId
    );
    return {
      productId: line.productId,
      qty: line.qty,
      unitPrice: price,
      lineDiscount,
      appliedPromoId: linePromo ? linePromo.promoId : null,
    };
  });

  // Calculate tax amount (gross)
  let taxAmount = 0;
  for (const line of linesWithPromo) {
    const product = dbProducts.find((p) => p.id === line.productId)!;
    const lineTax = ((line.qty * line.unitPrice) - line.lineDiscount) * (product.taxRate / 100);
    taxAmount += lineTax;
  }

  const discountAmount = promoResult.discountAmount;
  const total = subtotal + taxAmount - discountAmount;

  // Round values
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedTax = Math.round(taxAmount * 100) / 100;
  const roundedDiscount = Math.round(discountAmount * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  // 6. DB Transaction with retry loop on unique constraint conflict
  let attempts = 0;
  const maxAttempts = 5;
  let order;

  while (attempts < maxAttempts) {
    try {
      order = await prisma.$transaction(async (tx) => {
        // Decrement stock for all lines — throws if any product is out of stock
        await decrementStockForLines(tx, lines.map((l) => ({ productId: l.productId, qty: l.qty })));

        // Generate the order number INSIDE the transaction so it reads the absolute latest DB state
        const orderNumber = await generateOrderNumber(tx);

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
          lineTotal: Math.round(((line.qty * line.unitPrice) - line.lineDiscount) * 100) / 100,
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

      // Break out of the retry loop if successful
      break;
    } catch (err: any) {
      attempts++;
      const isUniqueConstraint =
        err.code === "P2002" ||
        err.message?.includes("Unique constraint") ||
        err.message?.includes("order_number") ||
        err.message?.includes("orderNumber");
      // If it's a unique constraint error and we have attempts left, retry.
      if (isUniqueConstraint && attempts < maxAttempts) {
        continue;
      }
      throw err;
    }
  }

  if (!order) {
    throw new Error("Failed to create order due to unique constraint conflict");
  }

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
  if (order.status !== "DRAFT" && order.status !== "PAID") {
    throw new Error("Only DRAFT or PAID orders can be deleted");
  }

  const kdsTicket = await prisma.kdsTicket.findUnique({ where: { orderId: id } });
  if (kdsTicket) {
    await prisma.kdsTicketItem.deleteMany({ where: { ticketId: kdsTicket.id } });
    await prisma.kdsTicket.delete({ where: { id: kdsTicket.id } });
  }

  await prisma.orderLine.deleteMany({ where: { orderId: id } });
  return prisma.order.delete({ where: { id } });
}

export async function update(
  id: string,
  data: {
    sessionId: string;
    tableId?: string | null;
    customerId?: string | null;
    employeeId: string;
    lines: Array<{ productId: string; qty: number; unitPrice?: number; discountPercent?: number | null }>;
    couponCode?: string | null;
  }
) {
  const { sessionId, tableId, customerId, lines, couponCode } = data;

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
    const dbProduct = dbProducts.find((p) => p.id === line.productId)!;
    const price = line.unitPrice !== undefined ? line.unitPrice : Number(dbProduct.price);
    const lineDiscount = price * line.qty * ((line.discountPercent || 0) / 100);
    subtotal += (price * line.qty) - lineDiscount;
  }

  const promoResult = await applyPromos(lines, subtotal, couponCode);

  // Map product promos to lines
  const linesWithPromo = lines.map((line) => {
    const dbProduct = dbProducts.find((p) => p.id === line.productId)!;
    const price = line.unitPrice !== undefined ? line.unitPrice : Number(dbProduct.price);
    const lineDiscount = price * line.qty * ((line.discountPercent || 0) / 100);
    const linePromo = promoResult.appliedPromos.find(
      (p) => p.scope === "LINE" && p.productId === line.productId
    );
    return {
      productId: line.productId,
      qty: line.qty,
      unitPrice: price,
      lineDiscount,
      appliedPromoId: linePromo ? linePromo.promoId : null,
    };
  });

  // Calculate tax amount (gross)
  let taxAmount = 0;
  for (const line of linesWithPromo) {
    const product = dbProducts.find((p) => p.id === line.productId)!;
    const lineTax = ((line.qty * line.unitPrice) - line.lineDiscount) * (product.taxRate / 100);
    taxAmount += lineTax;
  }

  const discountAmount = promoResult.discountAmount;
  const total = subtotal + taxAmount - discountAmount;

  // Round values
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const roundedTax = Math.round(taxAmount * 100) / 100;
  const roundedDiscount = Math.round(discountAmount * 100) / 100;
  const roundedTotal = Math.round(total * 100) / 100;

  // Retrieve existing order and lines inside transaction to restore stock first
  const order = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id },
      include: { orderLines: true, kdsTicket: true },
    });
    if (!existingOrder) {
      throw new Error("Order not found");
    }
    if (existingOrder.status !== "DRAFT") {
      throw new Error("Only draft orders can be updated");
    }

    // A. Restore/increment stock from existing order lines
    for (const oldLine of existingOrder.orderLines) {
      await tx.product.update({
        where: { id: oldLine.productId },
        data: { stock: { increment: oldLine.qty } },
      });
    }

    // B. Decrement stock for new lines — check if we have enough stock now
    for (const line of lines) {
      const product = await tx.product.findUnique({ where: { id: line.productId }, select: { stock: true, name: true } });
      if (!product) throw new Error(`Product ${line.productId} not found`);
      if (product.stock < line.qty) throw new Error(`Insufficient stock for "${product.name}" (available: ${product.stock}, requested: ${line.qty})`);
      await tx.product.update({
        where: { id: line.productId },
        data: { stock: { decrement: line.qty } },
      });
    }

    // C. Delete old order lines
    await tx.orderLine.deleteMany({
      where: { orderId: id },
    });

    // D. Update order master
    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        tableId: tableId || null,
        customerId: customerId || null,
        subtotal: roundedSubtotal,
        taxAmount: roundedTax,
        discountAmount: roundedDiscount,
        total: roundedTotal,
      },
    });

    // E. Create new order lines
    const createdLines = [];
    for (const line of linesWithPromo) {
      const createdLine = await tx.orderLine.create({
        data: {
          orderId: id,
          productId: line.productId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          lineTotal: Math.round(((line.qty * line.unitPrice) - line.lineDiscount) * 100) / 100,
          appliedPromoId: line.appliedPromoId,
        },
      });
      createdLines.push(createdLine);
    }

    // F. Re-create or update KDS ticket
    let kdsTicket = existingOrder.kdsTicket;
    if (!kdsTicket) {
      kdsTicket = await tx.kdsTicket.create({
        data: { orderId: id, status: "TO_COOK" },
      });
    } else {
      // Delete old items
      await tx.kdsTicketItem.deleteMany({
        where: { ticketId: kdsTicket.id },
      });
    }

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
      ...updatedOrder,
      lines: createdLines,
      kdsTicketId: kdsTicket.id,
      kdsItems,
    };
  });

  // 7. Socket.io Event Emission to KDS
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

export { deleteOrder as delete };
