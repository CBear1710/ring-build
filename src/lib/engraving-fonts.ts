import type { EngravingFont } from "@/store/configurator";

const LOCAL_REGULAR = "/fonts/engrave-regular.woff2";
const LOCAL_ITALIC  = "/fonts/engrave-italic.woff2";

export const FONT_FALLBACKS: Record<EngravingFont, string> = {
  regular: LOCAL_REGULAR,
  italics: LOCAL_ITALIC,
  script:  LOCAL_REGULAR,
  roman:   LOCAL_REGULAR,
};

async function urlExists(url: string, ms = 2500): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);
    const abs = new URL(url, window.location.origin).toString();
    const res = await fetch(abs, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}


export async function resolveEngravingFontUrlAsync(
  fontEnum: EngravingFont | undefined,
  overrideUrl?: string
): Promise<string> {
  if (overrideUrl && (await urlExists(overrideUrl))) return overrideUrl;

  const fromEnum = FONT_FALLBACKS[fontEnum ?? "regular"] ?? LOCAL_REGULAR;
  if (await urlExists(fromEnum)) return fromEnum;

  return "__DEFAULT__";
}
