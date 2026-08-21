import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  jwt: {
    async encode({ token, secret }) {
      const s = Array.isArray(secret) ? secret[0] : secret;
      const key = new TextEncoder().encode(s);
      return new SignJWT(token as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(key);
    },
    async decode({ token, secret }) {
      const s = Array.isArray(secret) ? secret[0] : secret;
      const key = new TextEncoder().encode(s);
      try {
        const { payload } = await jwtVerify(token!, key, {
          algorithms: ["HS256"],
        });
        return payload as any;
      } catch {
        return null;
      }
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
