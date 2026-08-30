"use client";

import { useState, useEffect } from "react";
import { CLIENT_NAV } from "@/constants/navigation";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { VideoFeedbackUpload } from "@/components/video-feedback-upload";

type VideoItem = {
  id: string;
  videoUrl: string;
  exerciseName: string;
  status: "pending" | "reviewed" | "approved";
  coachNotes: string | null;
  formScore: number | null;
  createdAt: string;
};

export default function VideoFeedbackPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await fetch("/api/client/video-feedback");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {
      // Failed to fetch
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (exerciseName: string, file: File) => {
    // Upload to Cloudinary first
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "video");

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error("Upload failed");
    }

    const { url } = await uploadRes.json();

    // Then save to database
    const res = await fetch("/api/client/video-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseName, videoUrl: url }),
    });

    if (res.ok) {
      await fetchVideos();
    }
  };

  return (
    <DashboardLayout
      title="Video Feedback"
      navItems={[...CLIENT_NAV]}
      userName="Client"
      userRole="Client"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <VideoFeedbackUpload videos={videos} onSubmit={handleSubmit} />
      )}
    </DashboardLayout>
  );
}
