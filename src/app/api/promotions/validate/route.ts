import { NextRequest, NextResponse } from "next/server";
import { validatePromoSchema } from "@/schemas/promotion";
import { validateCoupon, evaluateProductPromos, evaluateOrderPromos } from "@/lib/promo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = validatePromoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { code, subtotal, lines } = parsed.data;

  const [productPromos, orderPromos] = await Promise.all([
    evaluateProductPromos(lines),
    evaluateOrderPromos(subtotal),
  ]);

  let coupon = null;
  if (code) {
    coupon = await validateCoupon(code);
    if (!coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 400 });
    }
  }

  return NextResponse.json({
    data: { coupon, productPromos, orderPromos },
  });
}
