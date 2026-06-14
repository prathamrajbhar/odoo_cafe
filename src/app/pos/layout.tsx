import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { POSProvider } from "@/context/POSContext";
import POSNavbar from "@/components/pos/POSNavbar";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

async function getAnyActiveSession(): Promise<string | null> {
  // Any open session across all users — only ADMINs open sessions,
  // but EMPLOYEEs also use the POS under that session.
  const existing = await prisma.session.findFirst({
    where: { closedAt: null },
    select: { id: true },
    orderBy: { openedAt: "desc" },
  });
  return existing?.id ?? null;
}

async function userExists(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  return user !== null;
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

  if (!(await userExists(payload.userId))) redirect("/login");

  const sessionId = await getAnyActiveSession();

  // No active session — show a holding screen instead of redirect-looping
  if (!sessionId) {
    return (
      <div className="h-screen bg-surface flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h1 className="text-headline-sm font-bold text-on-surface mb-2">
            No Active Session
          </h1>
          <p className="text-body-md text-on-surface-variant max-w-sm">
            The POS session is currently closed. Please ask a manager to open a session before you can start taking orders.
          </p>
        </div>
        <a
          href="/pos"
          className="mt-2 inline-flex items-center gap-2 border border-available-border text-on-surface text-label-md font-semibold px-5 py-2.5 rounded-lg hover:bg-surface-container transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Refresh
        </a>
      </div>
    );
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

