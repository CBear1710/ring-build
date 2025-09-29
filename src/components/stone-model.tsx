/* eslint-disable prefer-const */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Group, Mesh, Object3D } from "three";
import { GLTFLoader, OBJLoader } from "three-stdlib";
import { createPortal, useThree } from "@react-three/fiber";
import { MeshRefractionMaterial } from "@react-three/drei";


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

const TEMPLATE_BASE: Record<
  ShapeKey,
  { base: [number, number, number]; pos: [number, number, number] }
> = {
  round:    { base: [2.40, 2.40, 2.40], pos: [0, 0.80, 0] },
  princess: { base: [1.03, 1.03, 1.00], pos: [0, 0.80, 0] },
  cushion:  { base: [0.90, 1.05, 0.90], pos: [0, 0.80, 0] },
  oval:     { base: [0.85, 1.05, 1.10], pos: [0, 1.00, 0] },
  radiant:  { base: [1.75, 1.85, 1.80], pos: [0, 0.80, 0] },
  pear:     { base: [0.95, 0.85, 1.00], pos: [0, 1.05, -0.6] },
  emerald:  { base: [1.05, 0.95, 1.00], pos: [0, 0.80, 0] },
  marquise: { base: [1.05, 1.05, 0.90], pos: [0, 1.10, 0] },
  heart:    { base: [0.85, 0.85, 0.80], pos: [0, 1.10, -0.6] },
  asscher:  { base: [0.83, 0.83, 0.90], pos: [0, 0.80, 0] },
};


const CARAT_STEP_SIZE = 0.25;
const CARAT_MIN = 0.25;
const STEP_GAIN = 0.03; 

function quantizeCarat(carat: number) {
  const q = Math.round(carat / CARAT_STEP_SIZE) * CARAT_STEP_SIZE;
  return Math.max(CARAT_MIN, Number(q.toFixed(2)));
}

function gainFromCaratDiscrete(carat: number) {
  const q = quantizeCarat(carat);
  const stepsFrom1 = Math.round((q - 1.0) / CARAT_STEP_SIZE);
  return stepsFrom1 * STEP_GAIN;
}


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

function applyTemplateSizing(content: Object3D, shape: ShapeKey, carat: number) {
  const { base, pos } = TEMPLATE_BASE[shape];
  const r = gainFromCaratDiscrete(carat); 
  const [bx, by, bz] = base;
  content.scale.set(bx + r, by, bz + r);
  content.position.set(pos[0], pos[1], pos[2]);
  content.updateMatrixWorld(true);
}

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

  useEffect(() => {
    if (!wrapper.current) return;
    let aborted = false;

    if (contentRef.current) {
      wrapper.current.remove(contentRef.current);
      contentRef.current = null;
      setMeshes([]);
    }

    const applyLoaded = (loadedRoot: Object3D) => {
      if (aborted || !wrapper.current) return;

      const loaded = loadedRoot.clone(true);
      loaded.traverse((o) => (o.matrixAutoUpdate = true));

      const content = new THREE.Group();
      content.name = "StoneContent";
      content.add(loaded);
      content.layers.enable(1);
      wrapper.current.add(content);
      contentRef.current = content;

      const list: Mesh[] = [];
      content.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.castShadow = false;
          m.receiveShadow = false;
          m.layers.enable(1);
          list.push(m);
        }
      });
      setMeshes(list);

      normalizeStoneToGirdle(content);
      applyTemplateSizing(content, shape, carat);
    };

    const isGLB = url.toLowerCase().endsWith(".glb");
    if (isGLB) {
      new GLTFLoader().load(url, (gltf) => {
        applyLoaded((gltf.scene || gltf.scenes?.[0] || new THREE.Group()) as Object3D);
      });
    } else {
      new OBJLoader().load(url, (obj) => applyLoaded(obj));
    }

    return () => {
      aborted = true;
    };
  }, [url, shape, carat]); 

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    applyTemplateSizing(content, shape, carat);
  }, [carat, shape]);

  const envTex = scene.environment as THREE.Texture | null;

  return (
    <>
      <group ref={wrapper} />
      {envTex &&
        meshes.map((mesh) => (
          <React.Fragment key={mesh.uuid}>
            {createPortal(
              <MeshRefractionMaterial
                envMap={envTex}
                ior={2.44}
                bounces={5}
                aberrationStrength={0.01}
                fresnel={0.05}
                color="#d9e7ff"
                toneMapped
                fastChroma={false}
              />,
              mesh
            )}
          </React.Fragment>
        ))}
    </>
  );
}
