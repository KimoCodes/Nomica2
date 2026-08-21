"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { FavoriteType } from "@prisma/client";

export async function getFavorites(type?: FavoriteType) {
  const session = await requireAuth();
  const userId = session.user.id;

  const where = { userId, ...(type ? { type } : {}) };

  return prisma.favorite.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function isFavorited(type: FavoriteType, targetId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const favorite = await prisma.favorite.findUnique({
    where: { userId_type_targetId: { userId, type, targetId } },
  });

  return !!favorite;
}

export async function toggleFavorite(type: FavoriteType, targetId: string) {
  const session = await requireAuth();
  const userId = session.user.id;

  const existing = await prisma.favorite.findUnique({
    where: { userId_type_targetId: { userId, type, targetId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { favorited: false };
  } else {
    await prisma.favorite.create({
      data: { userId, type, targetId },
    });
    return { favorited: true };
  }
}

export async function getFavoriteCount(type: FavoriteType) {
  const session = await requireAuth();
  const userId = session.user.id;

  return prisma.favorite.count({
    where: { userId, type },
  });
}
