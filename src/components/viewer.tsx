"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";

import ShankModel from "@/components/shank-model";
import HeadModel from "@/components/head-model";
import StoneModel from "@/components/stone-model";
import { useConfigStore } from "@/store/configurator";

/* ----------------------------- helpers ---------------------------------- */

function findByName(root: THREE.Object3D, name: string) {
  let hit: THREE.Object3D | null = null;
  root.traverse((o) => {
    if (o.name === name) hit = o;
  });
  return hit;
}

/** Copy world position/rotation/scale from src -> dst (dst is a Group). */
function copyWorldTransform(src: THREE.Object3D, dst: THREE.Object3D) {
  src.updateWorldMatrix(true, true);
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  src.matrixWorld.decompose(p, q, s);
  dst.position.copy(p);
  dst.quaternion.copy(q);
  dst.scale.copy(s);
  dst.updateMatrixWorld(true);
}

/** Place stone at the head’s world bounding-box center, matching head rotation/scale. */
function snapStoneToHead(headG: THREE.Group, stoneG: THREE.Group) {
  headG.updateWorldMatrix(true, true);

  // 1) Get the head group's world-space bounding box center
  const box = new THREE.Box3().setFromObject(headG);
  const centerWorld = new THREE.Vector3();
  box.getCenter(centerWorld);

  // 2) Get head world rotation & scale
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  headG.getWorldQuaternion(q);
  headG.getWorldScale(s);

  // 3) Apply to stone group
  stoneG.position.copy(centerWorld);
  stoneG.quaternion.copy(q);
  stoneG.scale.copy(s);
  stoneG.updateMatrixWorld(true);
}

/**
 * Auto-frame the camera to fully see groupRef contents.
 * Fits BOTH width & height using perspective math.
 * controlsRef ensures we run AFTER OrbitControls is mounted.
 */
function useAutoFrame(
  groupRef: React.RefObject<THREE.Group>,
  controlsRef: React.RefObject<any>,
  deps: unknown[],
  padding = 1.2
) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const root = groupRef.current;
    const controls = controlsRef.current;
    if (!root || !camera || !controls) return;

    const box = new THREE.Box3().setFromObject(root);
    if (!isFinite(box.min.x) || box.isEmpty()) return;

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const persp = camera as THREE.PerspectiveCamera;
    const vFov = persp.fov * (Math.PI / 180);
    const aspect = (size.width || 1) / (size.height || 1);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const radius = sphere.radius * padding;
    const distV = radius / Math.tan(vFov / 2);
    const distH = radius / Math.tan(hFov / 2);
    const dist = Math.max(distV, distH);

    const target = sphere.center.clone();

    const dir = camera.position
      .clone()
      .sub(controls.target || new THREE.Vector3())
      .normalize();
    const newPos = target.clone().add(dir.multiplyScalar(dist));

    persp.near = Math.max(0.01, dist / 100);
    persp.far = dist * 10;
    camera.position.copy(newPos);
    persp.updateProjectionMatrix();

    controls.target.copy(target);
    controls.minDistance = dist * 1.0;
    controls.maxDistance = dist * 2.0;
    controls.update?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupRef, controlsRef, size.width, size.height, ...deps]);
}

/* ----------------------------- scene ------------------------------------ */

function SceneContent() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  const controlsRef = useRef<any>(null);

  // 1) Load reference layout (anchors) from ring_4.obj
  const refRoot = useLoader(OBJLoader, "/models/ring_4.obj");

  // 2) Groups for real parts
  const shankG = useRef<THREE.Group>(null!);
  const headG = useRef<THREE.Group>(null!);
  const stoneG = useRef<THREE.Group>(null!);

  // Parent group for auto-framing
  const ringGroup = useRef<THREE.Group>(null);

  // Auto-frame when style/shape change (and on mount). Include controlsRef.
  useAutoFrame(ringGroup, controlsRef, [style, shape, carat]);

  // 3) Find anchors once
  const anchors = useMemo(() => {
    return {
      shankA: findByName(refRoot, "ANCHOR_SHANK"),
      headA: findByName(refRoot, "ANCHOR_HEAD"),
      stoneA: findByName(refRoot, "ANCHOR_STONE"),
    };
  }, [refRoot]);

  // 4) Place shank/head/stone whenever anchors or selected options change
  useEffect(() => {
    // Shank
    if (anchors.shankA && shankG.current) {
      copyWorldTransform(anchors.shankA, shankG.current);
    }

    // Head
    if (anchors.headA && headG.current) {
      copyWorldTransform(anchors.headA, headG.current);
    }

    // Stone: prefer dedicated stone anchor; else snap to the head’s world bbox center
    if (stoneG.current) {
      if (anchors.stoneA) {
        copyWorldTransform(anchors.stoneA, stoneG.current);
      } else if (headG.current) {
        copyWorldTransform(headG.current, stoneG.current);
        requestAnimationFrame(() => {
          if (headG.current && stoneG.current) {
            snapStoneToHead(headG.current, stoneG.current);
          }
        });
      }
    }
  }, [anchors, style, shape, carat]); // include carat so stone tracks head growth

  return (
    <>
      {/* Keep the template hidden; it only supplies the anchors */}
      <primitive object={refRoot} visible={false} />

      {/* Everything inside ringGroup gets framed by the camera */}
      <group ref={ringGroup}>
        <group ref={shankG}>
          <ShankModel style={style as any} metal={metal as any} />
        </group>

        <group ref={headG}>
          <HeadModel shape={shape as any} carat={carat} metal={metal as any} />
        </group>

        <group ref={stoneG}>
          <StoneModel shape={shape as any} carat={carat} />
        </group>
      </group>

      <Environment files="/hdrs/metal3.hdr" background={false} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        // loose caps; precise limits are set by auto-frame
        minDistance={0.4}
        maxDistance={6}
        zoomSpeed={0.9}
      />
    </>
  );
}

/* ----------------------------- canvas wrapper --------------------------- */

export default function ThreeViewer() {
  return (
    <div className="relative w-full h-[80vh]">
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0.9, 2.4], fov: 35, near: 0.01, far: 50 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
