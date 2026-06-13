import { NextRequest, NextResponse } from "next/server";
import { update } from "@/lib/db/paymentMethods";
import { z } from "zod";

const updatePaymentMethodSchema = z.object({
  isActive: z.boolean().optional(),
  upiId: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updatePaymentMethodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  try {
    const updated = await update(id, parsed.data);
    return NextResponse.json({ data: { method: updated } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
