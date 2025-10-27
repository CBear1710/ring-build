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
import { RotateCcw } from "lucide-react";
import Image from "next/image";

import { FONT_FALLBACKS } from "@/lib/engraving-fonts";
import {
  ENGRAVING_FONT_PREVIEWS,
  MAX_ENGRAVING_CHARS,
  RING_SIZES,
} from "@/lib/ring-configurator/constants";
import { useConfigStore } from "@/store/configurator";

interface Step3PersonalizeProps {
  onReset: () => void;
}

export function Step3Personalize({ onReset }: Step3PersonalizeProps) {
  const ringSize = useConfigStore((s) => s.ringSize);
  const engravingText = useConfigStore((s) => s.engravingText);
  const engravingFont = useConfigStore((s) => s.engravingFont);

  const setRingSize = useConfigStore((s) => s.setRingSize);
  const setEngravingText = useConfigStore((s) => s.setEngravingText);
  const setEngravingFont = useConfigStore((s) => s.setEngravingFont);
  const setEngravingFontUrl = useConfigStore((s) => s.setEngravingFontUrl);

  const sizeOpt = RING_SIZES.find((o) => o.value === ringSize);
  const mm = sizeOpt?.mm;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#666]">Personalize</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-none text-sm text-black gap-2 bg-transparent border-[#ddd] hover:bg-transparent hover:opacity-90"
        >
          Reset <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Ring Size */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-base text-[#333]">
            Ring Size:{" "}
            <span className="font-bold">
              {ringSize}
              {mm != null ? ` (${mm.toFixed(1)}mm)` : ""}
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

      {/* Engraving text */}
      <div className="mt-5">
        <div className="flex items-center">
          <label className="min-w-[133px] text-[#333]">Engraving:</label>

          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Type your text"
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

      {/* Engraving fonts (image buttons) */}
      <div className="mt-5">
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
                  "h-[60px] sm:h-[68px] rounded-[8px] border-2",
                  "flex items-center justify-center",
                  "transition-all focus:outline-none",
                  active
                    ? "border-[#0313B0] bg-white"
                    : "border-[#ddd] bg-[#F9F9F9] hover:bg-[#f2f2f2]",
                ].join(" ")}
              >
                <Image
                  src={f.src}
                  alt={f.label}
                  width={f.w}
                  height={f.h}
                  className="object-contain"
                  priority={false}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
