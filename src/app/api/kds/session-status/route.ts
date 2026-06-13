import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — no auth, same as all /api/kds/* routes
export async function GET() {
  const active = await prisma.session.findFirst({
    where: { closedAt: null },
    select: { id: true, openedAt: true },
  });

  return NextResponse.json({ data: { active: !!active } });
}
