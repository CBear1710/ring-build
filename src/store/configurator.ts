"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type Tab = "setting" | "stone" | "shank";

export type Style =
  | "plain" | "cathedral" | "knife" | "split" | "twisted" | "wide_plain";
export type Metal = "white" | "yellow" | "rose" | "platinum";

export type Purity = "9k" | "14k" | "18k" | null;

export type Shape =
  | "round" | "princess" | "cushion" | "oval" | "radiant"
  | "pear" | "emerald" | "marquise" | "heart" | "asscher";

export type EngravingFont = "regular" | "script" | "italics" | "roman";
export type EngravingSide = "inner" | "outer";

export type ConfigState = {
  // core
  resetKeepTab: any;
  tab: Tab;
  style: Style;
  metal: Metal;
  purity: Purity;

  // stone
  shape: Shape;
  carat: number;

  // engraving (existing)
  engravingText: string;
  engravingFont: EngravingFont;

  // ring sizing
  ringSize: number;

  // engraving (new controls)
  engravingEnabled: boolean;
  engravingFontUrl?: string;          // optional: overrides enum mapping if provided
  engravingSize: number;              // visual size control (mm-like)
  engravingLetterSpacing: number;     // 0..0.1 typical
  engravingColor: string;             // hex
  engravingOpacity: number;           // 0..1
  engravingSide: EngravingSide;       // inner/outer
  engravingOffsetX: number;           // radians along arc (start angle)

  // setters
  setTab: (t: Tab) => void;
  setStyle: (s: Style) => void;
  setMetal: (m: Metal) => void;
  setPurity: (p: Purity) => void;
  setShape: (s: Shape) => void;
  setCarat: (c: number) => void;

  setEngravingText: (t: string) => void;
  setEngravingFont: (f: EngravingFont) => void;
  setRingSize: (v: number) => void;

  setEngravingEnabled: (v: boolean) => void;
  setEngravingFontUrl: (v?: string) => void;
  setEngravingSize: (v: number) => void;
  setEngravingLetterSpacing: (v: number) => void;
  setEngravingColor: (v: string) => void;
  setEngravingOpacity: (v: number) => void;
  setEngravingSide: (v: EngravingSide) => void;
  setEngravingOffsetX: (v: number) => void;

  // batch helper for engraving controls
  setEngraving: (patch: Partial<Pick<
    ConfigState,
    | "engravingEnabled" | "engravingText" | "engravingFont" | "engravingFontUrl"
    | "engravingSize" | "engravingLetterSpacing" | "engravingColor"
    | "engravingOpacity" | "engravingSide" | "engravingOffsetX"
  >>) => void;

  reset: () => void;
};

export const DEFAULTS = {
  tab: "setting" as Tab,
  style: "plain" as Style,
  metal: "white" as Metal,
  purity: "9k" as Purity,

  shape: "round" as Shape,
  carat: 0.5,

  engravingText: "",
  engravingFont: "regular" as EngravingFont,

  ringSize: 2,

  // engraving (new defaults)
  engravingEnabled: false,
  engravingFontUrl: undefined,  // use enum -> font map in component if undefined
  engravingSize: 1.6,
  engravingLetterSpacing: 0.02,
  engravingColor: "#222222",
  engravingOpacity: 1,
  engravingSide: "inner" as EngravingSide,
  engravingOffsetX: 0,
} satisfies Pick<
  ConfigState,
  | "tab" | "style" | "metal" | "purity"
  | "shape" | "carat"
  | "engravingText" | "engravingFont"
  | "ringSize"
  | "engravingEnabled" | "engravingFontUrl" | "engravingSize"
  | "engravingLetterSpacing" | "engravingColor" | "engravingOpacity"
  | "engravingSide" | "engravingOffsetX"
>;

export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULTS,

    // core setters
    setTab: (tab) => set({ tab }),
    setStyle: (style) => set({ style }),

    setMetal: (metal) => {
      if (metal === "platinum") set({ metal, purity: null });
      else {
        const purity = get().purity ?? DEFAULTS.purity;
        set({ metal, purity });
      }
    },

    setPurity: (purity) => set({ purity }),

    // stone
    setShape: (shape) => set({ shape }),
    setCarat: (carat) => set({ carat }),

    // engraving (existing)
    setEngravingText: (engravingText) => set({ engravingText }),
    setEngravingFont: (engravingFont) => set({ engravingFont }),

    // sizing
    setRingSize: (ringSize) => set({ ringSize }),

    // engraving (new)
    setEngravingEnabled: (v) => set({ engravingEnabled: v }),
    setEngravingFontUrl: (v) => set({ engravingFontUrl: v }),
    setEngravingSize: (v) => set({ engravingSize: v }),
    setEngravingLetterSpacing: (v) => set({ engravingLetterSpacing: v }),
    setEngravingColor: (v) => set({ engravingColor: v }),
    setEngravingOpacity: (v) => set({ engravingOpacity: v }),
    setEngravingSide: (v) => set({ engravingSide: v }),
    setEngravingOffsetX: (v) => set({ engravingOffsetX: v }),

    setEngraving: (patch) => set(() => ({ ...patch })),

    // resets
    reset: () => set({ ...DEFAULTS }),
    resetKeepTab: () =>
      set((state) => ({
        ...DEFAULTS,
        tab: state.tab,
      })),
  }))
);
