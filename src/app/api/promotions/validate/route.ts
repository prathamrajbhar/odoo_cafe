import { NextRequest, NextResponse } from "next/server";
import { validatePromosSchema } from "@/schemas/promotion";
import { applyPromos } from "@/lib/promo";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = validatePromosSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { code, subtotal, lines } = parsed.data;

  try {
    const result = await applyPromos(lines, subtotal, code);
    return NextResponse.json({
      data: {
        appliedPromos: result.appliedPromos,
        discountAmount: result.discountAmount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

