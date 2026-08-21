"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite, isFavorited } from "@/actions/favorites.actions";
import type { FavoriteType } from "@prisma/client";

export function FavoriteButton({
  type,
  targetId,
  initialFavorited = false,
  size = "icon",
  className,
}: {
  type: FavoriteType;
  targetId: string;
  initialFavorited?: boolean;
  size?: "icon" | "sm" | "default";
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  useEffect(() => {
    isFavorited(type, targetId).then(setFavorited);
  }, [type, targetId]);

  const handleToggle = useCallback(() => {
    startTransition(async () => {
      const result = await toggleFavorite(type, targetId);
      setFavorited(result.favorited);
      router.refresh();
    });
  }, [type, targetId, router]);

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "transition-colors",
        favorited ? "text-pink-500 hover:text-pink-600" : "text-muted-foreground hover:text-pink-500",
        className
      )}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn("size-4", favorited && "fill-current")} />
    </Button>
  );
}
