import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import KDSLoginForm from "@/components/kds/KDSLoginForm";

export default async function KDSLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let authed = false;
  if (token) {
    try {
      const payload = verifyToken(token);
      authed = payload.role === "KITCHEN" || payload.role === "ADMIN";
    } catch {
      authed = false;
    }
  }

  if (!authed) {
    return <KDSLoginForm />;
  }

  return <>{children}</>;
}
