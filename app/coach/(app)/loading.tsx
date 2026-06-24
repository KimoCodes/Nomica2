export default function CoachLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-[260px] flex-col border-r border-border/50 bg-card/50 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-border/50 px-5">
          <div className="size-8 animate-scale-in rounded-lg bg-muted skeleton-shimmer" />
          <div className="h-5 w-16 animate-scale-in stagger-1 rounded bg-muted skeleton-shimmer" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`h-10 animate-slide-up stagger-${i + 1} rounded-xl bg-muted skeleton-shimmer`} />
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/50 px-4 backdrop-blur-sm md:px-6">
          <div className="h-5 w-24 animate-fade-in rounded bg-muted skeleton-shimmer" />
          <div className="flex items-center gap-3">
            <div className="hidden h-5 w-32 animate-fade-in stagger-1 rounded bg-muted skeleton-shimmer md:block" />
            <div className="size-9 animate-scale-in stagger-2 rounded-full bg-muted skeleton-shimmer" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="h-8 w-48 animate-slide-up rounded bg-muted skeleton-shimmer" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`h-28 animate-slide-up stagger-${i + 1} rounded-2xl border border-border/50 bg-card skeleton-shimmer`} />
              ))}
            </div>
            <div className="h-64 animate-slide-up stagger-5 rounded-2xl border border-border/50 bg-card skeleton-shimmer" />
          </div>
        </main>
      </div>
    </div>
  );
}
