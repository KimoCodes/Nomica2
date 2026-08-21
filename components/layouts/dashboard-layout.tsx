"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { handleLogout } from "@/actions/logout.action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { trackLoading } from "@/components/ui/loading-bar";
import { NotificationBell } from "@/components/notification-bell";
import {
  Menu,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Users,
  FolderOpen,
  Dumbbell,
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Settings,
  Footprints,
  CreditCard,
  Film,
  ListChecks,
  Target,
  Heart,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

type DashboardLayoutProps = {
  title: string;
  navItems: NavItem[];
  children: ReactNode;
  userName?: string;
  userRole?: string;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  clients: Users,
  programs: FolderOpen,
  exercises: Dumbbell,
  messages: MessageSquare,
  "check-ins": CalendarCheck,
  workouts: Footprints,
  progress: TrendingUp,
  settings: Settings,
  subscription: CreditCard,
  media: Film,
  habits: ListChecks,
  goals: Target,
  favorites: Heart,
  nutrition: Footprints,
  timers: Footprints,
};

export function DashboardLayout({
  title,
  navItems,
  children,
  userName,
  userRole,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function isActive(href: string) {
    if (href === "/coach" || href === "/client" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only z-[100] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:rounded-lg"
      >
        Skip to content
      </a>

      <aside className="hidden w-[260px] flex-col border-r border-border/50 bg-card/50 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
            <Dumbbell className="size-4 text-primary" />
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            NOMICA
          </Link>
        </div>

        <nav aria-label="Dashboard navigation" className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = iconMap[item.icon ?? item.href.split("/").pop() ?? ""] ?? LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-[18px] transition-colors",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {item.label}
                {active && (
                  <ChevronRight className="ml-auto size-3.5 text-primary/60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 p-3">
          <form action={async () => { setIsLoggingOut(true); await handleLogout(); }}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Spinner size="xs" /> : <LogOut className="size-[18px]" />}
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="size-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                }
              />
              <DialogContent className="w-72 p-0">
                <DialogHeader className="border-b border-border/50 px-4 py-3">
                  <DialogTitle className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                      <Dumbbell className="size-3.5 text-primary" />
                    </div>
                    NOMICA
                  </DialogTitle>
                </DialogHeader>
                <nav className="flex flex-col gap-1 p-3">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = iconMap[item.icon ?? item.href.split("/").pop() ?? ""] ?? LayoutDashboard;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                        )}
                      >
                        <Icon className="size-[18px]" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t border-border/50 p-3">
          <form action={async () => { setIsLoggingOut(true); await trackLoading(() => handleLogout()); }}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="w-full justify-start gap-3 text-muted-foreground"
                      disabled={isLoggingOut}
                    >
                      {isLoggingOut ? <Spinner size="xs" /> : <LogOut className="size-[18px]" />}
                      {isLoggingOut ? "Signing out..." : "Sign out"}
                    </Button>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <h1 className="text-base font-semibold tracking-tight">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            {userName && (
              <div className="hidden items-center gap-2.5 md:flex">
                <div className="text-right">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  {userRole && (
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">{userRole}</p>
                  )}
                </div>
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <form action={async () => { setIsLoggingOut(true); await handleLogout(); }} className="md:hidden">
              <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground" disabled={isLoggingOut}>
                {isLoggingOut ? <Spinner size="xs" /> : <LogOut className="size-4" />}
              </Button>
            </form>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
