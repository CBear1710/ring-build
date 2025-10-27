
export const FONT_FALLBACKS = {
  regular: "/fonts/engrave-regular.woff2",
  italics: "/fonts/engrave-italic.woff2",
  script:  "/fonts/engrave-regular.woff2",
  roman:   "/fonts/engrave-regular.woff2",
} as const;

export type EngravingFont = keyof typeof FONT_FALLBACKS; 

export function asEngravingFont(v: unknown): EngravingFont {
  const k = String(v ?? "").toLowerCase();
  return (Object.keys(FONT_FALLBACKS) as Array<EngravingFont>).includes(k as EngravingFont)
    ? (k as EngravingFont)
    : "regular";
}


async function urlExists(url: string, ms = 2500): Promise<boolean> {
  if (typeof window === "undefined") return true;

  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), ms);

    const origin = window.location?.origin ?? "";
    const abs = new URL(url, origin).toString();

    const res = await fetch(abs, { method: "HEAD", signal: ctrl.signal });
    clearTimeout(id);
    return res.ok;
  } catch {
    return false;
  }
}


export async function resolveEngravingFontUrlAsync(
  font: EngravingFont | string | undefined,
  overrideUrl?: string
): Promise<string> {
  if (overrideUrl && (await urlExists(overrideUrl))) return overrideUrl;

  const key = asEngravingFont(font);
  const fromEnum = FONT_FALLBACKS[key];

  if (await urlExists(fromEnum)) return fromEnum;

  return "__DEFAULT__";
}
