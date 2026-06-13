import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { POSProvider } from "@/context/POSContext";
import POSNavbar from "@/components/pos/POSNavbar";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

async function getActiveSession(userId: string): Promise<string | null> {
  // Verify that the user actually exists in the database first
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!userExists) {
    return null;
  }

  // Return existing open session
  const existing = await prisma.session.findFirst({
    where: { openedByUserId: userId, closedAt: null },
    select: { id: true },
  });
  if (existing) return existing.id;

  return null;
}

export default async function POSLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) redirect("/login");

  let payload: { userId: string; role: string } | null = null;
  try {
    payload = verifyToken(token);
  } catch {
    redirect("/login");
  }
  if (!payload) redirect("/login");

  const sessionId = await getActiveSession(payload.userId);
  if (!sessionId) {
    redirect("/admin/session");
  }

  return (
    <POSProvider initialSessionId={sessionId}>
      <div className="h-screen bg-surface flex flex-col overflow-hidden">
        <POSNavbar />
        <main className="flex-1 pt-14 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </POSProvider>
  );
}

