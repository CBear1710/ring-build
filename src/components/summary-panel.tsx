"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import { useConfigStore } from "@/store/configurator";

type Props = { className?: string };

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
  const engravingFont = useConfigStore((s: any) => s.engravingFont ?? "Regular");

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
      ringSize: ringSizeNum != null ? String(ringSizeNum) : "",
      shape: String(shape ?? ""),
      carat: String(carat ?? ""),
      engraving: String(engravingText ?? ""),
      engravingFont: String(engravingFont ?? ""),
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
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
      window.innerWidth ??
      document.documentElement.clientWidth ??
      screen.width;
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
    const ok = await copyToClipboard(shareUrl); // copy silently
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 1200);
    openCenteredPopup(fbUrl, "fbshare");
  }
  // -----------------------------------------

  const showEngraving = (engravingText ?? "").trim().length > 0;

  const rows = useMemo(() => {
    // PERSONALIZE group — build items dynamically
    const personalizeItems: Array<{ k: string; v: any }> = [];

    if (showEngraving) {
      personalizeItems.push(
        { k: "engraving", v: engravingText },
        { k: "engravingFont", v: engravingFont }
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
    engravingFont,
    ringSizeNum,
    ringSizeMM,
    showEngraving,
  ]);

  return (
    <aside
      className={[
        "w-full mx-auto rounded-2xl border border-black/10 bg-white shadow-md p-3",
        "sm:sticky sm:top-4 sm:mx-0 sm:p-4",
        "sm:max-w-[320px] md:max-w-[340px] xl:max-w-[280px]",
        "mb-4",
        className,
      ].join(" ")}
    >
      <div className="divide-y divide-black/5">
        {rows.map(({ group, items }) => (
          <section key={group} className="py-2 first:pt-0 last:pb-0">
            <div className="mb-1 text-xs sm:text-sm font-semibold tracking-wide text-black">
              {group}
            </div>
            <dl className="space-y-1 sm:space-y-1.5">
              {items.map(({ k, v }) => (
                <div
                  key={k}
                  className="flex items-start justify-between gap-3"
                >
                  <dt className="text-xs sm:text-sm text-black">
                    {labelMap[k] ?? titleCase(k)}
                  </dt>
                  <dd className="text-xs sm:text-sm font-medium text-black text-right break-words">
                    {v || "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm hover:bg-black/5 active:scale-[0.98] transition"
        >
          {/* Copy icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70">
            <path
              d="M3 8a5 5 0 0 1 5-5h3v2H8a3 3 0 1 0 0 6h3v2H8A5 5 0 0 1 3 8Zm8 5h5a5 5 0 1 1 0 10h-5v-2h5a3 3 0 1 0 0-6h-5v-2Zm6-9a3 3 0 0 1 0 6h-5V8h5a1 1 0 0 0 0-2h-5V4h5Z"
              fill="currentColor"
            />
          </svg>
          {copied ? "Copied!" : "Copy Link"}
        </button>

        <button
          type="button"
          onClick={handleShareFacebook}
          className="inline-flex items-center gap-2 rounded-lg border border-[#1877F2]/20 px-4 py-2 text-sm text-[#1877F2] hover:bg-[#1877F2]/10 active:scale-[0.98] transition"
          title="Share on Facebook"
        >
          {/* FB icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
            <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.7V12h2.7V9.8c0-2.7 1.6-4.2 4-4.2 1.2 0 2.5.2 2.5.2v2.7h-1.4c-1.4 0-1.9.9-1.9 1.8V12h3.2l-.5 2.9h-2.7v7A10 10 0 0 0 22 12z"/>
          </svg>
          Share
        </button>
      </div>
    </aside>
  );
}
