import { NextResponse } from "next/server";
import { getBrandAssetByType } from "@/server/services/brand-asset.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  try {
    const asset = await getBrandAssetByType(type);
    if (!asset) {
      return NextResponse.json({ url: null }, { status: 404 });
    }
    return NextResponse.json({ url: asset.url });
  } catch {
    return NextResponse.json({ url: null }, { status: 500 });
  }
}
