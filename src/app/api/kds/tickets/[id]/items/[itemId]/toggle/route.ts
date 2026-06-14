import { NextRequest, NextResponse } from "next/server";
import { toggle } from "@/lib/db/kdsTicketItems";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";
import { KDSStatus } from "@/generated/prisma/client";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: ticketId, itemId } = await params;
    const item = await toggle(itemId);

    // Validate item belongs to the specified ticket
    if (item.ticketId !== ticketId) {
      return NextResponse.json(
        { error: "Item does not belong to the specified ticket" },
        { status: 400 }
      );
    }

    // Fetch all items for this ticket to compute new status
    const allItems = await prisma.kdsTicketItem.findMany({
      where: { ticketId },
      select: { isStruckThrough: true },
    });

    const allStruck = allItems.length > 0 && allItems.every((i) => i.isStruckThrough);
    const anyStruck = allItems.some((i) => i.isStruckThrough);

    const computedStatus: KDSStatus = allStruck
      ? KDSStatus.COMPLETED
      : anyStruck
      ? KDSStatus.PREPARING
      : KDSStatus.TO_COOK;

    // Update ticket status if it changed
    const currentTicket = await prisma.kdsTicket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });

    let newStatus = currentTicket?.status ?? computedStatus;
    if (currentTicket && currentTicket.status !== computedStatus) {
      await prisma.kdsTicket.update({
        where: { id: ticketId },
        data: { status: computedStatus },
      });
      newStatus = computedStatus;
    }

    // Broadcast both item change and (possibly new) status in one event
    try {
      const io = getIO();
      io.to("kds").emit("ticket:updated", {
        id: ticketId,
        status: newStatus,
        items: [{ id: item.id, isStruckThrough: item.isStruckThrough }],
      });
    } catch {
      // Ignored: socket.io not initialised in offline tests
    }

    return NextResponse.json({
      data: {
        item: { id: item.id, isStruckThrough: item.isStruckThrough },
        status: newStatus,
      },
    });
  } catch (err: any) {
    if (err.message === "Ticket item not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
