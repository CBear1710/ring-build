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
    const dir = camera.position.clone().sub(controls.target || new THREE.Vector3()).normalize();
    const newPos = target.clone().add(dir.multiplyScalar(dist));

    persp.near = Math.max(0.01, dist / 100);
    persp.far = dist * 10;
    camera.position.copy(newPos);
    persp.updateProjectionMatrix();

    controls.target.copy(target);
    controls.minDistance = dist * 0.7;
    controls.maxDistance = dist * 1.0;
    controls.update?.();

    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupRef, controlsRef, size.width, size.height, ...deps]);
}

function StoneOnlyLights() {
  const L = 5.5; 
  const Y = 6.0; 
  const INT = 3.0;
  const common = { distance: 20, decay: 2 } as const;

  return (
    <>
      <pointLight position={[ L,  Y,  0 ]} intensity={INT}   color="#ffc88a" {...common} onUpdate={(o)=>o.layers.set(1)} />
      <pointLight position={[ 0,  Y,  L ]} intensity={INT}   color="#9bc8ff" {...common} onUpdate={(o)=>o.layers.set(1)} />
      <pointLight position={[-L,  Y,  0 ]} intensity={INT}   color="#9fffe7" {...common} onUpdate={(o)=>o.layers.set(1)} />
      <pointLight position={[ 0,  Y, -L ]} intensity={INT}   color="#ff9ad7" {...common} onUpdate={(o)=>o.layers.set(1)} />
      <spotLight  position={[  6,  9,  4 ]} intensity={3.4}  color="#ffd7a1" angle={0.7} penumbra={0.6} onUpdate={(o)=>o.layers.set(1)} />
      <pointLight position={[ 0, 10,  0 ]} intensity={1.2}  color="#ffffff" {...common} onUpdate={(o)=>o.layers.set(1)} />
    </>
  );
}

function SceneContent() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);

  const controlsRef = useRef<any>(null);

  const refRoot = useLoader(OBJLoader, "/models/ring_4.obj");

  
  const shankG = useRef<THREE.Group | null>(null);
  const headG  = useRef<THREE.Group | null>(null);
  const stoneG = useRef<THREE.Group | null>(null);
  const ringGroup = useRef<THREE.Group | null>(null);

  useAutoFrame(ringGroup, controlsRef, [style, shape]);

  const anchors = useMemo(() => ({
    shankA: findByName(refRoot, "ANCHOR_SHANK"),
    headA:  findByName(refRoot, "ANCHOR_HEAD"),
    stoneA: findByName(refRoot, "ANCHOR_STONE"),
  }), [refRoot]);

  const { invalidate, camera } = useThree();

  useEffect(() => {
    camera.layers.enable(1);
  }, [camera]);

  useEffect(() => {
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
    invalidate();
  }, [anchors, style, shape, invalidate]); 

  return (
    <>
      <primitive object={refRoot} visible={false} />

      <group ref={ringGroup}>
        <group ref={shankG}><ShankModel style={style as any} metal={metal as any} /></group>
        <group ref={headG}><HeadModel shape={shape as any} carat={carat} metal={metal as any} /></group>
        <group ref={stoneG}><StoneModel shape={shape as any} carat={carat} /></group>
      </group>

      <Environment files="/hdrs/metal3.hdr" background={false} />

      <StoneOnlyLights />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={0.2}
        maxDistance={10}
        zoomSpeed={0.9}
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
