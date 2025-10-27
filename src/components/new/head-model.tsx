/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { disposeObject3D } from "@/lib/utils/three-dispose";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
} from "three";

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

const STONE_BASE_XZ_MIN: Record<ShapeKey, number> = {
  round: 2.4,
  princess: 1.6,
  cushion: 1.8,
  oval: 1.5,
  radiant: 1.55,
  pear: 1.15,
  emerald: 1.1,
  marquise: 1.3,
  heart: 1.1,
  asscher: 1.25,
};

const CARAT_STEP_SIZE = 0.25;
const CARAT_MIN = 0.25;
const STONE_STEP_GAIN = 0.015;

const HEAD_GROW_RATIO = 0.95;
const HEAD_CLEARANCE = 0.04;

const SEAT_ALPHA = -1.3;
const HEAD_BASE_SCALE_XZ = 1.1;
const HEAD_BASE_SCALE_Y = 1.0;

const METAL_TINT: Record<
  Metal,
  {
    color: [number, number, number];
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  }
> = {
  white: {
    color: [0.93, 0.95, 1.0],
    metalness: 1.0,
    roughness: 0.06,
    envMapIntensity: 1.35,
  },
  yellow: {
    color: [0.83, 0.66, 0.22],
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 1.5,
  },
  rose: {
    color: [0.82, 0.54, 0.5],
    metalness: 1.0,
    roughness: 0.08,
    envMapIntensity: 1.45,
  },
  platinum: {
    color: [0.9, 0.92, 0.95],
    metalness: 1.0,
    roughness: 0.05,
    envMapIntensity: 1.4,
  },
};

type AnyMetalMat = MeshStandardMaterial | MeshPhysicalMaterial;

function tintMetal(root: Object3D, metal: Metal) {
  const { color, roughness, metalness, envMapIntensity } = METAL_TINT[metal];
  root.traverse((o) => {
    const mesh = o as Mesh;
    const m = mesh.material as AnyMetalMat | AnyMetalMat[] | undefined;
    if (!m) return;
    const apply = (mat: AnyMetalMat) => {
      if (!("color" in mat)) return;
      mat.color.setRGB(...color);
      (mat as any).metalness = metalness;
      (mat as any).roughness = roughness;
      (mat as any).envMapIntensity = envMapIntensity;
      mat.needsUpdate = true;
    };
    Array.isArray(m) ? m.forEach(apply) : apply(m as AnyMetalMat);
  });
}

function quantizeCarat(carat: number) {
  const q = Math.round(carat / CARAT_STEP_SIZE) * CARAT_STEP_SIZE;
  return Math.max(CARAT_MIN, Number(q.toFixed(2)));
}
function stoneGainFromCarat(carat: number) {
  const q = quantizeCarat(carat);
  const stepsFrom1 = Math.round((q - 1.0) / CARAT_STEP_SIZE);
  return stepsFrom1 * STONE_STEP_GAIN;
}

const SEAT_BAND_FRAC = 0.2;

function normalizeHeadToSeat_bbox(child: Object3D) {
  const box = new THREE.Box3().setFromObject(child);
  if (!isFinite(box.min.x) || box.isEmpty()) return;

  const centerW = new THREE.Vector3();
  box.getCenter(centerW);

  const h = box.max.y - box.min.y;
  const seatYW = box.min.y + SEAT_ALPHA * h;
  const seatWorld = new THREE.Vector3(centerW.x, seatYW, centerW.z);

  const parent = child.parent ?? child;
  const seatLocal = seatWorld.clone();
  parent.worldToLocal(seatLocal);

  child.position.sub(seatLocal);
  child.updateMatrixWorld(true);
}

function normalizeHeadToSeat_slice(child: Object3D) {
  const bbox = new THREE.Box3().setFromObject(child);
  if (!isFinite(bbox.min.x) || bbox.isEmpty()) return;

  const h = bbox.max.y - bbox.min.y;
  const seatY_raw = bbox.min.y + SEAT_ALPHA * h;

  const yForSlice = THREE.MathUtils.clamp(seatY_raw, bbox.min.y, bbox.max.y);
  const band = Math.max(1e-6, h * SEAT_BAND_FRAC);
  const yMin = yForSlice - band * 0.5;
  const yMax = yForSlice + band * 0.5;

  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity,
    found = false;
  const v = new THREE.Vector3();

  child.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const geom = mesh.geometry as BufferGeometry;
    const pos = geom?.attributes?.position as BufferAttribute | undefined;
    if (!pos) return;

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      mesh.localToWorld(v);
      if (v.y >= yMin && v.y <= yMax) {
        found = true;
        if (v.x < minX) minX = v.x;
        if (v.x > maxX) maxX = v.x;
        if (v.z < minZ) minZ = v.z;
        if (v.z > maxZ) maxZ = v.z;
      }
    }
  });

  let midX: number, midZ: number;
  if (found) {
    midX = (minX + maxX) * 0.5;
    midZ = (minZ + maxZ) * 0.5;
  } else {
    const c = new THREE.Vector3();
    bbox.getCenter(c);
    midX = c.x;
    midZ = c.z;
  }

  const seatWorld = new THREE.Vector3(midX, seatY_raw, midZ);
  const parent = child.parent ?? child;
  const seatLocal = seatWorld.clone();
  parent.worldToLocal(seatLocal);

  child.position.sub(seatLocal);
  child.updateMatrixWorld(true);
}

export default function HeadModel({
  shape,
  carat,
  metal,
  onReady, // optional
}: {
  shape: ShapeKey;
  carat: number;
  metal: Metal;
  onReady?: (wrapper: Group) => void;
}) {
  const url = useMemo(() => HEAD_TO_SRC[shape], [shape]);
  const { scene } = useGLTF(url);

  const wrapper = useRef<Group | null>(null);
  const childRef = useRef<Object3D | null>(null);
  const baseYScaleRef = useRef<number>(1);

  const computeHeadXZ = (shapeKey: ShapeKey, caratVal: number) => {
    const rStone = stoneGainFromCarat(caratVal);
    const rHead = rStone * HEAD_GROW_RATIO;
    const xzUnclamped = HEAD_BASE_SCALE_XZ + rHead;

    const stoneBase = STONE_BASE_XZ_MIN[shapeKey];
    const maxAllowed = stoneBase + rStone - HEAD_CLEARANCE;

    return Math.max(0.001, Math.min(xzUnclamped, maxAllowed));
  };

  useEffect(() => {
    if (!wrapper.current) return;

    // clear old + dispose
    if (childRef.current) {
      disposeObject3D(childRef.current);
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    // clone new from GLTF cache
    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        // Canvas is shadows={false} -> set false to light pipeline
        mesh.castShadow = false;
        mesh.receiveShadow = false;

        // Clone material per instance to avoid tint affecting cache
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m?.clone?.() ?? m);
        } else {
          mesh.material = (mesh.material as any)?.clone?.() ?? mesh.material;
        }
      }
    });

    // Center seat: use slice for heart/pear, use bbox for others
    if (shape === "heart" || shape === "pear") {
      normalizeHeadToSeat_slice(child);
    } else {
      normalizeHeadToSeat_bbox(child);
    }

    baseYScaleRef.current = child.scale.y || 1;

    // Apply metal tint
    tintMetal(child, metal);

    // Scale XZ according to carat, Y keep base
    const xz = computeHeadXZ(shape, carat);
    const y = baseYScaleRef.current * HEAD_BASE_SCALE_Y;
    child.scale.set(xz, y, xz);
    child.updateMatrixWorld(true);

    // Notify parent that it's ready (if any)
    requestAnimationFrame(() => {
      if (!wrapper.current) return;
      wrapper.current.updateWorldMatrix(true, true);
      onReady?.(wrapper.current);
    });

    // cleanup on unmount/dep change
    return () => {
      if (wrapper.current && childRef.current) {
        disposeObject3D(childRef.current);
        wrapper.current.remove(childRef.current);
        childRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, url, shape]);

  // Re-tint when metal changes
  useEffect(() => {
    if (!childRef.current) return;
    tintMetal(childRef.current, metal);
  }, [metal]);

  // Rescale when carat/shape changes
  useEffect(() => {
    const child = childRef.current;
    if (!child) return;
    const xz = computeHeadXZ(shape, carat);
    const y = baseYScaleRef.current * HEAD_BASE_SCALE_Y;
    child.scale.set(xz, y, xz);
    child.updateMatrixWorld(true);
  }, [carat, shape]);

  return <group ref={wrapper} />;
}

// Preload GLBs
(Object.values(HEAD_TO_SRC) as string[]).forEach((p) => useGLTF.preload(p));
