import type { Role } from "@prisma/client";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string | null;
};

export type AuthSession = {
  user: SessionUser;
  expires: string;
};
