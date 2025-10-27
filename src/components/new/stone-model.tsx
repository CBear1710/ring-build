/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { disposeObject3D } from "@/lib/utils/three-dispose";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Group, Material, Mesh, Object3D } from "three";
import { GLTFLoader, OBJLoader } from "three-stdlib";

// ----------------- MODEL SOURCES -----------------
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
};
type ShapeKey = keyof typeof SHAPE_TO_SRC;

// ----------------- POSITION & SCALE TEMPLATES -----------------
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

// ----------------- SCALING LOGIC -----------------
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

// ----------------- NORMALIZE / SIZING HELPERS -----------------
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
function applyTemplateSizing(
  content: Object3D,
  shape: ShapeKey,
  carat: number
) {
  const { base, pos } = TEMPLATE_BASE[shape];
  const r = gainFromCaratDiscrete(carat);
  const [bx, by, bz] = base;
  content.scale.set(bx + r, by, bz + r);
  content.position.set(pos[0], pos[1], pos[2]);
  content.updateMatrixWorld(true);
}

// ----------------- ENV/ANGLE CHECK -----------------
function useIsAngleMetalChrome() {
  const { gl } = useThree(); // Three.WebGLRenderer
  const [bad, setBad] = useState(false);

  useEffect(() => {
    const isChrome =
      /Chrome/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent);

    // Get actual WebGL context from renderer (correct API, correct type)
    const ctx =
      (gl.getContext?.() as
        | WebGL2RenderingContext
        | WebGLRenderingContext
        | null) ?? null;

    let rendererStr = "";
    if (ctx) {
      const ext = ctx.getExtension("WEBGL_debug_renderer_info") as any;
      if (ext) {
        try {
          rendererStr = ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string;
        } catch {
          /* ignore */
        }
      }
    }
    const angleMetal = /Apple.*Metal/i.test(rendererStr);
    setBad(isChrome && angleMetal);
  }, [gl]);

  return bad;
}

// ----------------- MAIN COMPONENT -----------------
export default function StoneModel({
  shape,
  carat,
}: {
  shape: ShapeKey;
  carat: number;
}) {
  const url = useMemo(() => SHAPE_TO_SRC[shape], [shape]);
  const { scene } = useThree();

  const wrapper = useRef<Group | null>(null);
  const contentRef = useRef<Object3D | null>(null);
  const [meshes, setMeshes] = useState<Mesh[]>([]);

  const envTex = scene.environment as THREE.Texture | null;
  const isAngleMetalChrome = useIsAngleMetalChrome();

  // Enable/disable refraction based on environment (Chrome + ANGLE/Metal => disable)
  const ENABLE_REFRACTION = !isAngleMetalChrome;

  // Shared Physical Material (transmission) for the stone
  const sharedPhysicalMat = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 0.6,
      roughness: 0.02,
      metalness: 0,
      ior: 2.44,
      specularIntensity: 1,
      attenuationColor: new THREE.Color("#d9e7ff"),
      attenuationDistance: 0.6,
      toneMapped: true,
      envMapIntensity: 1.0,
    });
    if (envTex) m.envMap = envTex;
    return m;
  }, [envTex]);

  // Load/reload stone when shape changes
  useEffect(() => {
    if (!wrapper.current) return;
    let aborted = false;

    // Clear old
    if (contentRef.current) {
      disposeObject3D(contentRef.current);
      wrapper.current.remove(contentRef.current);
      contentRef.current = null;
      setMeshes([]);
    }

    const applyLoaded = (loadedRoot: Object3D) => {
      if (aborted || !wrapper.current) return;

      const loaded = loadedRoot; // avoid clone(true) if not needed
      loaded.traverse((o) => ((o as any).matrixAutoUpdate = true));

      const content = new THREE.Group();
      content.name = "StoneContent";
      content.add(loaded);
      content.layers.enable(1);
      wrapper.current.add(content);
      contentRef.current = content;

      const list: Mesh[] = [];
      content.traverse((o) => {
        const mm = o as Mesh;
        if (mm.isMesh) {
          mm.castShadow = false;
          mm.receiveShadow = false;
          mm.layers.enable(1);
          list.push(mm);
        }
      });

      // Assign material: dispose old material (Material | Material[])
      list.forEach((mesh) => {
        const prev: Material | Material[] | undefined = mesh.material as any;
        if (Array.isArray(prev)) {
          prev.forEach((mat) => mat?.dispose?.());
        } else {
          prev?.dispose?.();
        }

        // In this version, use PhysicalMaterial for safety.
        // If really need refraction shader: create a single instance and share.
        mesh.material = sharedPhysicalMat;
      });

      setMeshes(list);

      normalizeStoneToGirdle(content);
      applyTemplateSizing(content, shape, carat);
    };

    const isGLB = url.toLowerCase().endsWith(".glb");
    if (isGLB) {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          applyLoaded(
            (gltf.scene || gltf.scenes?.[0] || new THREE.Group()) as Object3D
          );
        },
        undefined,
        () => {}
      );
    } else {
      const loader = new OBJLoader();
      loader.load(url, (obj) => applyLoaded(obj));
    }

    return () => {
      aborted = true;
      if (wrapper.current && contentRef.current) {
        disposeObject3D(contentRef.current);
        wrapper.current.remove(contentRef.current);
        contentRef.current = null;
        setMeshes([]);
      }
    };
  }, [url, shape, carat, ENABLE_REFRACTION, sharedPhysicalMat]);

  // Re-apply scale when carat changes
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    applyTemplateSizing(content, shape, carat);
  }, [carat, shape]);

  // Cleanup shared material when unmount
  useEffect(() => {
    return () => {
      sharedPhysicalMat?.dispose?.();
    };
  }, [sharedPhysicalMat]);

  return <group ref={wrapper} />;
}
