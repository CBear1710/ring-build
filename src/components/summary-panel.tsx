"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useConfigStore } from "@/store/configurator";
import { useMemo, useState } from "react";
import { ShareActions } from "./ring-configurator/share-actions";

type Props = { className?: string };

// canonical engraving font keys we support
const FONT_KEYS = ["regular", "script", "italics", "roman"] as const;
type EngravingFontKey = (typeof FONT_KEYS)[number];

function asFontKey(x: unknown): EngravingFontKey {
  const s = String(x ?? "").toLowerCase();
  return (FONT_KEYS as readonly string[]).includes(s)
    ? (s as EngravingFontKey)
    : "regular";
}

function prettyFontLabel(k: EngravingFontKey) {
  // Only "italics" needs special-casing for capitalization
  return k === "italics" ? "Italics" : k.charAt(0).toUpperCase() + k.slice(1);
}

const labelMap: Record<string, string> = {
  style: "Style",
  metal: "Metal",
  ringSize: "Ring Size",
  shape: "Shape",
  carat: "Carat",
  engraving: "Engraving",
  engravingFont: "Engraving Font",
};

const metalName: Record<string, string> = {
  white: "White Gold",
  yellow: "Yellow Gold",
  rose: "Rose Gold",
  platinum: "Platinum",
};

function titleCase(s: string) {
  return s.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function ringSizeToCircumferenceMM(usSize: number): number {
  const diameter = 11.654 + 0.8128 * usSize;
  return Math.PI * diameter;
}

function metalLabel(
  metal: string | undefined,
  purity: string | number | null | undefined
) {
  const name = metalName[metal ?? ""] ?? titleCase(metal ?? "");
  if (!metal) return "—";
  if (metal === "platinum") return name;
  return purity ? `${purity} ${name}` : name;
}

export default function SummaryPanel({ className = "" }: Props) {
  // Base config
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const purity = useConfigStore((s) => s.purity as string | number | null);
  const ringSizeRaw = useConfigStore((s) => s.ringSize);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  // Engraving
  const engravingText = useConfigStore((s: any) => s.engravingText ?? "");
  const engravingFontRaw = useConfigStore(
    (s: any) => s.engravingFont ?? "regular"
  );
  const engravingFontKey = asFontKey(engravingFontRaw); // for URL / logic
  const engravingFontLabel = prettyFontLabel(engravingFontKey); // for UI

  // Parse ring size
  const ringSizeNum =
    typeof ringSizeRaw === "number"
      ? ringSizeRaw
      : ringSizeRaw != null
      ? Number(ringSizeRaw)
      : undefined;

  const ringSizeMM =
    ringSizeNum != null ? ringSizeToCircumferenceMM(ringSizeNum) : undefined;

  const [copied, setCopied] = useState(false);

  // ---------- Share / Copy helpers ----------
  function buildShareUrl() {
    const params = new URLSearchParams({
      style: String(style ?? ""),
      metal: String(metal ?? ""),
      purity: purity != null ? String(purity) : "",
      size: ringSizeNum != null ? String(ringSizeNum) : "", // canonical
      shape: String(shape ?? ""),
      carat: String(carat ?? ""),
      engraving: String(engravingText ?? ""),
      font: engravingFontKey, // canonical, normalized
    });
    const shareUrl = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    return { shareUrl, fbUrl };
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
      } catch {
        return false;
      }
    }
  }

  function openCenteredPopup(url: string, name: string, w = 600, h = 480) {
    const dualScreenLeft = window.screenLeft ?? window.screenX ?? 0;
    const dualScreenTop = window.screenTop ?? window.screenY ?? 0;
    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;
    const left = dualScreenLeft + (width - w) / 2;
    const top = dualScreenTop + (height - h) / 2;
    const features =
      `width=${w},height=${h},left=${left},top=${top},` +
      `menubar=0,toolbar=0,status=0,location=0,scrollbars=1,resizable=1`;
    const win = window.open(url, name, features);
    win?.focus?.();
    return win;
  }

  async function copyLink() {
    const { shareUrl } = buildShareUrl();
    const ok = await copyToClipboard(shareUrl);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
  }

  async function handleShareFacebook(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    const { shareUrl, fbUrl } = buildShareUrl();
    const ok = await copyToClipboard(shareUrl);
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
    openCenteredPopup(fbUrl, "fbshare");
  }
  // -----------------------------------------

  const showEngraving = (engravingText ?? "").trim().length > 0;

  const rows = useMemo(() => {
    const personalizeItems: Array<{ k: string; v: any }> = [];

    if (showEngraving) {
      personalizeItems.push(
        { k: "engraving", v: engravingText },
        { k: "engravingFont", v: engravingFontLabel }
      );
    }

    personalizeItems.push({
      k: "ringSize",
      v:
        ringSizeNum != null ? (
          <div className="flex flex-col items-end text-right">
            <span>
              {ringSizeNum} ({(ringSizeMM ?? 0).toFixed(1)} mm)
            </span>
            <span className="text-xs text-black/50">(US, MX, CA)</span>
          </div>
        ) : (
          "—"
        ),
    });

    return [
      {
        group: "SETTING",
        items: [
          { k: "style", v: titleCase(String(style ?? "")) },
          { k: "metal", v: metalLabel(metal, purity) },
        ],
      },
      {
        group: "STONE",
        items: [
          { k: "shape", v: titleCase(String(shape ?? "")) },
          { k: "carat", v: `${Number(carat ?? 0).toFixed(2)}` },
        ],
      },
      {
        group: "PERSONALIZE",
        items: personalizeItems,
      },
    ];
  }, [
    style,
    metal,
    purity,
    shape,
    carat,
    engravingText,
    engravingFontLabel,
    ringSizeNum,
    ringSizeMM,
    showEngraving,
  ]);

  return (
    <aside className={["w-full mx-auto", className].join(" ")}>
      <div className="divide-y divide-black/5">
        {rows.map(({ group, items }) => (
          <section key={group} className="py-2 first:pt-0 last:pb-0">
            <div className="mb-1 text-xs sm:text-sm font-semibold tracking-wide text-black">
              {group}
            </div>
            <dl className="space-y-1 sm:space-y-1.5">
              {items.map(({ k, v }) => {
                if (k === "engraving") {
                  return (
                    <div key={k} className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-xs sm:text-sm text-black">
                          {labelMap[k] ?? titleCase(k)}
                        </dt>
                        <div className="text-xs sm:text-sm font-medium opacity-0">
                          —
                        </div>
                      </div>
                      <dd
                        className={[
                          "mt-0.5 text-xs sm:text-sm font-medium text-black",
                          "text-right whitespace-normal break-all",
                        ].join(" ")}
                        title={typeof v === "string" ? v : undefined}
                      >
                        {String(v)}
                      </dd>
                    </div>
                  );
                }

                return (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-3"
                  >
                    <dt className="text-xs sm:text-sm text-black">
                      {labelMap[k] ?? titleCase(k)}
                    </dt>
                    <dd className="text-xs sm:text-sm font-medium text-black text-right overflow-hidden whitespace-nowrap text-ellipsis">
                      {v || "—"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <ShareActions />
      </div>
    </aside>
  );
}
