"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Users, Award, Calendar } from "lucide-react";

type Coach = {
  id: string;
  name: string;
  avatar: string | null;
  specialties: string[];
  certification: string | null;
  yearsExperience: number | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  clientCount: number;
};

type CoachMarketplaceProps = {
  coaches: Coach[];
  onBookCoach?: (coachId: string) => void;
  onViewProfile?: (coachId: string) => void;
};

export function CoachMarketplace({ coaches, onBookCoach, onViewProfile }: CoachMarketplaceProps) {
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const allSpecialties = Array.from(
    new Set(coaches.flatMap((c) => c.specialties))
  );

  const filtered = coaches.filter((coach) => {
    const matchesSearch =
      !search ||
      coach.name.toLowerCase().includes(search.toLowerCase()) ||
      coach.specialties.some((s) =>
        s.toLowerCase().includes(search.toLowerCase())
      );

    const matchesSpecialty =
      !selectedSpecialty || coach.specialties.includes(selectedSpecialty);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search coaches..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSpecialty === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(null)}
              >
                All
              </Button>
              {allSpecialties.map((s) => (
                <Button
                  key={s}
                  variant={selectedSpecialty === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No coaches found</p>
          </div>
        ) : (
          filtered.map((coach) => (
            <Card
              key={coach.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => onViewProfile?.(coach.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {coach.avatar ? (
                      <img
                        src={coach.avatar}
                        alt={coach.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold">{coach.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{coach.name}</h3>
                    {coach.yearsExperience && (
                      <p className="text-xs text-muted-foreground">
                        {coach.yearsExperience} years experience
                      </p>
                    )}
                  </div>
                </div>

                {coach.bio && (
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                    {coach.bio}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1">
                  {coach.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {coach.clientCount} clients
                    </span>
                    {coach.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {coach.rating}
                      </span>
                    )}
                  </div>
                  {onBookCoach && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookCoach(coach.id);
                      }}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Book
                    </Button>
                  )}
                </div>

                {coach.certification && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <Award className="h-3 w-3" />
                    {coach.certification}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
