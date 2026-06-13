import { NextRequest, NextResponse } from "next/server";
import { updatePromotionSchema } from "@/schemas/promotion";
import { getPromotionById, updatePromotion, deletePromotion } from "@/lib/db/promotions";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updatePromotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getPromotionById(id);
  if (!existing) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  const promotion = await updatePromotion(id, parsed.data);
  return NextResponse.json({ data: { promotion } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getPromotionById(id);
  if (!existing) {
    return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
  }

  await deletePromotion(id);
  return NextResponse.json({ data: { success: true } });
}
