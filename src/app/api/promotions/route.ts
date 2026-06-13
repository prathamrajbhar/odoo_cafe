import { NextRequest, NextResponse } from "next/server";
import { createPromotionSchema } from "@/schemas/promotion";
import { listPromotions, createPromotion } from "@/lib/db/promotions";

export async function GET() {
  const promotions = await listPromotions();
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

  const { promoType, code, productId, minQty, minOrderAmount } = parsed.data;

  if (promoType === "COUPON" && !code) {
    return NextResponse.json({ error: "Coupon code is required for COUPON type" }, { status: 400 });
  }
  if (promoType === "PRODUCT_BASED" && (!productId || minQty === undefined)) {
    return NextResponse.json(
      { error: "productId and minQty are required for PRODUCT_BASED type" },
      { status: 400 }
    );
  }
  if (promoType === "ORDER_BASED" && minOrderAmount === undefined) {
    return NextResponse.json(
      { error: "minOrderAmount is required for ORDER_BASED type" },
      { status: 400 }
    );
  }

  const promotion = await createPromotion(parsed.data);
  return NextResponse.json({ data: { promotion } }, { status: 201 });
}
