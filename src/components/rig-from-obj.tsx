"use client";

import { PropsWithChildren, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { OBJLoader } from "three-stdlib"; // <- works with your setup

// 3 anchors to mark loading position 

export default function RigFromOBJ({
  url = "/models/ring_4.obj",
  normalize = false, // set true if your OBJ is in inconsistent units
  children,
}: PropsWithChildren<{ url?: string; normalize?: boolean }>) {
  const obj = useLoader(OBJLoader, url) as THREE.Group;

  // These groups receive transforms from the anchors.
  const shankGroup = useRef<THREE.Group>(null);
  const headGroup  = useRef<THREE.Group>(null);
  const stoneGroup = useRef<THREE.Group>(null);

  // Helper to copy TRS from a mesh to a group (world space)
  const applyWorldTRS = (
    from: THREE.Object3D,
    to?: THREE.Object3D | null,
  ) => {
    if (!from || !to) return;
    from.updateWorldMatrix(true, false);
    const m = from.matrixWorld.clone();

    // Decompose to TRS
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    m.decompose(p, q, s);

    to.position.copy(p);
    to.quaternion.copy(q);
    to.scale.copy(s);
  };

  // Normalize whole rig (optional)
  const normalizedRig = useMemo(() => {
    if (!normalize) return obj;
    const clone = obj.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3(); box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const target = 1; // unit size
    const s = target / maxDim;

    const center = new THREE.Vector3(); box.getCenter(center);
    clone.position.sub(center);
    clone.scale.setScalar(s);
    clone.updateMatrixWorld(true);
    return clone;
  }, [obj, normalize]);

  useEffect(() => {
    // Find anchors
    const root = normalizedRig;
    const anchorShank = root.getObjectByName("ANCHOR_SHANK");
    const anchorHead  = root.getObjectByName("ANCHOR_HEAD");
    const anchorStone = root.getObjectByName("ANCHOR_STONE");

    // Apply world TRS from anchors to our empty groups
    applyWorldTRS(anchorShank ?? root, shankGroup.current);
    applyWorldTRS(anchorHead  ?? root, headGroup.current);
    applyWorldTRS(anchorStone ?? root, stoneGroup.current);

    // Hide the rig guide in the scene (comment out to visualize for debugging)
    root.visible = false;
  }, [normalizedRig]);

  return (
    <group>
      {/* keep the hidden rig in scene so world matrices are valid */}
      <primitive object={normalizedRig} />

      {/* children will mount under these positioned groups */}
      <group ref={shankGroup}  name="RIG_SHANK" />
      <group ref={headGroup}   name="RIG_HEAD" />
      <group ref={stoneGroup}  name="RIG_STONE" />

      {/* We render children *after* the groups exist, so they can find them by name. */}
      {children}
    </group>
  );
}
