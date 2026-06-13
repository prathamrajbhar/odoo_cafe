import { NextRequest, NextResponse } from "next/server";
import { reportFilterSchema } from "@/schemas/report";
import {
  getKPIs,
  getSalesTrend,
  getTopCategories,
  getTopProducts,
  getTopOrders,
} from "@/lib/db/reports";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");

  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = req.nextUrl.searchParams;
  const rawQuery = {
    period: searchParams.get("period"),
    from: searchParams.get("from") || null,
    to: searchParams.get("to") || null,
    employeeId: searchParams.get("employeeId") || null,
    sessionId: searchParams.get("sessionId") || null,
    productId: searchParams.get("productId") || null,
  };

  const parsed = reportFilterSchema.safeParse(rawQuery);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const filters = parsed.data;

  try {
    const kpis = await getKPIs(filters);
    const salesTrend = await getSalesTrend(filters);
    const topCategories = await getTopCategories(filters);
    const topProducts = await getTopProducts(filters);
    const topOrders = await getTopOrders(filters);

    return NextResponse.json({
      data: {
        kpis,
        salesTrend,
        topCategories,
        topProducts,
        topOrders,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
