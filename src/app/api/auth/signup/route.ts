import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/bcrypt";
import { signToken } from "@/lib/jwt";
import { signupSchema } from "@/schemas/auth";
import { getUserByEmail, createUser, countUsers } from "@/lib/db/users";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const total = await countUsers();
  const role = total === 0 ? "ADMIN" : "EMPLOYEE";
  const passwordHash = await hashPassword(password);

  const user = await createUser({ name, email, passwordHash, role });

  const token = await signToken({ userId: user.id, role: user.role });
  const res = NextResponse.json({ data: { role: user.role, name: user.name } }, { status: 201 });
  res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
