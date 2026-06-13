import { NextRequest, NextResponse } from "next/server";
import { getAll, seedPaymentMethods } from "@/lib/db/paymentMethods";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Ensure seeded first so exactly 3 always exist
  await seedPaymentMethods();

  const methods = await getAll();
  return NextResponse.json({ data: { methods } });
}
