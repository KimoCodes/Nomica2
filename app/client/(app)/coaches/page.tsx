"use client";

import { useState, useEffect } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { CoachMarketplace } from "@/components/coach-marketplace";
import { BookingModal } from "@/components/booking-modal";

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

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const res = await fetch("/api/client/coaches");
      const data = await res.json();
      setCoaches(data.coaches || []);
    } catch {
      // Failed to fetch
    } finally {
      setLoading(false);
    }
  };

  const handleBookCoach = (coachId: string) => {
    const coach = coaches.find((c) => c.id === coachId);
    if (coach) setSelectedCoach(coach);
  };

  const handleBook = async (data: { scheduledAt: string; durationMinutes: number; notes: string }) => {
    if (!selectedCoach) return;

    const res = await fetch("/api/client/coaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coachId: selectedCoach.id,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        notes: data.notes,
      }),
    });

    if (res.ok) {
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    }
  };

  const handleViewProfile = (coachId: string) => {
    console.log("View profile:", coachId);
  };

  return (
    <DashboardLayout
      title="Find a Coach"
      navItems={[...CLIENT_NAV]}
      userName="Client"
      userRole="Client"
    >
      {bookingSuccess && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Session booked successfully! The coach will confirm shortly.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <CoachMarketplace
          coaches={coaches}
          onBookCoach={handleBookCoach}
          onViewProfile={handleViewProfile}
        />
      )}

      {selectedCoach && (
        <BookingModal
          coach={selectedCoach}
          open={!!selectedCoach}
          onClose={() => setSelectedCoach(null)}
          onBook={handleBook}
        />
      )}
    </DashboardLayout>
  );
}
