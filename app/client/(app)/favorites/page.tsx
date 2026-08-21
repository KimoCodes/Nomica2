import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getFavorites } from "@/actions/favorites.actions";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { CLIENT_NAV } from "@/constants/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Dumbbell, FolderOpen, BookOpen, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Favorites | NOMICA",
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; href: (id: string) => string }> = {
  EXERCISE: { label: "Exercises", icon: Dumbbell, href: (id) => `/client/exercise-library` },
  PROGRAM: { label: "Programs", icon: FolderOpen, href: (id) => `/programs` },
  RECIPE: { label: "Recipes", icon: UtensilsCrossed, href: (id) => `/client/nutrition` },
  ARTICLE: { label: "Articles", icon: BookOpen, href: (id) => `/client/progress` },
};

export default async function FavoritesPage() {
  const session = await requireAuth();
  const favorites = await getFavorites();

  const grouped = favorites.reduce((acc, fav) => {
    if (!acc[fav.type]) acc[fav.type] = [];
    acc[fav.type].push(fav);
    return acc;
  }, {} as Record<string, typeof favorites>);

  return (
    <DashboardLayout
      title="Favorites"
      navItems={[...CLIENT_NAV]}
      userName={session.user.name}
      userRole={session.user.role}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Favorites</h2>
          <p className="text-sm text-muted-foreground">Your saved exercises, programs, and more</p>
        </div>

        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
                <Heart className="size-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No favorites yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the heart icon on exercises, programs, or recipes to save them here
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([type, items]) => {
            const config = TYPE_CONFIG[type];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground">{config.label}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{items.length}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((fav) => (
                    <Link key={fav.id} href={config.href(fav.targetId)}>
                      <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                        <CardContent className="flex items-center gap-3 py-4">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="size-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{fav.targetId}</p>
                            <p className="text-xs text-muted-foreground">Saved {new Date(fav.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Heart className="size-4 fill-pink-500 text-pink-500" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
