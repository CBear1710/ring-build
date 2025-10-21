/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { OBJLoader } from "three-stdlib";

import EngravingModel from "@/components/engraving-model";
import HeadModel from "@/components/head-model";
import ShankModel from "@/components/shank-model";
import StoneModel from "@/components/stone-model";
import ViewAnimator from "@/components/view-animator";
import { useView } from "@/components/view-context";
import { useConfigStore } from "@/store/configurator";

function findByName(root: THREE.Object3D, name: string) {
  let hit: THREE.Object3D | null = null;
  root.traverse((o) => {
    if (o.name === name) hit = o;
  });
  return hit;
}

function isMesh(o: any): o is THREE.Mesh {
  return !!o && o.isMesh === true;
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
  const centerWorld = new THREE.Vector3();
  box.getCenter(centerWorld);
  const q = new THREE.Quaternion();
  headG.getWorldQuaternion(q);
  stoneG.position.copy(centerWorld);
  stoneG.quaternion.copy(q);
  stoneG.scale.set(1, 1, 1);
  stoneG.updateMatrixWorld(true);
}

function useAutoFrame(
  groupRef: React.RefObject<THREE.Group | null>,
  controlsRef: React.RefObject<any>,
  deps: unknown[],
  padding = 1.15
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
    const vFov = (persp.fov * Math.PI) / 180;
    const aspect = (size.width || 1) / Math.max(1, size.height || 1);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const radiusFit = Math.max(1e-4, sphere.radius) * padding;
    const distV = radiusFit / Math.tan(vFov / 2);
    const distH = radiusFit / Math.tan(hFov / 2);
    const fitDist = Math.max(distV, distH);

    const newTarget = sphere.center.clone();

    const currentTarget = controls.target.clone();
    const curRadius = camera.position.distanceTo(currentTarget);
    const rawKeep = isFinite(curRadius) && curRadius > 0 ? curRadius : fitDist;

    const minR = fitDist * 0.8;
    const maxR = fitDist * 1.2;
    const keepRadius = THREE.MathUtils.clamp(rawKeep, minR, maxR);

    const dir0 = camera.position.clone().sub(currentTarget);
    const dir =
      dir0.lengthSq() > 1e-8 ? dir0.normalize() : new THREE.Vector3(0, 0, 1);
    const newPos = newTarget.clone().add(dir.multiplyScalar(keepRadius));

    camera.position.copy(newPos);
    controls.target.copy(newTarget);

    controls.minDistance = minR;
    controls.maxDistance = maxR;

    persp.near = Math.max(0.005, keepRadius / 600);
    persp.far = Math.max(persp.near + 1, keepRadius * 300);
    persp.updateProjectionMatrix();

    controls.update?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupRef, controlsRef, size.width, size.height, ...deps]);
}

function SceneContent() {
  const style = useConfigStore((s) => s.style);
  const metal = useConfigStore((s) => s.metal);
  const shape = useConfigStore((s) => s.shape);
  const carat = useConfigStore((s) => s.carat);
  const engravingText = useConfigStore((s) => s.engravingText);

  const controlsRef = useRef<any>(null);
  const refRoot = useLoader(OBJLoader, "/models/ring_4.obj");

  const ringGroup = useRef<THREE.Group | null>(null);
  const shankG = useRef<THREE.Group | null>(null);
  const headG = useRef<THREE.Group | null>(null);
  const stoneG = useRef<THREE.Group | null>(null);

  const { setControls } = useView();
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onStart = () => {
      gl.setPixelRatio(0.75);
      invalidate();
    };
    const onChange = () => invalidate();
    const onEnd = () => {
      gl.setPixelRatio(window.devicePixelRatio);
      invalidate();
    };

    controls.addEventListener("start", onStart);
    controls.addEventListener("change", onChange);
    controls.addEventListener("end", onEnd);

    return () => {
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("change", onChange);
      controls.removeEventListener("end", onEnd);
    };
  }, [gl, invalidate]);

  useEffect(() => {
    setControls(controlsRef.current);
    return () => setControls(null);
  }, [setControls]);

  const anchors = useMemo(
    () => ({
      shankA: findByName(refRoot, "ANCHOR_SHANK"),
      headA: findByName(refRoot, "ANCHOR_HEAD"),
      stoneA: findByName(refRoot, "ANCHOR_STONE"),
    }),
    [refRoot]
  );

  const cylinderMesh = useMemo(() => {
    let hit: THREE.Mesh | null = null;
    refRoot.traverse((o) => {
      if (!hit && isMesh(o) && o.name === "Cylinder") {
        (o as THREE.Object3D).visible = false;
        hit = o as THREE.Mesh;
      }
    });
    return hit;
  }, [refRoot]);

  const [layoutTick, setLayoutTick] = useState(0);
  useLayoutEffect(() => {
    if (anchors.shankA && shankG.current)
      copyWorldPR(anchors.shankA, shankG.current);
    if (anchors.headA && headG.current)
      copyWorldPR(anchors.headA, headG.current);

    if (stoneG.current) {
      if (anchors.stoneA) {
        copyWorldPR(anchors.stoneA, stoneG.current);
      } else if (headG.current) {
        copyWorldPR(headG.current, stoneG.current);
        requestAnimationFrame(() => {
          if (headG.current && stoneG.current)
            snapStoneToHead(headG.current, stoneG.current);
        });
      }
    }
    setLayoutTick((t) => t + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchors, style, shape]);

  useAutoFrame(ringGroup, controlsRef, [style, shape, layoutTick], 1.15);

  return (
    <>
      <primitive object={refRoot} visible={false} />

      <group ref={ringGroup}>
        <group ref={shankG}>
          <ShankModel style={style as any} metal={metal as any} />
          {engravingText ? (
            <Suspense fallback={null}>
              <EngravingModel sourceMesh={cylinderMesh ?? null} />
            </Suspense>
          ) : null}
        </group>

        <group ref={headG}>
          <HeadModel shape={shape as any} carat={carat} metal={metal as any} />
        </group>

        <group ref={stoneG} >
          <StoneModel shape={shape as any} carat={carat} />
        </group>
      </group>

      <Environment files="/hdrs/metal3.hdr" background={false} blur={0.2} />

      <ViewAnimator />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        zoomSpeed={0.9}
      />
    </>
  );
}

export default function ThreeViewer() {
  return (
    <div className="relative w-full h-[485px] md:h-full md:max-h-[680px] cursor-pointer">
      <Canvas
        frameloop="demand"
        shadows={false}
        dpr={[1, 2]}
        camera={{ position: [0, 0.9, 2.4], fov: 35, near: 0.05, far: 300 }}
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
