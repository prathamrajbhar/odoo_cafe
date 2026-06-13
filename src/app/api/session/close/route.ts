import { NextRequest, NextResponse } from "next/server";
import { getActive, close, getSummary } from "@/lib/db/sessions";
import { getIO } from "@/lib/socket";

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "x-user-id header is missing" }, { status: 400 });
  }

  const activeSession = await getActive(userId);
  if (!activeSession) {
    return NextResponse.json({ error: "No active session found for this user" }, { status: 400 });
  }

  try {
    await close(activeSession.id);
    const summary = await getSummary(activeSession.id);

    try {
      getIO().to("kds").emit("session:closed");
    } catch {
      // socket not initialized in test environments
    }

    return NextResponse.json({ data: { summary } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
