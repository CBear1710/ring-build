"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Group, Mesh, Object3D, Euler } from "three";
import { GLTFLoader, OBJLoader } from "three-stdlib";

const SHAPE_TO_SRC = {
  round: "/models/Rounds.glb",
  princess: "/models/princess.obj",
  cushion: "/models/cushion.obj",
  oval: "/models/oval.obj",
  radiant: "/models/radiant.obj",
  pear: "/models/PEAR.obj",
  emerald: "/models/EMERALD.obj",
  marquise: "/models/MARQUISE.obj",
  heart: "/models/HEART.obj",
  asscher: "/models/ASSCHER.obj",
} as const;

type ShapeKey = keyof typeof SHAPE_TO_SRC;

const STONE_TWEAKS: Partial<
  Record<
    ShapeKey,
    { scale?: number; offset?: [number, number, number]; rotate?: [number, number, number] }
  >
> = {
  round:    { scale: 2.0, offset: [0, 0.9, 0] },
  princess: { scale: 0.9, offset: [0,0.9,0] },
  cushion:  { scale: 0.8, offset: [0,1.5,0] },
  oval:     { scale: 0.9, offset:[0,1.5,0] },
  radiant:  { scale: 1.5, offset: [0,0.9,0] },
  pear:     { scale: 0.8, offset: [0, 1.2, -0.5] },
  emerald:  { scale: 0.9, offset: [0,1.2,0] },
  marquise: { scale: 0.8, offset: [0, 1.2, 0] },
  heart:    { scale: 0.7, offset: [0, 1.2, -0.5] },
  asscher:  { scale: 0.7, offset: [0,1.2,0] },
};

const CARAT_BASE = 0.5;
const CARAT_FACTOR = 0.92;
const caratToScale = (carat: number) =>
  Math.cbrt(Math.max(0.01, carat) / CARAT_BASE) * CARAT_FACTOR;

export default function StoneModel({
  shape,
  carat,
}: {
  shape: ShapeKey;
  carat: number;
}) {
  const url = useMemo(() => SHAPE_TO_SRC[shape], [shape]);
  const wrapper = useRef<Group>(null);
  const childRef = useRef<Object3D | null>(null);
  const baseScalar = useRef<number>(1); // after per-shape tweak, before carat

  // Load & mount (deps are STABLE: [url, shape])
  useEffect(() => {
    if (!wrapper.current) return;
    let aborted = false;

    if (childRef.current) {
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    const applyCommon = (child: Object3D) => {
      if (aborted || !wrapper.current) return;
      wrapper.current.add(child);
      childRef.current = child;

      child.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });

      // per-shape tweak BEFORE carat
      const t = STONE_TWEAKS[shape];
      const s = t?.scale ?? 1;
      baseScalar.current = s;

      if (s !== 1) child.scale.multiplyScalar(s);
      if (t?.rotate) child.rotation.copy(new Euler(...t.rotate));
      if (t?.offset) {
        const [ox, oy, oz] = t.offset;
        child.position.x += ox;
        child.position.y += oy;
        child.position.z += oz;
      }
    };

    const isGLB = url.toLowerCase().endsWith(".glb");

    if (isGLB) {
      new GLTFLoader().load(
        url,
        (gltf) => applyCommon(gltf.scene || gltf.scenes?.[0] || new THREE.Group())
      );
    } else {
      new OBJLoader().load(url, (obj) => applyCommon(obj));
    }

    return () => {
      aborted = true;
    };
  }, [url, shape]); // <- stable length

  // Apply carat (separate effect with a STABLE single dep)
  useEffect(() => {
    const child = childRef.current;
    if (!child) return;
    const target = baseScalar.current * caratToScale(carat);
    const current = child.scale.x || 1;
    if (Math.abs(current - target) > 1e-6) {
      child.scale.multiplyScalar(target / current);
    }
  }, [carat]); // <- stable length

  return <group ref={wrapper} />;
}
