import { NextResponse } from "next/server";
import { getPublishedPageContent } from "@/lib/content";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ page: string }> },
) {
  const { page } = await params;
  try {
    const content = await getPublishedPageContent(page);
    return NextResponse.json({ sections: content });
  } catch {
    return NextResponse.json({ sections: [] }, { status: 500 });
  }
}
