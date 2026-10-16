import {
  getCloudinaryClient,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";

const SIGNED_URL_TTL_SECONDS = 300;

/**
 * Build the URL a client should follow for an exercise video.
 * Cloudinary-hosted videos are re-signed per request with a short TTL so the
 * raw storage URL is never shipped to clients. External public links
 * (YouTube, Instagram, …) are returned as-is — the API route still gates
 * whether the caller may discover them at all.
 */
export function buildVideoDeliveryUrl(videoUrl: string): string | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const isOwnCloudinary =
    isCloudinaryConfigured() &&
    typeof cloudName === "string" &&
    cloudName.length > 0 &&
    videoUrl.includes(`res.cloudinary.com/${cloudName}/`);

  if (!isOwnCloudinary) {
    try {
      const parsed = new URL(videoUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.toString();
      }
    } catch {
      return null;
    }
    return null;
  }

  try {
    const client = getCloudinaryClient();
    const publicId = extractCloudinaryPublicId(videoUrl);
    const signed = client.url(publicId, {
      resource_type: "video",
      sign_url: true,
      secure: true,
      expires: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
      type: "upload",
    });
    return signed;
  } catch {
    return null;
  }
}

export function extractCloudinaryPublicId(url: string): string {
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((part) => part === "upload");
  if (uploadIndex === -1) return url;
  // Drop "upload" and optional version segment (e.g. v1788905042).
  let rest = parts.slice(uploadIndex + 1);
  if (rest[0] && /^v\d+$/.test(rest[0])) rest = rest.slice(1);
  return rest.join("/").replace(/\.[^.]+$/, "");
}
