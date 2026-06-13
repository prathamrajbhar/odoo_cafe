import { NextRequest, NextResponse } from "next/server";
import { createCategorySchema } from "@/schemas/category";
import { listCategories, createCategory } from "@/lib/db/categories";

export async function GET() {
  const categories = await listCategories();
  return NextResponse.json({ data: { categories } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const category = await createCategory(parsed.data);
  return NextResponse.json({ data: { category } }, { status: 201 });
}
