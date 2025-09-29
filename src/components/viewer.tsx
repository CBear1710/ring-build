"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Suspense, useEffect, useMemo, useRef, useLayoutEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";

import ShankModel from "@/components/shank-model";
import HeadModel from "@/components/head-model";
import StoneModel from "@/components/stone-model";
import { useConfigStore } from "@/store/configurator";
import { useView } from "@/components/view-context";

function findByName(root: THREE.Object3D, name: string) {
  let hit: THREE.Object3D | null = null;
  root.traverse((o) => { if (o.name === name) hit = o; });
  return hit;
}

function copyWorldPR(src: THREE.Object3D, dst: THREE.Object3D) {
  src.updateWorldMatrix(true, true);
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  src.matrixWorld.decompose(p, q, new THREE.Vector3());
  dst.position.copy(p);
  dst.quaternion.copy(q);
  dst.scale.set(1, 1, 1);
  dst.updateMatrixWorld(true);
}

function snapStoneToHead(headG: THREE.Group, stoneG: THREE.Group) {
  headG.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(headG);
  if (!isFinite(box.min.x) || box.isEmpty()) return;
  const centerWorld = new THREE.Vector3(); box.getCenter(centerWorld);
  const q = new THREE.Quaternion(); headG.getWorldQuaternion(q);
  stoneG.position.copy(centerWorld);
  stoneG.quaternion.copy(q);
  stoneG.scale.set(1, 1, 1);
  stoneG.updateMatrixWorld(true);
}

function useAutoFrame(
  groupRef: React.RefObject<THREE.Group | null>,
  controlsRef: React.RefObject<any>,
  deps: unknown[],
  padding = 1.2
) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const root = groupRef.current; const controls = controlsRef.current;
    if (!root || !camera || !controls) return;

    const box = new THREE.Box3().setFromObject(root);
    if (!isFinite(box.min.x) || box.isEmpty()) return;

    const sphere = new THREE.Sphere(); box.getBoundingSphere(sphere);

    const persp = camera as THREE.PerspectiveCamera;
    const vFov = persp.fov * (Math.PI / 180);
    const aspect = (size.width || 1) / (size.height || 1);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const radius = sphere.radius * padding;
    const distV = radius / Math.tan(vFov / 2);
    const distH = radius / Math.tan(hFov / 2);
    const dist = Math.max(distV, distH);

    const target = sphere.center.clone();
    const dir = camera.position.clone()
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

    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupRef, controlsRef, size.width, size.height, ...deps]);
}

/** Eased camera fly-to */
function animateCamera(
  camera: THREE.PerspectiveCamera,
  controls: any,
  toPos: THREE.Vector3,
  toTarget: THREE.Vector3,
  duration = 650,
  invalidate?: () => void
) {
  const fromPos = camera.position.clone();
  const fromTgt = controls.target.clone();
  const start = performance.now();
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);

  function tick(now: number) {
    const k = Math.min(1, (now - start) / duration);
    const e = ease(k);

    camera.position.set(
      THREE.MathUtils.lerp(fromPos.x, toPos.x, e),
      THREE.MathUtils.lerp(fromPos.y, toPos.y, e),
      THREE.MathUtils.lerp(fromPos.z, toPos.z, e)
    );
    controls.target.set(
      THREE.MathUtils.lerp(fromTgt.x, toTarget.x, e),
      THREE.MathUtils.lerp(fromTgt.y, toTarget.y, e),
      THREE.MathUtils.lerp(fromTgt.z, toTarget.z, e)
    );

    camera.updateProjectionMatrix();
    controls.update?.();
    invalidate?.();

    if (k < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/** Correct mapping for a typical three.js scene (Y up, camera starts at +Z) */
const VIEW_DIRS: Record<"top"|"side"|"front", THREE.Vector3> = {
  front: new THREE.Vector3(0, 0, 1), // look from +Z
  top:   new THREE.Vector3(0, 1, 0), // look from +Y
  side:  new THREE.Vector3(1, 0, 0), // look from +X (right side)
};

function goToNamedView(
  mode: "top" | "side" | "front",
  camera: THREE.PerspectiveCamera,
  controls: any,
  root: THREE.Object3D,
  invalidate?: () => void
) {
  const box = new THREE.Box3().setFromObject(root);
  if (!isFinite(box.min.x) || box.isEmpty()) return;

  const sphere = new THREE.Sphere(); box.getBoundingSphere(sphere);

  const vFov = camera.fov * (Math.PI / 180);
  const aspect = (camera as any).aspect || 1;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  const radius = sphere.radius * 1.2;
  const distV = radius / Math.tan(vFov / 2);
  const distH = radius / Math.tan(hFov / 2);
  const dist = Math.max(distV, distH);

  const tgt = sphere.center.clone();
  const dir = VIEW_DIRS[mode].clone().normalize();
  const pos = tgt.clone().add(dir.multiplyScalar(dist));

  animateCamera(camera, controls, pos, tgt, 650, invalidate);
}

function SceneContent() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  const { view, view360, setControls } = useView();

  const controlsRef = useRef<any>(null);
  const refRoot = useLoader(OBJLoader, "/models/ring_4.obj");

  const shankG = useRef<THREE.Group | null>(null);
  const headG  = useRef<THREE.Group | null>(null);
  const stoneG = useRef<THREE.Group | null>(null);
  const ringGroup = useRef<THREE.Group | null>(null);

  const { invalidate, camera } = useThree();

  useLayoutEffect(() => {
    camera.layers.enable(0);
    camera.layers.enable(1);
  }, [camera]);

  useEffect(() => {
    setControls(controlsRef.current);
    return () => setControls(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const anchors = useMemo(() => ({
    shankA: findByName(refRoot, "ANCHOR_SHANK"),
    headA:  findByName(refRoot, "ANCHOR_HEAD"),
    stoneA: findByName(refRoot, "ANCHOR_STONE"),
  }), [refRoot]);

  const [layoutTick, setLayoutTick] = useState(0);
  useLayoutEffect(() => {
    if (anchors.shankA && shankG.current) copyWorldPR(anchors.shankA, shankG.current);
    if (anchors.headA  && headG.current)  copyWorldPR(anchors.headA,  headG.current);

    if (stoneG.current) {
      if (anchors.stoneA) {
        copyWorldPR(anchors.stoneA, stoneG.current);
      } else if (headG.current) {
        copyWorldPR(headG.current, stoneG.current);
        requestAnimationFrame(() => {
          if (headG.current && stoneG.current) snapStoneToHead(headG.current, stoneG.current);
          requestAnimationFrame(() => {
            if (headG.current && stoneG.current) snapStoneToHead(headG.current, stoneG.current);
            invalidate();
          });
        });
      }
    }
    setLayoutTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchors, style, shape]);

  useAutoFrame(ringGroup, controlsRef, [style, shape, carat, layoutTick]);

  // Spin loop to work with frameloop="demand"
  useEffect(() => {
    const controls = controlsRef.current;
    let raf = 0;
    function loop() {
      if (!controls || !controls.autoRotate) return;
      controls.update?.();
      invalidate();
      raf = requestAnimationFrame(loop);
    }
    if (controls && view360) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
      raf = requestAnimationFrame(loop);
    } else if (controls) {
      controls.autoRotate = false;
    }
    return () => {
      if (raf)  cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view360]);

  // React to named view changes
  useEffect(() => {
    const controls = controlsRef.current;
    const root = ringGroup.current;
    if (!controls || !root) return;

    if (view === "top" || view === "side" || view === "front") {
      controls.autoRotate = false;
      goToNamedView(view, camera as THREE.PerspectiveCamera, controls, root, invalidate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, layoutTick]);

  return (
    <>
      <primitive object={refRoot} visible={false} />

      <group ref={ringGroup}>
        <group ref={shankG}><ShankModel style={style as any} metal={metal as any} /></group>
        <group ref={headG}><HeadModel shape={shape as any} carat={carat} metal={metal as any} /></group>
        <group ref={stoneG}><StoneModel shape={shape as any} carat={carat} /></group>
      </group>

      <Environment files="/hdrs/metal3.hdr" background={false} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.2}
        maxDistance={10}
        zoomSpeed={0.9}
        onChange={() => invalidate()}
      />
    </>
  );
}

export default function ThreeViewer() {
  return (
    <div className="relative w-full h-[80vh]">
      <Canvas
        shadows
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 0.9, 2.4], fov: 35, near: 0.01, far: 50 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
