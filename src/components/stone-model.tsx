/* eslint-disable prefer-const */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Group, Mesh, Object3D, BufferGeometry, BufferAttribute } from "three";
import { GLTFLoader, OBJLoader } from "three-stdlib";

/** Shape ↔ file */
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

/** Typical 1ct girdle L×W in mm (tweak as needed) */
const SHAPE_1CT_MM: Record<ShapeKey, { L: number; W: number }> = {
  round:    { L: 6.50, W: 6.50 },
  princess: { L: 5.50, W: 5.50 },
  cushion:  { L: 6.00, W: 6.00 },
  oval:     { L: 8.00, W: 6.00 },
  radiant:  { L: 7.00, W: 5.50 },
  pear:     { L: 8.00, W: 5.50 },
  emerald:  { L: 7.00, W: 5.00 },
  marquise: { L:10.00, W: 5.00 },
  heart:    { L: 6.50, W: 6.50 },
  asscher:  { L: 5.50, W: 5.50 },
};

/** Carat → linear scaling (volume ~ carat ⇒ linear ~ cbrt(carat)) */
const caratToLinear = (carat: number) => Math.cbrt(Math.max(0.01, carat) / 1.0);

/** Girdle slice thickness as a fraction of bbox height (for robust X/Z measurement). */
const GIRDLE_BAND_FRAC = 0.18;

/** --- Y-axis controls for stones (XZ follows carat; Y mostly independent) --- */
const STONE_BASE_SCALE_Y = 1.0;
const STONE_Y_FOLLOW_XZ = 0.0;

/** --- Local seating offsets (in stone LOCAL units) --- */
const STONE_SEAT_Y_OFFSET_LOCAL: Partial<Record<ShapeKey, number>> = {
  round: 0.18,
  // pear: 0.12,
  // heart: 0.10,
};

/** Diamond-like physical material (flat facets + stronger color play) */
function diamondMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.002,        // sharper facets
    transmission: 1.0,
    ior: 2.42,
    thickness: 1.0,          // set dynamically to world height
    attenuationColor: new THREE.Color(0xeaf3ff),
    attenuationDistance: 10,
    specularIntensity: 1.2,  // a touch stronger
    specularColor: new THREE.Color(1, 1, 1),
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1.2,    // neutral env; color comes from our lights
    side: THREE.DoubleSide,
    flatShading: true,       // CRITICAL for crisp facets
    // pseudo-dispersion for added color under white/colored lights
    iridescence: 0.8,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [180, 900],
  });
}

/** Assign material + put stone on layer 1 so only colored lights affect it */
function setupStoneRendering(root: Object3D) {
  const mat = diamondMaterial();
  root.userData.diamondMaterial = mat;

  root.traverse((o) => {
    const m = o as Mesh;
    if (m.isMesh) {
      m.material = mat;
      m.castShadow = false;
      m.receiveShadow = false;
      m.layers.enable(1); // receive layer-1 lights
      (m.geometry as BufferGeometry)?.computeVertexNormals?.();
    }
  });

  // Also enable layer 1 on the container to be safe
  root.layers.enable(1);
}

/** Update material thickness from current stone world height */
function updateDiamondThickness(root: Object3D) {
  const mat = root.userData.diamondMaterial as THREE.MeshPhysicalMaterial | undefined;
  if (!mat) return;
  const bbox = new THREE.Box3().setFromObject(root);
  const h = Math.max(1e-6, bbox.max.y - bbox.min.y);
  mat.thickness = h * 0.85;
  mat.needsUpdate = true;
}

/** Center the stone by its girdle (world → parent-local) using the wrapper node. */
function normalizeStoneToGirdle(node: Object3D) {
  const bbox = new THREE.Box3().setFromObject(node);
  if (!isFinite(bbox.min.x) || bbox.isEmpty()) return;

  const centerW = new THREE.Vector3();
  bbox.getCenter(centerW);

  const parent = node.parent ?? node;
  const centerLocal = centerW.clone();
  parent.worldToLocal(centerLocal);

  node.position.sub(centerLocal);
  node.updateMatrixWorld(true);
}

/** Measure girdle width/depth in world units from a thin Y-slice around Y=0. */
function measureGirdleSlice(node: Object3D) {
  const bbox = new THREE.Box3().setFromObject(node);
  if (!isFinite(bbox.min.x) || bbox.isEmpty()) return { dx: 1, dz: 1, avg: 1 };
  const h = bbox.max.y - bbox.min.y;

  const band = Math.max(1e-6, h * GIRDLE_BAND_FRAC);
  const yMin = -band * 0.5;
  const yMax =  band * 0.5;

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  let found = false;
  const v = new THREE.Vector3();

  node.traverse((o) => {
    const mesh = o as Mesh;
    if (!mesh.isMesh) return;
    const pos = (mesh.geometry as BufferGeometry)?.attributes?.position as BufferAttribute | undefined;
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

  if (!found) {
    // Fallback to full bbox if slice is empty
    minX = bbox.min.x; maxX = bbox.max.x;
    minZ = bbox.min.z; maxZ = bbox.max.z;
  }

  const dx = Math.max(1e-6, maxX - minX);
  const dz = Math.max(1e-6, maxZ - minZ);
  return { dx, dz, avg: (dx + dz) * 0.5 };
}

/** Target L/W/avg in mm at the requested carat. */
function targetMmAtCarat(shape: ShapeKey, carat: number) {
  const capped = Math.min(carat, 1.5);
  const base = SHAPE_1CT_MM[shape];
  const f = caratToLinear(capped);
  return { L: base.L * f, W: base.W * f, avg: (base.L + base.W) * 0.5 * f };
}

export default function StoneModel({
  shape,
  carat,
}: {
  shape: ShapeKey;
  carat: number;
}) {
  const url = useMemo(() => SHAPE_TO_SRC[shape], [shape]);

  /** Wrapper shown in the scene */
  const wrapper = useRef<Group | null>(null);
  /** We control transforms on this content group (not on the raw GLB/OBJ) */
  const contentRef = useRef<Object3D | null>(null);

  // Per-instance calibration (no globals)
  const unitsPerMmRef = useRef<number | null>(null);

  // Keep original Y scale so height can be controlled independently
  const baseYScaleRef = useRef<number>(1);
  // Store unscaled girdle measurement for this shape at load time
  const baseGirdleAvgUnitsRef = useRef<number>(1);

  useEffect(() => {
    if (!wrapper.current) return;
    let aborted = false;

    // Remove previous content
    if (contentRef.current) {
      wrapper.current.remove(contentRef.current);
      contentRef.current = null;
    }

    const applyLoaded = (loadedRoot: Object3D) => {
      if (aborted || !wrapper.current) return;

      // Safe clone and enable auto-updates
      const loaded = loadedRoot.clone(true);
      loaded.traverse((o) => { o.matrixAutoUpdate = true; });

      // Container we control
      const content = new THREE.Group();
      content.name = "StoneContent";
      content.add(loaded);
      wrapper.current!.add(content);
      contentRef.current = content;

      // Diamond material & isolate to lighting layer 1
      setupStoneRendering(content);

      // Normalize: girdle → origin
      normalizeStoneToGirdle(content);

      // Record baseline Y
      baseYScaleRef.current = content.scale.y || 1;

      // Measure baseline girdle (units)
      const girdle0 = measureGirdleSlice(content);
      baseGirdleAvgUnitsRef.current = girdle0.avg;

      // Per-instance mm↔units calibration using this shape @ 1.0 ct
      const baselineAvgMm = targetMmAtCarat(shape, 1.0).avg;
      unitsPerMmRef.current = girdle0.avg / Math.max(1e-6, baselineAvgMm);

      // Local seating offset (per-shape)
      const yoff = STONE_SEAT_Y_OFFSET_LOCAL[shape] ?? 0;
      if (yoff) { content.position.y += yoff; content.updateMatrixWorld(true); }

      // Initial size for current carat + thickness
      sizeStone(content, shape, carat);
      updateDiamondThickness(content);
    };

    const isGLB = url.toLowerCase().endsWith(".glb");
    if (isGLB) {
      new GLTFLoader().load(url, (gltf) => {
        applyLoaded((gltf.scene || gltf.scenes?.[0] || new THREE.Group()) as Object3D);
      });
    } else {
      new OBJLoader().load(url, (obj) => applyLoaded(obj));
    }

    return () => { aborted = true; };
  }, [url, shape]); // not depending on carat

  // Re-size on carat/shape change
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    sizeStone(content, shape, carat);
    updateDiamondThickness(content);
  }, [carat, shape]);

  /** Set absolute scale so girdle avg matches the target; control Y separately. */
  const sizeStone = (content: Object3D, shp: ShapeKey, c: number) => {
    const baseAvgUnits = Math.max(1e-6, baseGirdleAvgUnitsRef.current);
    const upm = Math.max(1e-6, unitsPerMmRef.current ?? 1); // units per mm (per-instance)

    // Target avg in units = (target avg mm) * (units per mm)
    const targetAvgMm = targetMmAtCarat(shp, c).avg;
    const targetAvgUnits = targetAvgMm * upm;

    // Absolute X/Z factor to hit the target avg
    const sXZ = targetAvgUnits / baseAvgUnits;

    // Y scaling: blend toward sXZ and include a static Y boost
    const yFollow = THREE.MathUtils.lerp(1, sXZ, STONE_Y_FOLLOW_XZ);
    const sY = baseYScaleRef.current * STONE_BASE_SCALE_Y * yFollow;

    content.scale.set(sXZ, sY, sXZ);
    content.updateMatrixWorld(true);
  };

  return <group ref={wrapper} />;
}
