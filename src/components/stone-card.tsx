"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useConfigStore } from "@/store/configurator";

const SHAPES = [
  { key: "round",    label: "Round",    src: "/stones/round.png" },
  { key: "princess", label: "Princess", src: "/stones/princess.png" },
  { key: "cushion",  label: "Cushion",  src: "/stones/cushion.png" },
  { key: "oval",     label: "Oval",     src: "/stones/oval.png" },
  { key: "radiant",  label: "Radiant",  src: "/stones/radiant.png" },
  { key: "pear",     label: "Pear",     src: "/stones/pear.png" },
  { key: "emerald",  label: "Emerald",  src: "/stones/emerald.png" },
  { key: "marquise", label: "Marquise", src: "/stones/marquise.png" },
  { key: "heart",    label: "Heart",    src: "/stones/heart.png" },
  { key: "asscher",  label: "Asscher",  src: "/stones/asscher.png" },
] as const;

export default function StoneCard() {
  const shape   = useConfigStore(s => s.shape);
  const carat   = useConfigStore(s => s.carat);
  const setShape = useConfigStore(s => s.setShape);
  const setCarat = useConfigStore(s => s.setCarat);

  const activeLabel = SHAPES.find(s => s.key === shape)?.label ?? "";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <CardTitle className="text-[15px] tracking-wide">SHAPE</CardTitle>
            <span className="text-sm text-muted-foreground">{activeLabel}</span>
          </div>
          
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        
        <div className="mb-4 flex flex-wrap gap-3">
          {SHAPES.map(opt => {
            const selected = shape === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setShape(opt.key as typeof shape)}
                title={opt.label}
                className={[
                  "relative w-14 h-14 rounded-full border-2 overflow-hidden bg-white",
                  selected ? "border-black" : "border-gray-300",
                  "focus:outline-none focus:ring-2 focus:ring-black/40"
                ].join(" ")}
              >
                <Image
                  src={opt.src}
                  alt={opt.label}
                  fill
                  sizes="56px"
                  className="object-cover object-center"
                  priority
                />
              </button>
            );
          })}
        </div>

        {/* Carat section */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[15px] font-semibold tracking-wide">CARAT</span>
            <span className="text-sm text-muted-foreground">{carat.toFixed(2)}</span>
          </div>

          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>0.25</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
          </div>

          <Slider
            value={[carat]}
            min={0.25}
            max={5}
            step={0.25}
            onValueChange={(v) => setCarat(Number(v[0]))}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
