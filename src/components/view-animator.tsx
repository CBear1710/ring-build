/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useView } from "@/components/view-context";

const SPIN_SPEED = 1.6; 

const DIRS = {
  perspective: new THREE.Vector3(10, 8, -13).normalize(),
  top:   new THREE.Vector3(0,  1,  0.001).normalize(), 
  front: new THREE.Vector3(0,  0.3, 1).normalize(),
  side:  new THREE.Vector3(1,  0.3, 0).normalize(),
};
const TARGET = new THREE.Vector3(0, 2, 0);

export default function ViewAnimator() {
  const { camera, size, invalidate } = useThree();
  const { view, setView, view360, controls } = useView();

  const lastViewRef = useRef<keyof typeof DIRS | "custom">("perspective");
  const rafRef = useRef<number | null>(null);
  const storedDistRef = useRef<Record<string, number>>({
    perspective: 12, top: 10, front: 10, side: 10,
  });
  const fallbackTargetRef = useRef<THREE.Vector3>(TARGET.clone());

  useEffect(() => {
    const c = controls;
    if (!c) return;
    const onStart = () => setView("custom");
    c.addEventListener?.("start", onStart);
    return () => c?.removeEventListener?.("start", onStart);
  }, [controls, setView]);

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

    if (c.autoRotate) {
      id = requestAnimationFrame(tick);
    } else {
      // settle
      c.update?.();
      invalidate();
    }

    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [controls, view360, invalidate]);

  // Animate to named views (front/top/side), smooth easing
  useEffect(() => {
    if (view === "custom") {
      lastViewRef.current = "custom";
      return;
    }

    // cancel any prior animation
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const ctrl: any = controls;
    const persp = camera as THREE.PerspectiveCamera;

    const curPos = persp.position.clone();
    const curTarget =
      (ctrl?.target as THREE.Vector3) ?? fallbackTargetRef.current.clone();
    const curDist = curPos.distanceTo(curTarget);

    // remember distance for previous named view
    const prev = lastViewRef.current;
    if (prev !== "custom") storedDistRef.current[prev] = curDist;

    // compute goal
    const dir = DIRS[view];
    const dist = storedDistRef.current[view] || curDist;
    const fit = size.width < 768 ? 1.25 : 1.1;
    const goalPos = TARGET.clone().add(dir.clone().multiplyScalar(dist * fit));

    // animate 500ms cubic ease
    const T = 500;
    const t0 = performance.now();
    if (ctrl) ctrl.enabled = false;

    const step = (t: number) => {
      const u = Math.min((t - t0) / T, 1);
      const k = 1 - Math.pow(1 - u, 3); // easeOutCubic

      persp.position.lerpVectors(curPos, goalPos, k);

      if (ctrl?.target) {
        ctrl.target.lerpVectors(curTarget, TARGET, k);
      } else {
        // fallback: remember target locally and lookAt
        fallbackTargetRef.current.lerpVectors(curTarget, TARGET, k);
        camera.lookAt(fallbackTargetRef.current);
      }

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
  }, [view, camera, controls, size.width, invalidate]);

  return null;
}
