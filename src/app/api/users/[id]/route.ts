import { NextRequest, NextResponse } from "next/server";
import { updateUserSchema } from "@/schemas/auth";
import { getById, update, delete as deleteUserHelper, getByEmail } from "@/lib/db/users";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  const loggedInUserId = req.headers.get("x-user-id");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check email uniqueness if email is changed
  if (parsed.data.email) {
    const emailUser = await getByEmail(parsed.data.email);
    if (emailUser && emailUser.id !== id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
  }

  // Block a logged-in user from updating their own role or status
  if (id === loggedInUserId) {
    if (parsed.data.role !== undefined || parsed.data.status !== undefined) {
      return NextResponse.json({ error: "Cannot update own role or status" }, { status: 400 });
    }
  }

  const user = await update(id, parsed.data);
  return NextResponse.json({ data: { user } });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const role = req.headers.get("x-user-role");
  const loggedInUserId = req.headers.get("x-user-id");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await getById(id);
  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Block a logged-in user from deleting their own account
  if (id === loggedInUserId) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await deleteUserHelper(id);
  return NextResponse.json({ data: { success: true } });
}
