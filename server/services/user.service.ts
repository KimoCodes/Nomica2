import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/server/utils/password";
import type { RegisterInput } from "@/server/validators/auth.schema";

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      coachProfile: true,
      clientProfile: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      coachProfile: true,
      clientProfile: true,
    },
  });
}

export async function createUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }

  const hashedPassword = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
      },
    });

    if (input.role === Role.COACH) {
      await tx.coachProfile.create({
        data: {
          userId: user.id,
          specialties: [],
        },
      });
    }

    if (input.role === Role.CLIENT) {
      await tx.clientProfile.create({
        data: { userId: user.id },
      });
    }

    return user;
  });
}

export async function validateUserCredentials(email: string, password: string) {
  const user = await getUserByEmail(email.toLowerCase().trim());

  if (!user) {
    return null;
  }

  if (!user.emailVerified) {
    return null;
  }

  if (
    user.role === Role.COACH &&
    user.coachProfile &&
    !user.coachProfile.approved
  ) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return user;
}

export async function createVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  return prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
}

export async function verifyEmailToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return record.identifier;
}
