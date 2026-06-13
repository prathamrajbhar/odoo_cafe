import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "x-user-id header is missing" }, { status: 400 });
  }

  // Active session for this user
  const activeSession = await prisma.session.findFirst({
    where: { openedByUserId: userId, closedAt: null },
    include: { openedBy: { select: { name: true } } },
  });

  // Most recently closed session for "Last Closing Sale" display
  const lastClosedSession = await prisma.session.findFirst({
    where: { openedByUserId: userId, closedAt: { not: null } },
    orderBy: { closedAt: "desc" },
    include: { openedBy: { select: { name: true } } },
  });

  const toShape = (s: typeof activeSession) => {
    if (!s) return null;
    return {
      id: s.id,
      openedAt: s.openedAt,
      closedAt: s.closedAt,
      closingSaleAmount: s.closingSaleAmount ? Number(s.closingSaleAmount) : null,
      openedBy: s.openedBy,
    };
  };

  return NextResponse.json({
    data: {
      activeSession: toShape(activeSession),
      lastSession: toShape(lastClosedSession),
    },
  });
}
