import { NextRequest, NextResponse } from "next/server";
import { categoryUpdateSchema } from "@/schemas/category";
import { getById, update, delete as deleteCategoryHelper, getWithProductCount } from "@/lib/db/categories";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const category = await update(id, parsed.data);
  return NextResponse.json({ data: { category } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getWithProductCount(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (existing._count.products > 0) {
    return NextResponse.json({ error: "Category has products — remove them first" }, { status: 400 });
  }

  await deleteCategoryHelper(id);
  return NextResponse.json({ data: { success: true } });
}
