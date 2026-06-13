import { NextRequest, NextResponse } from "next/server";
import { createPromotionSchema } from "@/schemas/promotion";
import { getAll, create } from "@/lib/db/promotions";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  const activeOnly = role !== "ADMIN";
  const promotions = await getAll(activeOnly);
  return NextResponse.json({ data: { promotions } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createPromotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const promotion = await create(parsed.data);
    return NextResponse.json({ data: { promotion } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

