import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessions = await prisma.session.findMany({
    include: { openedBy: { select: { name: true } } },
    orderBy: { openedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    data: {
      sessions: sessions.map((s) => ({
        id: s.id,
        openedAt: s.openedAt,
        closedAt: s.closedAt,
        closingSaleAmount: s.closingSaleAmount ? Number(s.closingSaleAmount) : null,
        openedBy: s.openedBy.name,
      })),
    },
  });
}
