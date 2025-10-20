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
import type { EngravingFont } from "@/lib/ring-configurator/types";
import { RotateCcw } from "lucide-react";

interface Step3PersonalizeProps {
  size: number;
  engraving: string;
  engravingFont: EngravingFont;
  onSizeChange: (size: number) => void;
  onEngravingChange: (engraving: string) => void;
  onEngravingFontChange: (font: EngravingFont) => void;
  onReset: () => void;
}

const RING_SIZES = [
  2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11,
  11.5, 12,
];

// Ring size to mm conversion (approximate)
const getSizeMM = (size: number) => {
  return (11.63 + (size - 1) * 0.4 * 2.54).toFixed(1);
};

const ENGRAVING_FONTS: {
  value: EngravingFont;
  label: string;
  fontClass: string;
}[] = [
  { value: "regular", label: "Regular", fontClass: "font-sans" },
  { value: "script", label: "Script", fontClass: "font-serif italic" },
  { value: "italics", label: "Italics", fontClass: "italic" },
  { value: "roman", label: "Roman", fontClass: "font-serif" },
];

export function Step3Personalize({
  size,
  engraving,
  engravingFont,
  onSizeChange,
  onEngravingChange,
  onEngravingFontChange,
  onReset,
}: Step3PersonalizeProps) {
  return (
    <div className="">
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

      {/* Ring Size Section */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-base text-[#333]">
            Ring Size:{" "}
            <span className="font-bold">
              {size} ({getSizeMM(size)}mm)
            </span>
          </label>
          <a
            href="#"
            className="text-sm text-[#0313B0] underline hover:text-[#0313B0] hover:opacity-90"
          >
            Size guide
          </a>
        </div>

        <Select
          value={size.toString()}
          onValueChange={(value) => onSizeChange(Number.parseFloat(value))}
        >
          <SelectTrigger className="mt-[10px] min-h-[53px] w-full border border-[#ddd] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RING_SIZES.map((ringSize) => (
              <SelectItem key={ringSize} value={ringSize.toString()}>
                {ringSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Engraving Section */}
      <div className="mt-5">
        <div className="flex items-center">
          <label className="min-w-[133px] text-[#333]">Engraving:</label>

          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Love"
              value={engraving}
              onChange={(e) => onEngravingChange(e.target.value.slice(0, 15))}
              maxLength={15}
              className="h-[53px] w-full border border-[#ddd] bg-white pr-3 text-[#666]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#999]">
              {engraving.length}/15
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        {ENGRAVING_FONTS.map((font) => (
          <button
            key={font.value}
            onClick={() => onEngravingFontChange(font.value)}
            className={`h-[60px] rounded-[5px] border-2 p-4 transition-all ${
              engravingFont === font.value
                ? "border-[#0313B0]"
                : "bg-[#F9F9F9] border-[#ddd]"
            }`}
          >
            <span
              className={`block text-center text-lg ${font.fontClass} ${
                engravingFont === font.value ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {font.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
