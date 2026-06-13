import { NextRequest, NextResponse } from "next/server";
import { categoryCreateSchema } from "@/schemas/category";
import { getAll, create } from "@/lib/db/categories";

export async function GET() {
  const categories = await getAll();
  return NextResponse.json({ data: { categories } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, colorHex } = parsed.data;
  const category = await create(name, colorHex);
  return NextResponse.json({ data: { category } }, { status: 201 });
}
