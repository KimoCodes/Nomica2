import { NextResponse } from "next/server";
import { getPublishedTheme } from "@/lib/content";
import { getThemeAsCSSVariables } from "@/server/services/site-theme.service";

export async function GET() {
  try {
    const theme = await getPublishedTheme();
    const cssVars = await getThemeAsCSSVariables(theme);
    return NextResponse.json({ theme, cssVars });
  } catch {
    return NextResponse.json({ theme: null, cssVars: {} }, { status: 500 });
  }
}
