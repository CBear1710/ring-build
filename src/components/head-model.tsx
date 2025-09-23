"use client";

import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
import { useGLTF } from "@react-three/drei";

type ShapeKey =
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

type Metal = "white" | "yellow" | "rose" | "platinum";

/** HEAD GLBs matching shapes */
const HEAD_TO_SRC: Record<ShapeKey, string> = {
  round: "/models/ROUNDh.glb",
  princess: "/models/PRINCESS.glb",
  cushion: "/models/CUSHION.glb",
  oval: "/models/OVAL.glb",
  radiant: "/models/RADIANT.glb",
  pear: "/models/PEAR.glb",
  emerald: "/models/EMERALD.glb",
  marquise: "/models/MARQUISE.glb",
  heart: "/models/HEART.glb",
  asscher: "/models/ASSCHER.glb",
};

const METAL_TINT: Record<
  Metal,
  { color: [number, number, number]; metalness: number; roughness: number }
> = {
  white: { color: [0.96, 0.96, 1.0], metalness: 1.0, roughness: 0.25 },
  yellow: { color: [0.98, 0.82, 0.3], metalness: 1.0, roughness: 0.2 },
  rose: { color: [0.95, 0.7, 0.6], metalness: 1.0, roughness: 0.22 },
  platinum: { color: [0.9, 0.92, 0.95], metalness: 1.0, roughness: 0.18 },
};

// carat multiplier used for Head (same as stone)
const CARAT_BASE = 0.5;
const CARAT_FACTOR = 0.92;
const caratToScale = (carat: number) =>
  Math.cbrt(Math.max(0.01, carat) / CARAT_BASE) * CARAT_FACTOR;

export default function HeadModel({
  shape,
  carat,
  metal,
}: {
  shape: ShapeKey;
  carat: number;
  metal: Metal;
}) {
  const url = useMemo(() => HEAD_TO_SRC[shape], [shape]);
  const { scene } = useGLTF(url);

  const wrapper = useRef<Group>(null);
  const childRef = useRef<Object3D | null>(null);
  const baseScalar = useRef<number>(1);

  // rebuild on shape change
  useEffect(() => {
    if (!wrapper.current) return;

    if (childRef.current) {
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    // don't reposition/normalize — viewer uses reference model transform
    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // baseline is whatever transform came from viewer; start at 1
    baseScalar.current = 1;

    // initial tint + carat multiplier
    tintMetal(child, metal);
    child.scale.multiplyScalar(caratToScale(carat));
  }, [scene, url, shape]);

  // re-tint on metal change
  useEffect(() => {
    if (!childRef.current) return;
    tintMetal(childRef.current, metal);
  }, [metal]);

  // rescale with carat (non-cumulative)
  useEffect(() => {
    const child = childRef.current;
    if (!child) return;

    const current = child.scale.x;
    const target = baseScalar.current * caratToScale(carat);
    if (Math.abs(current - target) > 1e-6) {
      const ratio = target / current;
      child.scale.multiplyScalar(ratio);
    }
  }, [carat]);

  return <group ref={wrapper} />;
}

function tintMetal(root: Object3D, metal: Metal) {
  const { color, roughness, metalness } = METAL_TINT[metal];
  root.traverse((o) => {
    const m = (o as Mesh).material as
      | MeshStandardMaterial
      | MeshStandardMaterial[]
      | undefined;
    if (!m) return;
    const apply = (mat: MeshStandardMaterial) => {
      if (!("color" in mat)) return;
      mat.color.setRGB(color[0], color[1], color[2]);
      mat.metalness = metalness;
      mat.roughness = roughness;
      mat.needsUpdate = true;
    };
    Array.isArray(m) ? m.forEach(apply) : apply(m);
  });
}

(Object.values(HEAD_TO_SRC) as string[]).forEach((p) => useGLTF.preload(p));
