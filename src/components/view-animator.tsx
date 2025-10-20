/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useView } from "@/components/view-context";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const SPIN_SPEED = 5.0;

const DIRS: Record<string, THREE.Vector3> = {
  perspective: new THREE.Vector3(10, 8, -13).normalize(),
  top: new THREE.Vector3(0, 1, 0.001).normalize(),
  front: new THREE.Vector3(0, 0.3, 1).normalize(),
  side: new THREE.Vector3(1, 0.3, 0).normalize(),
};

export default function ViewAnimator() {
  const { camera, invalidate } = useThree();
  const { view, setView, view360, controls, setView360 } = useView();

  const rafRef = useRef<number | null>(null);
  const lastViewRef = useRef<keyof typeof DIRS | "custom">("perspective");

  // detect manual control use
  useEffect(() => {
    const c = controls;

    if (!c) return;

    const onStart = () => {
      setView("custom");
      setView360(false);
    };

    c.addEventListener?.("start", onStart);
    return () => c?.removeEventListener?.("start", onStart);
  }, [controls, setView]);

  // handle auto rotation
  useEffect(() => {
    const c = controls as any;
    if (!c) return;

    c.autoRotate = !!view360;
    c.autoRotateSpeed = SPIN_SPEED;

    let id: number | null = null;
    const tick = () => {
      c.update?.();
      invalidate();
      if (c.autoRotate) id = requestAnimationFrame(tick);
    };

    if (c.autoRotate) id = requestAnimationFrame(tick);
    else {
      c.update?.();
      invalidate();
    }

    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [controls, view360, invalidate]);

  useEffect(() => {
    if (view === "custom") {
      lastViewRef.current = "custom";
      return;
    }
    if (!controls) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const ctrl: any = controls;
    const persp = camera as THREE.PerspectiveCamera;

    const curPos = persp.position.clone();
    const curTarget =
      (ctrl?.target as THREE.Vector3) ?? new THREE.Vector3(0, 2, 0);

    // current distance (radius)
    const radius = curPos.distanceTo(curTarget);

    // direction vector for new view
    const dir = DIRS[view] || DIRS.perspective;

    const goalPos = curTarget.clone().add(dir.clone().multiplyScalar(radius));

    const T = 500;
    const t0 = performance.now();
    if (ctrl) ctrl.enabled = false;

    const step = (t: number) => {
      const u = Math.min((t - t0) / T, 1);
      const k = 1 - Math.pow(1 - u, 3);
      persp.position.lerpVectors(curPos, goalPos, k);
      if (ctrl?.target) ctrl.target.copy(curTarget);
      persp.updateProjectionMatrix();
      ctrl?.update?.();
      invalidate();

      if (u < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        if (ctrl) ctrl.enabled = true;
        lastViewRef.current = view;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [view, camera, controls, invalidate]);

  return null;
}
