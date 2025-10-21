"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { RotateCcw } from "lucide-react";

import { useConfigStore } from "@/store/configurator";
import type { EngravingFont } from "@/lib/engraving-fonts";
import {
  RING_SIZES,
  ENGRAVING_FONT_PREVIEWS,
  MAX_ENGRAVING_CHARS,
} from "@/lib/ring-configurator/constants";
import { FONT_FALLBACKS } from "@/lib/engraving-fonts";

function getSizeMM(size: number) {
  return (11.63 + (size - 1) * 0.4 * 2.54).toFixed(1);
}

export function Step3Personalize() {
  const ringSize = useConfigStore((s) => s.ringSize);
  const engravingText = useConfigStore((s) => s.engravingText);
  const engravingFont = useConfigStore((s) => s.engravingFont);

  const setRingSize = useConfigStore((s) => s.setRingSize);
  const setEngravingText = useConfigStore((s) => s.setEngravingText);
  const setEngravingFont = useConfigStore((s) => s.setEngravingFont);
  const setEngravingFontUrl = useConfigStore((s) => s.setEngravingFontUrl);

  const handleReset = () => {
    setRingSize(2);
    setEngravingText("");
    setEngravingFont("regular" as EngravingFont);
    setEngravingFontUrl(undefined);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#666]">Personalize</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="rounded-none text-sm text-black gap-2 bg-transparent border-[#ddd] hover:bg-transparent hover:opacity-90"
        >
          Reset <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-base text-[#333]">
            Ring Size:{" "}
            <span className="font-bold">
              {ringSize} ({getSizeMM(ringSize)}mm)
            </span>
          </label>
          <a
            href="/size-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0313B0] underline hover:text-[#0313B0] hover:opacity-90"
          >
            Size guide
          </a>
        </div>

        <Select
          value={String(ringSize)}
          onValueChange={(v) => setRingSize(parseFloat(v))}
        >
          <SelectTrigger className="mt-[10px] min-h-[53px] w-full border border-[#ddd] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RING_SIZES.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5">
        <div className="flex items-center">
          <label className="min-w-[133px] text-[#333]">Engraving:</label>

          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Love"
              value={engravingText}
              onChange={(e) =>
                setEngravingText(e.target.value.slice(0, MAX_ENGRAVING_CHARS))
              }
              maxLength={MAX_ENGRAVING_CHARS}
              className="h-[53px] w-full border border-[#ddd] bg-white pr-3 text-[#666]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999]">
              {engravingText.length}/{MAX_ENGRAVING_CHARS}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-sm text-[#333] mb-2">Engraving:</div>

        <div className="grid grid-cols-2 gap-3">
          {ENGRAVING_FONT_PREVIEWS.map((f) => {
            const active = engravingFont === f.value;
            return (
              <button
                key={f.value}
                onClick={() => {
                  setEngravingFont(f.value);
                  setEngravingFontUrl(FONT_FALLBACKS[f.value] || undefined);
                }}
                aria-pressed={active}
                className={[
                  "h-[60px] sm:h-[68px] rounded-[8px] border-2 px-3",
                  "flex items-center justify-center",
                  "transition-all focus:outline-none focus:ring-2 focus:ring-[#0313B0]/40",
                  active
                    ? "border-[#0313B0] bg-white"
                    : "border-[#ddd] bg-[#F9F9F9] hover:bg-[#f2f2f2]",
                ].join(" ")}
              >
                <div className="relative w-full max-w-[130px] h-[30px] sm:h-[34px]">
                  <Image
                    src={f.src}
                    alt={f.label}
                    fill
                    sizes="130px"
                    className="object-contain"
                    priority={false}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
