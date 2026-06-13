import { NextRequest, NextResponse } from "next/server";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/lib/jwt";
import { getRefreshToken, deleteRefreshToken, createRefreshToken } from "@/lib/db/refreshTokens";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  let payload: { userId: string; role: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }

  const stored = await getRefreshToken(refreshToken);
  if (!stored || stored.expiresAt < new Date()) {
    return NextResponse.json({ error: "Refresh token expired or revoked" }, { status: 401 });
  }

  if (stored.user.status === "DISABLED") {
    await deleteRefreshToken(refreshToken);
    return NextResponse.json({ error: "Account disabled" }, { status: 403 });
  }

  // Rotate: delete old, issue new
  await deleteRefreshToken(refreshToken);
  const newAccessToken = signAccessToken({ userId: stored.user.id, role: stored.user.role });
  const newRefreshToken = signRefreshToken({ userId: stored.user.id, role: stored.user.role });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await createRefreshToken(stored.user.id, newRefreshToken, expiresAt);

  const res = NextResponse.json({ data: { success: true } });
  res.cookies.set("access_token", newAccessToken, { httpOnly: true, path: "/", maxAge: 60 * 15 });
  res.cookies.set("refresh_token", newRefreshToken, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
