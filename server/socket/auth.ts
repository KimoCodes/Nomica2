import { getToken } from "next-auth/jwt";
import type { Socket } from "socket.io";
import type { Role } from "@prisma/client";

export type SocketUser = {
  userId: string;
  role: Role;
  name: string;
};

export async function authenticateSocket(
  socket: Socket,
): Promise<SocketUser> {
  const cookieHeader = socket.handshake.headers.cookie ?? "";

  const token = await getToken({
    req: {
      headers: {
        cookie: cookieHeader,
      },
    },
    secret: process.env.AUTH_SECRET!,
    secureCookie: process.env.AUTH_URL?.startsWith("https://") ?? false,
  });

  const userId = (token?.id ?? token?.sub) as string | undefined;

  if (!userId || !token?.role) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    userId,
    role: token.role as Role,
    name: (token.name as string) ?? "User",
  };
}
