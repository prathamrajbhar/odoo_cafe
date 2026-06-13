import { NextRequest, NextResponse } from "next/server";
import { changePasswordSchema } from "@/schemas/auth";
import { getUserById, updatePasswordHash } from "@/lib/db/users";
import { hashPassword } from "@/lib/bcrypt";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getUserById(id);
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await updatePasswordHash(id, passwordHash);
  return NextResponse.json({ data: { success: true } });
}
