import { Star } from "lucide-react";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  rating: number;
  avatar?: string;
};

export function TestimonialCard({
  quote,
  name,
  role,
  rating,
  avatar,
}: TestimonialCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-border/50 bg-card p-6">
      <div className="mb-4 flex gap-1">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="size-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="flex-1 text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="size-10 rounded-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        )}
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}
