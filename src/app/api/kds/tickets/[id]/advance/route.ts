import { NextRequest, NextResponse } from "next/server";
import { advance } from "@/lib/db/kdsTickets";
import { getIO } from "@/lib/socket";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const ticket = await advance(id);

    try {
      const io = getIO();
      io.to("kds").emit("ticket:updated", {
        id: ticket.id,
        status: ticket.status,
      });
    } catch {
      // Ignored: socket.io is not initialized in offline tests
    }

    return NextResponse.json({
      data: {
        ticket: {
          id: ticket.id,
          status: ticket.status,
        },
      },
    });
  } catch (err: any) {
    if (err.message === "Ticket not found") {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
