import { v2 as cloudinary } from "cloudinary";

let configured = false;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinaryClient() {
  if (!isCloudinaryConfigured()) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

type UploadFolder =
  | "coach-uploads/videos"
  | "coach-uploads/images"
  | "client-progress/photos"
  | "client-progress/videos"
  | "site/hero"
  | "site/products"
  | "site/quiz"
  | "payment-proofs";

type UploadResult = {
  url: string;
  thumbnailUrl: string | null;
  publicId: string;
  format: string;
  bytes: number;
  width: number | undefined;
  height: number | undefined;
  duration: number | undefined;
};

export async function uploadMedia(
  file: Buffer,
  filename: string,
  folder: UploadFolder,
): Promise<UploadResult> {
  const client = getCloudinaryClient();

  const isVideo = filename.match(/\.(mp4|mov|avi|webm)$/i);
  const resourceType = isVideo ? "video" : "image";

  const result = await new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = client.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: `${filename.replace(/\.[^.]+$/, "")}_${Date.now()}`,
        ...(resourceType === "video" && {
          eager: [{ width: 320, height: 240, crop: "pad" }],
          eager_async: true,
        }),
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));

        resolve({
          url: result.secure_url,
          thumbnailUrl:
            result.eager?.[0]?.secure_url ?? null,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          duration: (result as Record<string, unknown>).duration as
            | number
            | undefined,
        });
      },
    );

    uploadStream.end(file);
  });

  return result;
}

export async function deleteMedia(publicIdOrUrl: string): Promise<void> {
  const client = getCloudinaryClient();
  const publicId = extractPublicId(publicIdOrUrl);
  await client.uploader.destroy(publicId);
}

function extractPublicId(urlOrId: string): string {
  if (urlOrId.startsWith("http")) {
    const parts = urlOrId.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
      const withVersion = parts.slice(uploadIndex + 1).join("/");
      return withVersion.replace(/\.[^.]+$/, "");
    }
  }
  return urlOrId.replace(/\.[^.]+$/, "");
}
