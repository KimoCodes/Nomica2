import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ThemeMode, type SiteTheme } from "@prisma/client";

export const siteThemeSchema = z.object({
  name: z.string().min(1).max(100),
  mode: z.nativeEnum(ThemeMode).default("SYSTEM"),
  primaryColor: z.string().max(50).optional(),
  primaryForeground: z.string().max(50).optional(),
  secondaryColor: z.string().max(50).optional(),
  accentColor: z.string().max(50).optional(),
  destructiveColor: z.string().max(50).optional(),
  successColor: z.string().max(50).optional(),
  warningColor: z.string().max(50).optional(),
  backgroundColor: z.string().max(50).optional(),
  foregroundColor: z.string().max(50).optional(),
  cardColor: z.string().max(50).optional(),
  mutedColor: z.string().max(50).optional(),
  mutedFgColor: z.string().max(50).optional(),
  borderColor: z.string().max(50).optional(),
  headingFont: z.string().max(100).optional(),
  bodyFont: z.string().max(100).optional(),
  baseFontSize: z.string().max(20).optional(),
  borderRadius: z.string().max(20).optional(),
  customTokens: z.any().optional(),
});

export type SiteThemeInput = z.infer<typeof siteThemeSchema>;

export async function getThemes() {
  return prisma.siteTheme.findMany({
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedTheme() {
  return prisma.siteTheme.findFirst({
    where: { isPublished: true },
  });
}

export async function getThemeById(id: string) {
  return prisma.siteTheme.findUnique({
    where: { id },
    include: { createdBy: { select: { id: true, name: true } } },
  });
}

export async function createTheme(
  data: SiteThemeInput & { createdById: string },
) {
  return prisma.siteTheme.create({ data });
}

export async function updateTheme(id: string, data: Partial<SiteThemeInput>) {
  return prisma.siteTheme.update({ where: { id }, data });
}

export async function publishTheme(id: string) {
  return prisma.$transaction(async (tx) => {
    await tx.siteTheme.updateMany({
      where: { isPublished: true },
      data: { isPublished: false },
    });
    return tx.siteTheme.update({
      where: { id },
      data: { isPublished: true },
    });
  });
}

export async function deleteTheme(id: string) {
  const theme = await prisma.siteTheme.findUnique({ where: { id } });
  if (theme?.isPublished) {
    throw new Error("Cannot delete the currently published theme");
  }
  return prisma.siteTheme.delete({ where: { id } });
}

export function getThemeAsCSSVariables(theme: SiteTheme | null) {
  if (!theme) return {};

  const vars: Record<string, string> = {};

  if (theme.primaryColor) vars["--primary"] = theme.primaryColor;
  if (theme.primaryForeground) vars["--primary-foreground"] = theme.primaryForeground;
  if (theme.secondaryColor) vars["--secondary"] = theme.secondaryColor;
  if (theme.accentColor) vars["--accent"] = theme.accentColor;
  if (theme.destructiveColor) vars["--destructive"] = theme.destructiveColor;
  if (theme.successColor) vars["--success"] = theme.successColor;
  if (theme.warningColor) vars["--warning"] = theme.warningColor;
  if (theme.backgroundColor) vars["--background"] = theme.backgroundColor;
  if (theme.foregroundColor) vars["--foreground"] = theme.foregroundColor;
  if (theme.cardColor) vars["--card"] = theme.cardColor;
  if (theme.mutedColor) vars["--muted"] = theme.mutedColor;
  if (theme.mutedFgColor) vars["--muted-foreground"] = theme.mutedFgColor;
  if (theme.borderColor) vars["--border"] = theme.borderColor;

  if (theme.borderRadius) vars["--radius"] = theme.borderRadius;

  return vars;
}

export async function getDefaultTheme(): Promise<SiteThemeInput> {
  return {
    name: "Default",
    mode: "SYSTEM",
    primaryColor: "oklch(0.54 0.18 155)",
    primaryForeground: "oklch(0.99 0 0)",
    secondaryColor: "oklch(0.96 0.01 100)",
    accentColor: "oklch(0.95 0.02 155)",
    destructiveColor: "oklch(0.58 0.22 25)",
    successColor: "oklch(0.62 0.19 155)",
    warningColor: "oklch(0.75 0.15 75)",
    backgroundColor: "oklch(0.99 0.002 100)",
    foregroundColor: "oklch(0.14 0.02 260)",
    cardColor: "oklch(0.99 0.002 100)",
    mutedColor: "oklch(0.96 0.005 100)",
    mutedFgColor: "oklch(0.50 0.02 260)",
    borderColor: "oklch(0.92 0.005 100)",
    headingFont: "var(--font-heading)",
    bodyFont: "var(--font-sans)",
    baseFontSize: "16px",
    borderRadius: "0.625rem",
  };
}

export async function getThemeVersions(themeId: string) {
  return prisma.contentVersion.findMany({
    where: { entityType: "site_theme", entityId: themeId },
    include: { createdBy: { select: { id: true, name: true } } },
    orderBy: { version: "desc" },
  });
}
