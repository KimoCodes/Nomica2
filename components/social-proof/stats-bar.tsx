import { STATS } from "@/constants/transformations";

export function StatsBar() {
  return (
    <section className="border-y border-border/50 bg-muted/30 px-4 py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`animate-slide-up stagger-${index + 1} text-center`}
          >
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
