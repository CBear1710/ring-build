"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react";
import { useConfigStore } from "@/store/configurator";
import { ShareActions } from "./ring-configurator/share-actions";
import { RING_SIZES } from "@/lib/ring-configurator/constants";

type Props = { className?: string };

const FONT_KEYS = ["regular", "script", "italics", "roman"] as const;
type EngravingFontKey = (typeof FONT_KEYS)[number];

function asFontKey(x: unknown): EngravingFontKey {
  const s = String(x ?? "").toLowerCase();
  return (FONT_KEYS as readonly string[]).includes(s)
    ? (s as EngravingFontKey)
    : "regular";
}

function prettyFontLabel(k: EngravingFontKey) {
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
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const purity = useConfigStore((s) => s.purity as string | number | null);
  const ringSizeRaw = useConfigStore((s) => s.ringSize);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  const engravingText = useConfigStore((s: any) => s.engravingText ?? "");
  const engravingFontRaw = useConfigStore(
    (s: any) => s.engravingFont ?? "regular"
  );
  const engravingFontKey = asFontKey(engravingFontRaw);
  const engravingFontLabel = prettyFontLabel(engravingFontKey);

  const ringSizeNum =
    typeof ringSizeRaw === "number"
      ? ringSizeRaw
      : ringSizeRaw != null
      ? Number(ringSizeRaw)
      : undefined;

  const sizeOpt = RING_SIZES.find((o) => o.value === ringSizeNum);
  const ringSizeMM = sizeOpt?.mm;

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
              {ringSizeNum}
              {ringSizeMM != null ? ` (${ringSizeMM.toFixed(1)} mm)` : ""}
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
      {/* ▼ change: visually thinner divider under SUMMARY */}
      <div className="h-px bg-black/25 mb-2" />

      <div>
        {rows.map(({ group, items }) => (
          <section key={group} className="py-3 first:pt-0 last:pb-0">
            <div className="mb-2">
              <div className="text-xs sm:text-sm font-semibold tracking-wide text-black uppercase">
                {group}
              </div>
            </div>

            <dl className="space-y-1 sm:space-y-1.5">
              {items.map(({ k, v }) => {
                // ▼ change: add a hairline divider under the "metal" and "carat" rows
                const underline = k === "metal" || k === "carat";
                return (
                  <div
                    key={k}
                    className={[
                      "flex items-start justify-between gap-2",
                      underline ? "pb-1.5 border-b border-black/20" : "",
                    ].join(" ")}
                  >
                    <dt className="text-xs sm:text-sm text-black shrink-0">
                      {labelMap[k] ?? titleCase(k)}
                    </dt>
                    <dd
                      className={[
                        "text-xs sm:text-sm font-medium text-black text-right",
                        "whitespace-normal break-words",
                        "overflow-hidden",
                      ].join(" ")}
                      title={
                        typeof v === "string" ? (v.length > 0 ? v : undefined) : undefined
                      }
                    >
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
