import { Star } from "lucide-react";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  rating: number;
};

export function TestimonialCard({
  quote,
  name,
  role,
  rating,
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
      <div className="mt-4">
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </div>
  );
}
