import { jwtVerify } from "jose";
import type { Socket } from "socket.io";
import type { Role } from "@prisma/client";

export type SocketUser = {
  userId: string;
  role: Role;
  name: string;
};

function getCookie(cookies: string, name: string): string | undefined {
  const match = cookies.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export async function authenticateSocket(
  socket: Socket,
): Promise<SocketUser> {
  const cookieHeader = socket.handshake.headers.cookie ?? "";
  const isSecure = process.env.AUTH_URL?.startsWith("https") ?? false;

  const cookieName = isSecure
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const tokenValue = getCookie(cookieHeader, cookieName);

  if (!tokenValue) {
    throw new Error("UNAUTHORIZED");
  }

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

  try {
    const { payload } = await jwtVerify(tokenValue, secret, {
      algorithms: ["HS256"],
    });

    const userId = (payload.id ?? payload.sub) as string | undefined;
    const role = payload.role as string | undefined;

    if (!userId || !role) {
      throw new Error("UNAUTHORIZED");
    }

    return {
      userId,
      role: role as Role,
      name: (payload.name as string) ?? "User",
    };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}
