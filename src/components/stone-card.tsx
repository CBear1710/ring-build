/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

const STEPS = Array.from({ length: Math.round((MAX - MIN) / STEP) + 1 }, (_, i) =>
  Number((MIN + i * STEP).toFixed(2))
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

export default function StoneCard() {
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);
  const setShape = useConfigStore((s) => s.setShape);
  const setCarat = useConfigStore((s) => s.setCarat);

  const activeLabel = useMemo(
    () => SHAPES.find((s) => s.key === shape)?.label ?? "",
    [shape]
  );

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
    const r = railHeight / 2;
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

        <div className="mt-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[15px] font-semibold tracking-wide">CARAT</span>
            <span className="text-sm text-muted-foreground">
              {carat.toFixed(2)}
            </span>
          </div>

          <div className="relative mb-2 h-5">
            <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
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
          </div>

          <div
            ref={railRef}
            className="relative h-2 rounded-full bg-black/20"
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
            <div
              className="absolute left-0 top-0 h-2 rounded-full bg-black/70"
              style={{ width: `${fillPct}%` }}
            />
            <div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border border-black/30 shadow"
              style={{ left: `${thumbLeftPx}px` }}
              aria-hidden
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
