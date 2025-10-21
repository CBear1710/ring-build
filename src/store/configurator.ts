"use client";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import type { EngravingFont } from "@/lib/engraving-fonts";
import { asEngravingFont } from "@/lib/engraving-fonts";

export type Tab = "setting" | "stone" | "shank";

export type Style =
  | "plain"
  | "cathedral"
  | "knife"
  | "split"
  | "twisted"
  | "wide_plain";

export type Metal = "white" | "yellow" | "rose" | "platinum";

export type Purity = "9k" | "14k" | "18k" | null;

export type Shape =
  | "round"
  | "princess"
  | "cushion"
  | "oval"
  | "radiant"
  | "pear"
  | "emerald"
  | "marquise"
  | "heart"
  | "asscher";

export type EngravingSide = "inner" | "outer";

type EngravingControls = {
  engravingEnabled: boolean;
  engravingText: string;
  engravingFont: EngravingFont;
  engravingFontUrl?: string;
  engravingSize: number;
  engravingLetterSpacing: number;
  engravingColor: string;
  engravingOpacity: number;
  engravingSide: EngravingSide;
  engravingOffsetX: number;
};

export type ConfigState = {
  // Core
  resetKeepTab: () => void;
  tab: Tab;
  style: Style;
  metal: Metal;
  purity: Purity;

  // Stone
  shape: Shape;
  carat: number;

  // Sizing
  ringSize: number;

  // Engraving
} & EngravingControls & {
    // Setters
    setTab: (t: Tab) => void;
    setStyle: (s: Style) => void;
    setMetal: (m: Metal) => void;
    setPurity: (p: Purity) => void;

    setShape: (s: Shape) => void;
    setCarat: (c: number) => void;

    setRingSize: (v: number) => void;

    setEngravingEnabled: (v: boolean) => void;
    setEngravingText: (t: string) => void;

    setEngravingFont: (f: EngravingFont) => void;

    setEngravingFontFromAny: (f: string | undefined | null) => void;

    setEngravingFontUrl: (v?: string) => void;
    setEngravingSize: (v: number) => void;
    setEngravingLetterSpacing: (v: number) => void;
    setEngravingColor: (v: string) => void;
    setEngravingOpacity: (v: number) => void;
    setEngravingSide: (v: EngravingSide) => void;
    setEngravingOffsetX: (v: number) => void;

    // Batch helper for engraving controls
    setEngraving: (patch: Partial<EngravingControls>) => void;

    reset: () => void;
  };

// ------- Defaults (typed, narrow, no 'any') -------
export const DEFAULTS = {
  tab: "setting" as const,
  style: "plain" as const,
  metal: "white" as const,
  purity: "18k" as const,

  shape: "round" as const,
  carat: 0.5,

  ringSize: 2,

  // Engraving Defaults
  engravingEnabled: false,
  engravingText: "",
  engravingFont: "regular" as EngravingFont,
  engravingFontUrl: undefined,
  engravingSize: 1.6,
  engravingLetterSpacing: 0.02,
  engravingColor: "#222222",
  engravingOpacity: 1,
  engravingSide: "inner" as const,
  engravingOffsetX: 0,
} satisfies Omit<ConfigState, keyof ConfigState & string>;

export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULTS,

    // Core setters
    setTab: (tab) => set({ tab }),
    setStyle: (style) => set({ style }),

    setMetal: (metal) =>
      set((state) => ({
        metal,
        purity: metal === "platinum" ? null : state.purity,
      })),
    setPurity: (purity) => set({ purity }),

    // Stone
    setShape: (shape) => set({ shape }),
    setCarat: (carat) => set({ carat }),

    // Sizing
    setRingSize: (ringSize) => set({ ringSize }),

    // Engraving
    setEngravingEnabled: (v) => set({ engravingEnabled: v }),
    setEngravingText: (engravingText) => set({ engravingText }),

    // Strict: Components should pass only the Union
    setEngravingFont: (engravingFont) => set({ engravingFont }),

    // Hydration-safe: Accepts any string & normalizes to the union
    setEngravingFontFromAny: (value) =>
      set({ engravingFont: asEngravingFont(value) }),
    setEngravingFontUrl: (v) => set({ engravingFontUrl: v }),
    setEngravingSize: (v) => set({ engravingSize: v }),
    setEngravingLetterSpacing: (v) => set({ engravingLetterSpacing: v }),
    setEngravingColor: (v) => set({ engravingColor: v }),
    setEngravingOpacity: (v) => set({ engravingOpacity: v }),
    setEngravingSide: (v) => set({ engravingSide: v }),
    setEngravingOffsetX: (v) => set({ engravingOffsetX: v }),
    setEngraving: (patch) => set(patch),

    // Resets
    reset: () => set({ ...DEFAULTS }),
    resetKeepTab: () =>
      set((state) => ({
        ...DEFAULTS,
        tab: state.tab,
      })),
  }))
);
