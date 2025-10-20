"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { StoneShape } from "@/lib/ring-configurator/types";
import { RotateCcw } from "lucide-react";
import Image from "next/image";

interface Step2StoneProps {
  shape: StoneShape;
  carat: number;
  onShapeChange: (shape: StoneShape) => void;
  onCaratChange: (carat: number) => void;
  onReset: () => void;
}

const STONE_SHAPES: { value: StoneShape; label: string; image: string }[] = [
  { value: "round", label: "Round", image: "/shapes/round.png" },
  {
    value: "princess",
    label: "Princess",
    image: "/shapes/princess.png",
  },
  {
    value: "cushion",
    label: "Cushion",
    image: "/shapes/cushion.png",
  },
  { value: "oval", label: "Oval", image: "/shapes/oval.png" },
  {
    value: "radiant",
    label: "Radiant",
    image: "/shapes/radiant.png",
  },
  { value: "pear", label: "Pear", image: "/shapes/pear.png" },
  {
    value: "emerald",
    label: "Emerald",
    image: "/shapes/emerald.png",
  },
  {
    value: "marquise",
    label: "Marquise",
    image: "/shapes/marquise.png",
  },
  { value: "heart", label: "Heart", image: "/shapes/heart.png" },
  {
    value: "asscher",
    label: "Asscher",
    image: "/shapes/asscher.png",
  },
];

export function Step2Stone({
  shape,
  carat,
  onShapeChange,
  onCaratChange,
  onReset,
}: Step2StoneProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-base text-[#666]">
          Shape:{" "}
          <span className="font-semibold capitalize text-[#333]">{shape}</span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-none text-sm text-black gap-2 bg-transparent border-[#ddd] hover:bg-transparent hover:opacity-90"
        >
          Reset <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-[10px] md:gap-4 mt-5">
        {STONE_SHAPES.map((stoneShape) => (
          <button
            key={stoneShape.value}
            onClick={() => onShapeChange(stoneShape.value)}
            className={`cursor-pointer flex flex-col items-center gap-1 rounded-[5px] border-2 p-[10px] transition-all hover:opacity-90  ${
              shape === stoneShape.value
                ? "border-[#0313B0]"
                : "bg-[#F9F9F9] border-[#ddd]"
            }`}
          >
            <Image
              width={80}
              height={80}
              src={stoneShape.image || "/placeholder.svg"}
              alt={stoneShape.label}
              className="object-cover"
            />
            <span
              className={`text-xs text-[11px] font-semibold ${
                shape === stoneShape.value ? "text-[#0313B0]" : "text-[#666]"
              }`}
            >
              {stoneShape.label}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="mb-4 text-base text-[#666]">
          Carat: <span className="font-semibold text-[#333]">{carat}</span>
        </h3>

        <div className="space-y-2">
          <Slider
            value={[carat]}
            onValueChange={(values) => onCaratChange(values[0])}
            min={0.25}
            max={5}
            step={0.25}
            className="w-full"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.25</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
