import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/bcrypt";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { signupSchema } from "@/schemas/auth";
import { getUserByEmail, createUser, countUsers } from "@/lib/db/users";
import { createRefreshToken } from "@/lib/db/refreshTokens";

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

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshToken(user.id, refreshToken, expiresAt);

  const res = NextResponse.json({ data: { role: user.role, name: user.name } }, { status: 201 });
  res.cookies.set("access_token", accessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
  res.cookies.set("refresh_token", refreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
