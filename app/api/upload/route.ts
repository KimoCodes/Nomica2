import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import logger from "@/lib/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string || "video";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: type === "video" ? "video" : "image",
          folder: `nomitips/${type}/${session.user.id}`,
          chunk_size: 6000000,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string });
        },
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error({ err: error }, "POST /api/upload error");
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
