/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type View = "perspective" | "top" | "side" | "front" | "custom";

type ViewState = {
  view: View;
  setView: (v: View) => void;
  view360: boolean;
  setView360: (v: boolean) => void;
  controls: any | null;
  setControls: (c: any | null) => void;
};

const Ctx = createContext<ViewState | null>(null);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  // Start on FRONT as requested
  const [view, setView] = useState<View>("front");
  const [view360, setView360] = useState(false);
  const [controls, setControls] = useState<any | null>(null);

  const value = useMemo(
    () => ({ view, setView, view360, setView360, controls, setControls }),
    [view, view360, controls]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
}
