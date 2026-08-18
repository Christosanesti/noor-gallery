import { auth } from "@/auth";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = (process.env.AUTH_ADMIN_EMAIL ?? "").trim().toLowerCase();

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAIL) return false;
  return email === ADMIN_EMAIL;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in?callbackUrl=/admin");
  }

  const allowed = await isAdmin();
  if (!allowed) {
    redirect("/?error=admin-only");
  }

  return session.user.id ?? "admin";
}

export async function assertAdminApi() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("UNAUTHORIZED");
  }

  const allowed = await isAdmin();
  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  return session.user.id ?? "admin";
}
