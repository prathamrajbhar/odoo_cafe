import { NextRequest, NextResponse } from "next/server";
import { comparePassword } from "@/lib/bcrypt";
import { signToken } from "@/lib/jwt";
import { loginSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/lib/db/users";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await getUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (user.status === "DISABLED") {
    return NextResponse.json({ error: "Account disabled" }, { status: 403 });
  }

  const token = await signToken({ userId: user.id, role: user.role });
  const res = NextResponse.json({ data: { role: user.role, name: user.name } });
  res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
