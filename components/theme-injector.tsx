import { getPublishedTheme } from "@/lib/content";
import { getThemeAsCSSVariables } from "@/server/services/site-theme.service";

export async function ThemeInjector() {
  const theme = await getPublishedTheme().catch(() => null);
  const cssVars = await getThemeAsCSSVariables(theme);

  if (Object.keys(cssVars).length === 0) return null;

  const styleEntries = Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");

  return (
    <style
      id="admin-theme-overrides"
      dangerouslySetInnerHTML={{
        __html: `:root { ${styleEntries} }`,
      }}
    />
  );
}
