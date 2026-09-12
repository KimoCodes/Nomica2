import Image from "next/image";
import { Star, Quote } from "lucide-react";

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
    <div className="flex flex-col rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-premium">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="size-4 fill-warning text-warning" />
          ))}
        </div>
        <Quote className="size-5 text-muted-foreground/30" />
      </div>
      <blockquote className="flex-1 text-muted-foreground leading-relaxed">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="mt-4 flex items-center gap-3 border-t border-border/50 pt-4">
        {avatar ? (
          <Image
            src={avatar}
            alt={name}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
            unoptimized
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
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
    </div>
  );
}
