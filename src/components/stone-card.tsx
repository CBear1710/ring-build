/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

const MIN = 0.25;
const MAX = 5;
const STEP = 0.25;
const TICKS = [0.25, 1, 2, 3, 4, 5] as const;

const frac = (v: number) => (v - MIN) / (MAX - MIN);

export default function StoneCard() {
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);
  const setShape = useConfigStore((s) => s.setShape);
  const setCarat = useConfigStore((s) => s.setCarat);

  const activeLabel = SHAPES.find((s) => s.key === shape)?.label ?? "";

  const sliderRootRef = useRef<HTMLDivElement | null>(null);
  const [trackLeft, setTrackLeft] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [trackHeight, setTrackHeight] = useState(0);

  useEffect(() => {
    if (!sliderRootRef.current) return;
    const root = sliderRootRef.current;

    const update = () => {
      const track =
        root.querySelector<HTMLElement>("[data-radix-slider-track]") ||
        root.querySelector<HTMLElement>("[role='slider']") ||
        root.querySelector<HTMLElement>("[data-orientation]");

      if (track) {
        setTrackLeft(track.offsetLeft);
        setTrackWidth(track.clientWidth);
        setTrackHeight(track.clientHeight);
      } else {
        setTrackLeft(0);
        setTrackWidth(root.clientWidth);
        setTrackHeight(0);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(root);

    const t1 = setTimeout(update, 0);
    const t2 = setTimeout(update, 100);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const posPx = (f: number) => {
    const r = trackHeight / 2; 
    const inner = Math.max(0, trackWidth - 2 * r); 
    return trackLeft + r + inner * f;
  };

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
        {/* Shape picker */}
        <div className="mb-4 flex flex-wrap gap-3">
          {SHAPES.map((opt) => {
            const selected = shape === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setShape(opt.key as any)}
                title={opt.label}
                className={[
                  "relative w-14 h-14 rounded-full border-2 overflow-hidden bg-white",
                  selected ? "border-black" : "border-gray-300",
                  "focus:outline-none focus:ring-2 focus:ring-black/40",
                ].join(" ")}
                aria-pressed={selected}
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

          <div ref={sliderRootRef} className="relative">
            <div className="relative mb-2 h-5">
              <div className="absolute top-0 left-0 right-0">
                {TICKS.map((v) => {
                  const leftPx = posPx(frac(v));
                  return (
                    <span
                      key={v}
                      style={{ left: `${leftPx}px` }}
                      className="absolute -translate-x-1/2 text-xs text-muted-foreground select-none pointer-events-none"
                      aria-hidden
                    >
                      {Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <Slider
              value={[carat]}
              min={MIN}
              max={MAX}
              step={STEP}
              onValueChange={(v) => setCarat(Number(v[0]))}
              className="w-full"
              aria-label="Carat"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
