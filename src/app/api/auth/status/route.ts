import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db/users";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET as string;

interface JwtPayload {
  userId: string;
  role: string;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "No token provided" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    const user = await getUserById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        status: user.status,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
