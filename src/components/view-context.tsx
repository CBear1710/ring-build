/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
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
  saveFrom: (camera: THREE.PerspectiveCamera, controls: any) => void;
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

  const [target, setTarget] = useState(() => new THREE.Vector3(0, 2, 0));
  const [radius, setRadius] = useState<number | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ t: THREE.Vector3; r: number } | null>(null);

  const saveFrom = (cam: THREE.PerspectiveCamera, c: any) => {
    const t = (c?.target as THREE.Vector3) ?? target;
    const r = cam.position.distanceTo(t);
    pendingRef.current = { t: t.clone(), r };
    if (rafRef.current == null) {
      rafRef.current = requestAnimationFrame(() => {
        const p = pendingRef.current;
        if (p) {
          setTarget(p.t);
          setRadius(p.r);
        }
        rafRef.current = null;
      });
    }
  };

  const applyTo = (
    cam: THREE.PerspectiveCamera,
    c: any,
    opts?: { preserveRadius?: boolean; onlyTarget?: boolean }
  ) => {
    const t = target.clone();
    if (c?.target) c.target.copy(t);
    if (!opts?.onlyTarget) {
      const dir = cam.position.clone().sub(t).normalize();
      const r =
        opts?.preserveRadius && radius != null
          ? radius
          : cam.position.distanceTo(t);
      cam.position.copy(t.clone().add(dir.multiplyScalar(r)));
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
