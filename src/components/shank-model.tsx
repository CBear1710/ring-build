/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Object3D,
} from "three";
import { useGLTF } from "@react-three/drei";

const STYLE_TO_SRC = {
  plain: "/models/PLAIN.glb",
  cathedral: "/models/CATHEDRAL.glb",
  knife: "/models/KNIFE-EDGE.glb",
  split: "/models/SPLIT.glb",
  twisted: "/models/TWISTED.glb",
  wide_plain: "/models/WIDE-PLAIN.glb",
} as const;

type StyleKey = keyof typeof STYLE_TO_SRC;
type Metal = "white" | "yellow" | "rose" | "platinum";

/** Higher-saturation tints + polished roughness + stronger reflections */
const METAL_TINT: Record<
  Metal,
  {
    color: [number, number, number];
    metalness: number;
    roughness: number;
    envMapIntensity: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
  }
> = {
  // Cool, bright white-metal look
  white:    { color: [0.93, 0.95, 1.00], metalness: 1.0, roughness: 0.06, envMapIntensity: 1.35, clearcoat: 0.2, clearcoatRoughness: 0.02 },
  // Rich yellow gold
  yellow:   { color: [0.83, 0.66, 0.22], metalness: 1.0, roughness: 0.08, envMapIntensity: 1.50, clearcoat: 0.15, clearcoatRoughness: 0.03 },
  // Warmer rose gold
  rose:     { color: [0.82, 0.54, 0.50], metalness: 1.0, roughness: 0.08, envMapIntensity: 1.45, clearcoat: 0.15, clearcoatRoughness: 0.03 },
  // Slightly darker than “white”
  platinum: { color: [0.90, 0.92, 0.95], metalness: 1.0, roughness: 0.05, envMapIntensity: 1.40, clearcoat: 0.25, clearcoatRoughness: 0.02 },
};

type AnyMetalMat = MeshStandardMaterial | MeshPhysicalMaterial;

function tintMetal(root: Object3D, metal: Metal) {
  const { color, roughness, metalness, envMapIntensity, clearcoat, clearcoatRoughness } =
    METAL_TINT[metal];

  root.traverse((o) => {
    const m = (o as Mesh).material as AnyMetalMat | AnyMetalMat[] | undefined;
    if (!m) return;

    const apply = (mat: AnyMetalMat) => {
      if (!("color" in mat)) return;
      mat.color.setRGB(color[0], color[1], color[2]);
      (mat as any).metalness = metalness;
      (mat as any).roughness = roughness;
      (mat as any).envMapIntensity = envMapIntensity;
      if ("clearcoat" in mat && clearcoat !== undefined) {
        (mat as any).clearcoat = clearcoat;
        (mat as any).clearcoatRoughness = clearcoatRoughness ?? 0.02;
      }
      mat.needsUpdate = true;
    };

    Array.isArray(m) ? m.forEach(apply) : apply(m as AnyMetalMat);
  });
}

export default function ShankModel({
  style,
  metal,
}: {
  style: StyleKey;
  metal: Metal;
}) {
  const url = useMemo(() => STYLE_TO_SRC[style], [style]);
  const { scene } = useGLTF(url);

  const wrapper = useRef<Group | null>(null);
  const childRef = useRef<Object3D | null>(null);

  useEffect(() => {
    if (!wrapper.current) return;

    if (childRef.current) {
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    tintMetal(child, metal);
  }, [scene, url, style]);

  useEffect(() => {
    if (!childRef.current) return;
    tintMetal(childRef.current, metal);
  }, [metal]);

  return <group ref={wrapper} />;
}

// Preload
Object.values(STYLE_TO_SRC).forEach((p) => useGLTF.preload(p));
