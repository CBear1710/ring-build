/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MeshRefractionMaterial } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { BufferGeometry, Group, Material, Mesh, Object3D } from "three";
import { GLTFLoader, OBJLoader } from "three-stdlib";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

/* ----------------- MODEL SOURCES ----------------- */
const SHAPE_TO_SRC = {
  round: "/models/Rounds.glb",
  princess: "/models/princess.obj",
  cushion: "/models/cushion.obj",
  oval: "/models/oval.obj",
  radiant: "/models/radiant.obj",
  pear: "/models/pear.obj",
  emerald: "/models/emerald.obj",
  marquise: "/models/marquise.obj",
  heart: "/models/heart.obj",
  asscher: "/models/asscher.obj",
} as const;
type ShapeKey = keyof typeof SHAPE_TO_SRC;

/* ----------------- SHAPE SIZING ----------------- */
const TEMPLATE_BASE: Record<
  ShapeKey,
  { base: [number, number, number]; pos: [number, number, number] }
> = {
  round: { base: [2.4, 2.4, 2.4], pos: [0, 0.8, 0] },
  princess: { base: [1.03, 1.03, 1.0], pos: [0, 0.8, 0] },
  cushion: { base: [0.9, 1.05, 0.9], pos: [0, 0.8, 0] },
  oval: { base: [0.9, 1.2, 1.15], pos: [0, 1.0, 0] },
  radiant: { base: [1.75, 1.95, 1.9], pos: [-0.1, 0.8, 0] },
  pear: { base: [0.95, 0.85, 1.0], pos: [0, 1.05, -0.9] },
  emerald: { base: [1.05, 0.95, 1.1], pos: [0, 0.8, 0] },
  marquise: { base: [1.05, 1.05, 0.9], pos: [0, 1.1, 0] },
  heart: { base: [0.75, 0.95, 0.7], pos: [0, 1.2, -0.6] },
  asscher: { base: [0.83, 0.83, 0.9], pos: [0, 0.8, 0] },
};

/* ----------------- CARAT→SCALE ----------------- */
const CARAT_STEP_SIZE = 0.25;
const CARAT_MIN = 0.25;
const STEP_GAIN = 0.017;
function quantizeCarat(carat: number) {
  const q = Math.round(carat / CARAT_STEP_SIZE) * CARAT_STEP_SIZE;
  return Math.max(CARAT_MIN, Number(q.toFixed(2)));
}
function gainFromCaratDiscrete(carat: number) {
  const q = quantizeCarat(carat);
  const stepsFrom1 = Math.round((q - 1.0) / CARAT_STEP_SIZE);
  return stepsFrom1 * STEP_GAIN;
}

/* ----------------- HELPERS ----------------- */
function applyTemplateSizing(node: Object3D, shape: ShapeKey, carat: number) {
  const { base, pos } = TEMPLATE_BASE[shape];
  const r = gainFromCaratDiscrete(carat);
  const [bx, by, bz] = base;
  node.scale.set(bx + r, by, bz + r);
  node.position.set(pos[0], pos[1], pos[2]);
  node.updateMatrixWorld(true);
}

/* ----------------- ANGLE/Metal detection ----------------- */
function useIsAngleMetalChrome() {
  const { gl } = useThree();
  const [bad, setBad] = useState(false);
  useEffect(() => {
    const isChrome =
      /Chrome/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);
    const ctx =
      (gl.getContext?.() as WebGL2RenderingContext | WebGLRenderingContext | null) ?? null;
    let rendererStr = "";
    if (ctx) {
      const ext = ctx.getExtension("WEBGL_debug_renderer_info") as any;
      if (ext) {
        try {
          rendererStr = ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        } catch {}
      }
    }
    const angleMetal = /Apple.*Metal/i.test(rendererStr);
    setBad(isChrome && angleMetal);
  }, [gl]);
  return bad;
}

/* ----------------- VISUAL ----------------- */
const DIAMOND = {
  COLOR: "#d9e7ff",
  IOR: 2.44,
  BOUNCES: 4,
  ABERRATION: 0.01,
  FRESNEL: 0.05,
  TONE_MAPPED: true,
  FAST_CHROMA: false,
} as const;

const FALLBACK = {
  COLOR: "#d9e7ff",
  METALNESS: 0.05,
  ROUGHNESS: 0.12,
  ENVMAP_INTENSITY: 1.0,
} as const;

/* ----------------- MAIN ----------------- */
export default function StoneModel({
  shape,
  carat,
}: {
  shape: ShapeKey;
  carat: number;
}) {
  /* ——— fixed hook order starts ——— */
  const { scene } = useThree();                                   // 1
  const isAngleMetalChrome = useIsAngleMetalChrome();              // 2
  const wrapper = useRef<Group | null>(null);                      // 3
  const meshRef = useRef<Mesh | null>(null);                       // 4
  const [geom, setGeom] = useState<BufferGeometry | null>(null);   // 5

  const url = useMemo(() => SHAPE_TO_SRC[shape], [shape]);         // 6
  const envTex = scene.environment as THREE.Texture | null;        // 7
  const diamondColor = useMemo(() => new THREE.Color(DIAMOND.COLOR), []); // 8
  const fallbackMat = useMemo(                                     // 9
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(FALLBACK.COLOR),
        metalness: FALLBACK.METALNESS,
        roughness: FALLBACK.ROUGHNESS,
        envMap: envTex ?? null,
        envMapIntensity: FALLBACK.ENVMAP_INTENSITY,
      }),
    [envTex]
  );
  useEffect(() => () => fallbackMat.dispose(), [fallbackMat]);     // 10
  /* ——— fixed hook order ends ——— */

  const canRefract = !!envTex && !isAngleMetalChrome;

  // load & merge geometry (single indexed, centered, single draw range)
  useEffect(() => {
    let aborted = false;

    setGeom((g) => {
      g?.dispose?.();
      return null;
    });

    const applyLoaded = (root: Object3D) => {
      if (aborted) return;

      const geos: BufferGeometry[] = [];
      root.updateMatrixWorld(true);
      root.traverse((o) => {
        const m = o as Mesh;
        if ((m as any).isMesh && m.geometry) {
          const g = m.geometry.clone();
          g.applyMatrix4(m.matrixWorld);
          geos.push(g);
        }
      });

      let merged = BufferGeometryUtils.mergeGeometries(geos, false);
      geos.forEach((g) => g.dispose());

      if (!merged.getIndex()) merged = BufferGeometryUtils.mergeVertices(merged, 1e-4);
      merged.clearGroups();
      const index = merged.getIndex();
      const count = index ? index.count : merged.attributes.position.count;
      merged.setDrawRange(0, count);

      merged.computeBoundingBox();
      const center = new THREE.Vector3();
      merged.boundingBox!.getCenter(center);
      merged.translate(-center.x, -center.y, -center.z);
      merged.computeVertexNormals();

      setGeom(merged);
    };

    if (url.toLowerCase().endsWith(".glb")) {
      new GLTFLoader().load(
        url,
        (gltf) => applyLoaded((gltf.scene || gltf.scenes?.[0] || new THREE.Group()) as Object3D),
        undefined,
        () => {}
      );
    } else {
      new OBJLoader().load(url, (obj) => applyLoaded(obj));
    }

    return () => {
      aborted = true;
    };
  }, [url]);

  // apply sizing on wrapper (always runs; no early return)
  useEffect(() => {
    if (!wrapper.current) return;
    applyTemplateSizing(wrapper.current, shape, carat);
  }, [shape, carat]);

  // set mesh flags via ref (no hooks)
  const meshRefCb = (m: Mesh | null) => {
    meshRef.current = m;
    if (m) {
      m.frustumCulled = false;
      m.layers.enable(1);
    }
  };

  return (
    <group ref={wrapper}>
      {geom ? (
        <mesh ref={meshRefCb} geometry={geom}>
          {canRefract ? (
            <MeshRefractionMaterial
              envMap={envTex!}
              color={diamondColor}
              ior={DIAMOND.IOR}
              bounces={DIAMOND.BOUNCES}
              aberrationStrength={DIAMOND.ABERRATION}
              fresnel={DIAMOND.FRESNEL}
              toneMapped={DIAMOND.TONE_MAPPED}
              fastChroma={DIAMOND.FAST_CHROMA}
              transparent
            />
          ) : (
            <primitive object={fallbackMat} attach="material" />
          )}
        </mesh>
      ) : null}
    </group>
  );
}
