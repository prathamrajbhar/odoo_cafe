import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/bcrypt";
import { createUserSchema } from "@/schemas/auth";
import { listUsers, createUser, getUserByEmail } from "@/lib/db/users";

export async function GET(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ data: { users } });
}

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password, role: userRole } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ name, email, passwordHash, role: userRole });
  return NextResponse.json({ data: { user } }, { status: 201 });
}
