import { compare, hashSync } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations";

let adminPasswordHash: string | null = null;

function getAdminPasswordHash() {
  if (adminPasswordHash) return adminPasswordHash;
  const password = process.env.AUTH_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("AUTH_ADMIN_PASSWORD is not set");
  }
  adminPasswordHash = hashSync(password, 10);
  return adminPasswordHash;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const adminEmail = (process.env.AUTH_ADMIN_EMAIL ?? "").trim().toLowerCase();
        if (!adminEmail) return null;

        const email = parsed.data.email.trim().toLowerCase();
        const passwordOk = await compare(parsed.data.password, getAdminPasswordHash());
        if (email !== adminEmail || !passwordOk) return null;

        return {
          id: "admin",
          email: adminEmail,
          name: "مدیر نور گالری",
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.sub = user.id ?? "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? "admin";
        session.user.email = (token.email as string) ?? "";
      }
      return session;
    },
  },
});
