import { NextRequest, NextResponse } from "next/server";
import { create } from "@/lib/db/sessions";

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role");
  if (!role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "x-user-id header is missing" }, { status: 400 });
  }

  try {
    const session = await create(userId);
    return NextResponse.json(
      {
        data: {
          session: {
            id: session.id,
            openedAt: session.openedAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
