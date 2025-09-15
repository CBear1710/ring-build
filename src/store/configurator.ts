"use client";
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


export type ConfigState = {
  tab: Tab;

  style: Style;
  metal: Metal;
  purity: Purity;


  shape: Shape;   
  carat: number;  

  engravingText: string;
  engravingFont: EngravingFont;
  ringSize: number;
  
  setTab: (t: Tab) => void;
  setStyle: (s: Style) => void;
  setMetal: (m: Metal) => void;
  setPurity: (p: Purity) => void;

  
  setShape: (s: Shape) => void;
  setCarat: (c: number) => void;

  setEngravingText: (t: string) => void;
  setEngravingFont: (f: EngravingFont) => void;
  setRingSize: (v: number) => void;

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
} satisfies Pick<
  ConfigState,
  | "tab"
  | "style"
  | "metal"
  | "purity"
  | "shape"
  | "carat"
  | "engravingText"
  | "engravingFont"
  | "ringSize"
>;

export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULTS,

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

    
    setShape: (shape) => set({ shape }),
    setCarat: (carat) => set({ carat }),
    
    setEngravingText: (engravingText) => set({ engravingText }),
    setEngravingFont: (engravingFont) => set({ engravingFont }),
    setRingSize: (ringSize) => set({ ringSize }),

    reset: () => set({ ...DEFAULTS }),
  }))
);
