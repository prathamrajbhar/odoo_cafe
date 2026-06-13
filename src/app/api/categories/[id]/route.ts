import { NextRequest, NextResponse } from "next/server";
import { updateCategorySchema } from "@/schemas/category";
import { getCategoryById, updateCategory, deleteCategory } from "@/lib/db/categories";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getCategoryById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const category = await updateCategory(id, parsed.data);
  return NextResponse.json({ data: { category } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getCategoryById(id);
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  try {
    await deleteCategory(id);
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "P2003") {
      return NextResponse.json({ error: "Category has products — remove them first" }, { status: 400 });
    }
    throw e;
  }
  return NextResponse.json({ data: { success: true } });
}
