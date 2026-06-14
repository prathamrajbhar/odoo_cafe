import { NextRequest, NextResponse } from "next/server";
import { getAll, create } from "@/lib/db/paymentMethods";
import { PaymentType } from "@/generated/prisma/client";
import { z } from "zod";

const createPaymentMethodSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(PaymentType),
  upiId: z.string().nullable().optional(),
});

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const methods = await getAll();
  return NextResponse.json({ data: { methods } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createPaymentMethodSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  try {
    const method = await create(parsed.data);
    return NextResponse.json({ data: { method } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
