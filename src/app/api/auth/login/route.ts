import { NextRequest, NextResponse } from "next/server";
import { comparePassword } from "@/lib/bcrypt";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { loginSchema } from "@/schemas/auth";
import { getUserByEmail } from "@/lib/db/users";
import { createRefreshToken } from "@/lib/db/refreshTokens";

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

  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshToken(user.id, refreshToken, expiresAt);

  const res = NextResponse.json({ data: { role: user.role, name: user.name } });
  res.cookies.set("access_token", accessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
  res.cookies.set("refresh_token", refreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
