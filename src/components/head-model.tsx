/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  Object3D,
  BufferGeometry,
  BufferAttribute,
} from "three";
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

/** Polished, higher-saturation metal presets (closer to template) */
const METAL_TINT: Record<
  Metal,
  {
    color: [number, number, number];
    metalness: number;
    roughness: number;
    envMapIntensity: number;
  }
> = {
  white:    { color: [0.93, 0.95, 1.00], metalness: 1.0, roughness: 0.06, envMapIntensity: 1.35 },
  yellow:   { color: [0.83, 0.66, 0.22], metalness: 1.0, roughness: 0.08, envMapIntensity: 1.50 },
  rose:     { color: [0.82, 0.54, 0.50], metalness: 1.0, roughness: 0.08, envMapIntensity: 1.45 },
  platinum: { color: [0.90, 0.92, 0.95], metalness: 1.0, roughness: 0.05, envMapIntensity: 1.40 },
};

type AnyMetalMat = MeshStandardMaterial | MeshPhysicalMaterial;

function tintMetal(root: Object3D, metal: Metal) {
  const { color, roughness, metalness, envMapIntensity } = METAL_TINT[metal];
  root.traverse((o) => {
    const m = (o as Mesh).material as AnyMetalMat | AnyMetalMat[] | undefined;
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

// ── Carat → scale (applied to X/Z only so height stays constant) ──────────────
const CARAT_CAP = 1.5;
const CARAT_BASE = 0.5;
const CARAT_FACTOR = 0.92;
const caratToScale = (carat: number) =>
  Math.cbrt(Math.max(0.01, carat) / CARAT_BASE) * CARAT_FACTOR;

// Your current controls
const SEAT_ALPHA = -1.3;     // seat Y fraction (can be negative)
const HEAD_BASE_SCALE_XZ = 1.1; // baseline width/depth
const HEAD_BASE_SCALE_Y  = 1.0; // baseline height (independent of carat)

// Thin Y-slice thickness for asymmetric heads (fraction of bbox height)
const SEAT_BAND_FRAC = 0.2;

/** Original bbox-center normalization (keeps your existing seating behavior). */
function normalizeHeadToSeat_bbox(child: Object3D) {
  const box = new THREE.Box3().setFromObject(child);
  if (!isFinite(box.min.x) || box.isEmpty()) return;

  const centerW = new THREE.Vector3();
  box.getCenter(centerW);

  const h = box.max.y - box.min.y;
  const seatYW = box.min.y + SEAT_ALPHA * h; // raw (not clamped)

  // World-space point we want at parent's origin
  const seatWorld = new THREE.Vector3(centerW.x, seatYW, centerW.z);

  const parent = child.parent ?? child;
  const seatLocal = seatWorld.clone();
  parent.worldToLocal(seatLocal);

  child.position.sub(seatLocal);
  child.updateMatrixWorld(true);
}

/**
 * Slice-based centering for asymmetric heads (heart/pear):
 * - Use RAW seatY for seating height (unchanged vs your bbox version).
 * - Use a CLAMPED Y only to pick a slice for computing better X/Z center.
 */
function normalizeHeadToSeat_slice(child: Object3D) {
  const bbox = new THREE.Box3().setFromObject(child);
  if (!isFinite(bbox.min.x) || bbox.isEmpty()) return;

  const h = bbox.max.y - bbox.min.y;

  // RAW seat Y decides seating height
  const seatY_raw = bbox.min.y + SEAT_ALPHA * h;

  // Clamp ONLY for sampling a slice to compute X/Z center
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

  // Seat point uses RAW Y, but slice-derived X/Z
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
}: {
  shape: ShapeKey;
  carat: number;
  metal: Metal;
}) {
  const url = useMemo(() => HEAD_TO_SRC[shape], [shape]);
  const { scene } = useGLTF(url);

  const wrapper = useRef<Group | null>(null);
  const childRef = useRef<Object3D | null>(null);

  // Keep original Y scale so carat never changes height
  const baseYScaleRef = useRef<number>(1);

  // Rebuild on shape change
  useEffect(() => {
    if (!wrapper.current) return;

    if (childRef.current) {
      wrapper.current.remove(childRef.current);
      childRef.current = null;
    }

    const child = scene.clone(true);
    wrapper.current.add(child);
    childRef.current = child;

    // Shadows
    child.traverse((o) => {
      const mesh = o as Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    // Centering: slice for heart/pear; bbox for others
    if (shape === "heart" || shape === "pear") {
      normalizeHeadToSeat_slice(child);
    } else {
      normalizeHeadToSeat_bbox(child);
    }

    // Record base Y (used to keep height constant across carat changes)
    baseYScaleRef.current = child.scale.y || 1;

    // Tint
    tintMetal(child, metal);

    // Initial sizing: X/Z respond to carat; Y uses independent baseline
    const capped = Math.min(carat, CARAT_CAP);
    const xz = HEAD_BASE_SCALE_XZ * caratToScale(capped);
    const y = baseYScaleRef.current * HEAD_BASE_SCALE_Y;
    child.scale.set(xz, y, xz);
    child.updateMatrixWorld(true);
  }, [scene, url, shape]);

  // Re-tint on metal change
  useEffect(() => {
    if (!childRef.current) return;
    tintMetal(childRef.current, metal);
  }, [metal]);

  // Carat changes → X/Z only; Y fixed
  useEffect(() => {
    const child = childRef.current;
    if (!child) return;
    const capped = Math.min(carat, CARAT_CAP);
    const xz = HEAD_BASE_SCALE_XZ * caratToScale(capped);
    const y = baseYScaleRef.current * HEAD_BASE_SCALE_Y;
    child.scale.set(xz, y, xz);
    child.updateMatrixWorld(true);
  }, [carat]);

  return <group ref={wrapper} />;
}

(Object.values(HEAD_TO_SRC) as string[]).forEach((p) => useGLTF.preload(p));
