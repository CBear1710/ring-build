/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { disposeObject3D } from "@/lib/utils/three-dispose";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import {
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";

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
  {
    color: [number, number, number];
    metalness: number;
    roughness: number;
    envMapIntensity: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
  }
> = {
  white: {
    color: [0.93, 0.95, 1.0],
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 1.35,
    clearcoat: 0.2,
    clearcoatRoughness: 0.02,
  },
  yellow: {
    color: [0.83, 0.66, 0.22],
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 1.5,
    clearcoat: 0.15,
    clearcoatRoughness: 0.03,
  },
  rose: {
    color: [0.82, 0.54, 0.5],
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 1.45,
    clearcoat: 0.15,
    clearcoatRoughness: 0.03,
  },
  platinum: {
    color: [0.9, 0.92, 0.95],
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.4,
    clearcoat: 0.25,
    clearcoatRoughness: 0.02,
  },
};

type AnyMetalMat = MeshStandardMaterial | MeshPhysicalMaterial;

function tintMetal(root: Object3D, metal: Metal) {
  const {
    color,
    roughness,
    metalness,
    envMapIntensity,
    clearcoat,
    clearcoatRoughness,
  } = METAL_TINT[metal];

  root.traverse((o) => {
    const mesh = o as Mesh;
    const m = mesh.material as AnyMetalMat | AnyMetalMat[] | undefined;
    if (!m) return;

    const apply = (mat: AnyMetalMat) => {
      if (!("color" in mat)) return;
      mat.color.setRGB(color[0], color[1], color[2]);
      (mat as any).metalness = metalness;
      (mat as any).roughness = roughness;
      (mat as any).envMapIntensity = envMapIntensity;
      if (mat instanceof MeshPhysicalMaterial && clearcoat !== undefined) {
        mat.clearcoat = clearcoat;
        mat.clearcoatRoughness = clearcoatRoughness ?? 0.02;
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

    // clear old
    if (childRef.current) {
      disposeObject3D(childRef.current);
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    // clone new
    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        // Canvas is shadows={false} => set false always
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        // clone material per instance to avoid tint affecting shared cache
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m?.clone?.() ?? m);
        } else {
          mesh.material = (mesh.material as any)?.clone?.() ?? mesh.material;
        }
      }
    });

    tintMetal(child, metal);

    return () => {
      if (wrapper.current && childRef.current) {
        disposeObject3D(childRef.current);
        wrapper.current.remove(childRef.current);
        childRef.current = null;
      }
    };
  }, [scene, url, style, metal]);

  return <group ref={wrapper} />;
}

useGLTF.preload(STYLE_TO_SRC.plain);
useGLTF.preload(STYLE_TO_SRC.cathedral);
useGLTF.preload(STYLE_TO_SRC.knife);
useGLTF.preload(STYLE_TO_SRC.split);
useGLTF.preload(STYLE_TO_SRC.twisted);
useGLTF.preload(STYLE_TO_SRC.wide_plain);
