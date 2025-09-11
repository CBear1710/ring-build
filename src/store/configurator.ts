"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

type Tab = "setting" | "stone" | "shank";
type Style =
  | "plain" | "cathedral" | "knife" | "split" | "twisted" | "wide_plain";
type Metal = "white" | "yellow" | "rose" | "platinum";
type Purity = "9k" | "14k" | "18k" | null;

export type ConfigState = {
  
  tab: Tab;

  
  style: Style;
  metal: Metal;
  purity: Purity;


  setTab: (t: Tab) => void;
  setStyle: (s: Style) => void;
  setMetal: (m: Metal) => void;
  setPurity: (p: Purity) => void;

  reset: () => void;
};

// defaults (first option = default)
export const DEFAULTS = {
  tab: "setting" as Tab,
  style: "plain" as Style,
  metal: "white" as Metal,
  purity: "9k" as Purity,
};

export const useConfigStore = create<ConfigState>()(
  subscribeWithSelector((set, get) => ({
    ...DEFAULTS,

    setTab: (tab) => set({ tab }),
    setStyle: (style) => set({ style }),

    setMetal: (metal) => {
      if (metal === "platinum") set({ metal, purity: null });
      else {
        // if purity was null --> default
        const purity = get().purity ?? DEFAULTS.purity;
        set({ metal, purity });
      }
    },

    setPurity: (purity) => set({ purity }),

    reset: () => set({ ...DEFAULTS }),
  }))
);
