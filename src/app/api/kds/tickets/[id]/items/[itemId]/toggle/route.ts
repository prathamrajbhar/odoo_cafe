import { NextRequest, NextResponse } from "next/server";
import { toggle } from "@/lib/db/kdsTicketItems";
import { getIO } from "@/lib/socket";

type Params = { params: Promise<{ id: string; itemId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id: ticketId, itemId } = await params;
    const item = await toggle(itemId);

    // Validate that the item belongs to the specified ticket in the path
    if (item.ticketId !== ticketId) {
      return NextResponse.json(
        { error: "Item does not belong to the specified ticket" },
        { status: 400 }
      );
    }

    try {
      const io = getIO();
      io.to("kds").emit("ticket:updated", {
        id: item.ticketId,
        items: [
          {
            id: item.id,
            isStruckThrough: item.isStruckThrough,
          },
        ],
      });
    } catch {
      // Ignored: socket.io is not initialized in offline tests
    }

    return NextResponse.json({
      data: {
        item: {
          id: item.id,
          isStruckThrough: item.isStruckThrough,
        },
      },
    });
  } catch (err: any) {
    if (err.message === "Ticket item not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
