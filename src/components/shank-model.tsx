"use client";

import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, Object3D } from "three";
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

const METAL_TINT: Record<
  Metal,
  { color: [number, number, number]; metalness: number; roughness: number }
> = {
  white: { color: [0.96, 0.96, 1.0], metalness: 1.0, roughness: 0.25 },
  yellow: { color: [0.98, 0.82, 0.3], metalness: 1.0, roughness: 0.2 },
  rose: { color: [0.95, 0.7, 0.6], metalness: 1.0, roughness: 0.22 },
  platinum: { color: [0.9, 0.92, 0.95], metalness: 1.0, roughness: 0.18 },
};

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

export default function ShankModel({
  style,
  metal,
}: {
  style: StyleKey;
  metal: Metal;
}) {
  const url = useMemo(() => STYLE_TO_SRC[style], [style]);
  const { scene } = useGLTF(url);

  const wrapper = useRef<Group>(null);
  const childRef = useRef<Object3D | null>(null);

  // build/replace on style change
  useEffect(() => {
    if (!wrapper.current) return;

    if (childRef.current) {
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    // don’t move/scale here — viewer applies transform from reference model
    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    tintMetal(child, metal);
  }, [scene, url, style]);

  // re-tint when metal changes
  useEffect(() => {
    if (!childRef.current) return;
    tintMetal(childRef.current, metal);
  }, [metal]);

  return <group ref={wrapper} />;
}

// Preload
Object.values(STYLE_TO_SRC).forEach((p) => useGLTF.preload(p));
