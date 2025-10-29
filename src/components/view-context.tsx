/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import * as THREE from "three";

export type View = "perspective" | "top" | "side" | "front" | "360" | "custom";

type ViewState = {
  view: View;
  setView: (v: View) => void;

  view360: boolean;
  setView360: (v: boolean) => void;

  controls: any | null;
  setControls: (c: any | null) => void;

  target: THREE.Vector3;
  radius: number | null;

  /** Capture current orbit target + camera distance *synchronously* */
  saveFrom: (camera: THREE.PerspectiveCamera, controls: any) => void;

  /**
   * Apply stored target (and optionally camera position) to the given camera/controls.
   * Defaults are conservative: keep the same radius and don't move the camera.
   */
  applyTo: (
    camera: THREE.PerspectiveCamera,
    controls: any,
    opts?: { preserveRadius?: boolean; onlyTarget?: boolean }
  ) => void;
};

const Ctx = createContext<ViewState | null>(null);

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<View>("front");
  const [view360, setView360] = useState(false);
  const [controls, setControls] = useState<any | null>(null);

  // Default target is your scene center; radius will be captured on first saveFrom
  const [target, setTarget] = useState(() => new THREE.Vector3(0, 2, 0));
  const [radius, setRadius] = useState<number | null>(null);

  /** Capture the *current* orbit state synchronously (no RAF, no batching). */
  const saveFrom = (cam: THREE.PerspectiveCamera, c: any) => {
    const t = (c?.target as THREE.Vector3) ?? target;
    const r = cam.position.distanceTo(t);
    setTarget(t.clone());
    setRadius(r);
  };

  /**
   * Apply stored orbit state. By default this will *only* update the target,
   * preserving the user's current camera position to avoid visible "snaps".
   */
  const applyTo = (
    cam: THREE.PerspectiveCamera,
    c: any,
    opts: { preserveRadius?: boolean; onlyTarget?: boolean } = {}
  ) => {
    const preserve = opts.preserveRadius ?? true;
    const only = opts.onlyTarget ?? true;

    const t = target.clone();

    // always sync controls.target to ensure orbit rotates around the stored center
    if (c?.target) c.target.copy(t);

    // only move the camera if explicitly requested
    if (!only) {
      const dir = cam.position.clone().sub(t).normalize();
      const desiredR =
        preserve && radius != null ? radius : cam.position.distanceTo(t);
      cam.position.copy(t.clone().add(dir.multiplyScalar(desiredR)));
    }

    cam.updateProjectionMatrix();
    c?.update?.();
  };

  const value = useMemo(
    () => ({
      view,
      setView,
      view360,
      setView360,
      controls,
      setControls,
      target,
      radius,
      saveFrom,
      applyTo,
    }),
    [view, view360, controls, target, radius]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
}
