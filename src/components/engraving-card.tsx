"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfigStore } from "@/store/configurator";
import { FONT_FALLBACKS } from "@/lib/engraving-fonts";

type FontKey = keyof typeof FONT_FALLBACKS;

const MAX = 15;

const FONTS: Array<{ key: FontKey; label: string; src: string; w: number; h: number }> = [
  { key: "regular", label: "Regular", src: "/fonts/regular.png", w: 60, h: 20 },
  { key: "script",  label: "Script",  src: "/fonts/script.png",  w: 60, h: 20 },
  { key: "italics", label: "Italics", src: "/fonts/italics.png", w: 60, h: 20 },
  { key: "roman",   label: "Roman",   src: "/fonts/roman.png",   w: 60, h: 20 },
];

export default function EngravingCard() {
  const text = useConfigStore((s) => s.engravingText ?? "");
  const font = useConfigStore((s) => s.engravingFont as FontKey); 
  const setText = useConfigStore((s) => s.setEngravingText);
  const setFont = useConfigStore((s) => s.setEngravingFont as (f: FontKey) => void);
  const setFontUrl = useConfigStore((s) => s.setEngravingFontUrl);

  return (
    <Card className="rounded-2xl shadow-sm mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-[15px] tracking-wide">ADD ENGRAVING</CardTitle>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder="Type here"
            className="h-10"
            maxLength={MAX}
          />
          <div className="text-right text-xs text-muted-foreground">
            {text.length}/{MAX}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Select a font</div>
          <div
            role="tablist"
            aria-label="Engraving font"
            className="inline-flex rounded-full border border-gray-300 bg-white overflow-hidden"
          >
            {FONTS.map((f, idx) => {
              const active = font === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setFont(f.key);                           
                    setFontUrl(FONT_FALLBACKS[f.key]);        
                  }}
                  className={[
                    "flex items-center justify-center h-6 px-4 transition-colors",
                    "first:rounded-l-full last:rounded-r-full",
                    idx > 0 ? "border-l border-black" : "",
                    active
                      ? "bg-white border border-black"
                      : "border border-transparent hover:bg-gray-50",
                  ].join(" ")}
                >
                  <Image
                    src={f.src}
                    alt={f.label}
                    width={f.w}
                    height={f.h}
                    className="object-contain"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
