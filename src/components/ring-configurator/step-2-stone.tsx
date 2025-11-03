"use client";
import { Button } from "@/components/ui/button";
import { STONE_SHAPES } from "@/lib/ring-configurator/constants";
import { useConfigStore } from "@/store/configurator";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** === Carat slider config (from old StoneCard) === */
const MIN = 0.25;
const MAX = 5;
const STEP = 0.25;
const TICKS = [0.25, 1, 2, 3, 4, 5] as const;

const STEPS = Array.from(
  { length: Math.round((MAX - MIN) / STEP) + 1 },
  (_, i) => Number((MIN + i * STEP).toFixed(2))
);

function valueToIndex(v: number) {
  const idx = STEPS.findIndex((x) => x === Number(v.toFixed(2)));
  return Math.max(0, idx);
}
function indexToValue(i: number) {
  return STEPS[Math.max(0, Math.min(STEPS.length - 1, i))];
}
function clamp(x: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, x));
}
function pctFromIndex(idx: number) {
  return (idx / (STEPS.length - 1)) * 100;
}
function fracFromValue(v: number) {
  return (v - MIN) / (MAX - MIN);
}

interface Step2StoneProps {
  onReset: () => void;
}

export function Step2Stone({ onReset }: Step2StoneProps) {
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  const setShape = useConfigStore((s) => s.setShape);
  const setCarat = useConfigStore((s) => s.setCarat);

  /** ==== Old slider measurements/state ==== */
  const railRef = useRef<HTMLDivElement | null>(null);
  const [railWidth, setRailWidth] = useState(0);
  const [railHeight, setRailHeight] = useState(0);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      setRailWidth(el.clientWidth);
      setRailHeight(el.clientHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const t = setTimeout(update, 0);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  function setFromClientX(clientX: number) {
    const rail = railRef.current;
    if (!rail) return;
    const rect = rail.getBoundingClientRect();
    const r = railHeight / 2; // rounded rail caps
    const inner = Math.max(0, railWidth - 2 * r);
    const x = clamp(clientX - rect.left, 0, railWidth);
    const xClamped = clamp(x - r, 0, inner);
    const t = inner > 0 ? xClamped / inner : 0;
    const idx = Math.round(t * (STEPS.length - 1));
    setCarat(indexToValue(idx));
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  }
  function onPointerMove(e: React.PointerEvent) {
    if ((e.currentTarget as HTMLDivElement).hasPointerCapture(e.pointerId)) {
      setFromClientX(e.clientX);
    }
  }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      const i = valueToIndex(carat);
      setCarat(indexToValue(i - 1));
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      const i = valueToIndex(carat);
      setCarat(indexToValue(i + 1));
    }
    if (e.key === "Home") {
      e.preventDefault();
      setCarat(MIN);
    }
    if (e.key === "End") {
      e.preventDefault();
      setCarat(MAX);
    }
  }

  const idx = valueToIndex(carat);
  const fillPct = pctFromIndex(idx);

  const labelLeftPx = (v: number) => {
    const r = railHeight / 2;
    const inner = Math.max(0, railWidth - 2 * r);
    return r + inner * fracFromValue(v);
  };

  const thumbLeftPx = (() => {
    const r = railHeight / 2;
    const inner = Math.max(0, railWidth - 2 * r);
    return r + inner * fracFromValue(carat);
  })();

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

      {/* Shape grid */}
      <div className="grid grid-cols-3 gap-[10px] md:gap-4 mt-5">
        {STONE_SHAPES.map((stone) => (
          <button
            key={stone.value}
            onClick={() => setShape(stone.value)}
            className={`cursor-pointer flex flex-col items-center gap-1 rounded-[5px] border-2 p-[10px] transition-all hover:opacity-90 ${
              shape === stone.value
                ? "border-[#0313B0]"
                : "bg-[#F9F9F9] border-[#ddd]"
            }`}
          >
            <Image
              width={80}
              height={80}
              src={stone.image || "/placeholder.svg"}
              alt={stone.label}
              className="object-cover"
            />
            <span
              className={`text-xs text-[11px] font-semibold ${
                shape === stone.value ? "text-[#0313B0]" : "text-[#666]"
              }`}
            >
              {stone.label}
            </span>
          </button>
        ))}
      </div>

      {/* === Custom carat slider (old code, adapted) === */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-base text-[#666]">Carat</h3>
          <span className="font-semibold text-[#333]">{carat.toFixed(2)}</span>
        </div>

        {/* Tick labels row */}
        <div className="relative mb-2 h-5" style={{ pointerEvents: "none" }}>
          {TICKS.map((v) => (
            <span
              key={v}
              className="absolute -translate-x-1/2 text-xs text-muted-foreground select-none"
              style={{ left: `${labelLeftPx(v)}px` }}
              aria-hidden
            >
              {Number.isInteger(v) ? v.toFixed(0) : v.toFixed(2)}
            </span>
          ))}
        </div>

        {/* Slider rail */}
        <div
          ref={railRef}
          className="relative h-2 rounded-full bg-black/20 cursor-pointer select-none"
          role="slider"
          aria-label="Carat"
          aria-valuemin={MIN}
          aria-valuemax={MAX}
          aria-valuenow={carat}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onKeyDown={onKeyDown}
        >
          {/* Filled range */}
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-black/70"
            style={{ width: `${fillPct}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border border-black/30 shadow cursor-grab active:cursor-grabbing"
            style={{ left: `${thumbLeftPx}px` }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
