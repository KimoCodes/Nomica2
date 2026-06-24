import { getCloudinaryClient } from "@/lib/cloudinary";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function uploadChatImage(file: File) {
  const cloudinary = getCloudinaryClient();

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("INVALID_FILE_TYPE");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("FILE_TOO_LARGE");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "nomica/messages",
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    cloudinaryId: result.public_id,
  };
}
