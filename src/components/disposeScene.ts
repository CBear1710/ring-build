/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from "three";

export function disposeScene(obj: THREE.Object3D | null | undefined) {
  if (!obj) return;
  obj.traverse((node: any) => {
    if (node.geometry) {
      node.geometry.dispose?.();
    }
    if (node.material) {
      const mats = Array.isArray(node.material) ? node.material : [node.material];
      mats.forEach((m: THREE.Material) => {
        // clear textures
        for (const k in m) {
          const v = (m as any)[k];
          if (v && v.isTexture) v.dispose?.();
        }
        m.dispose?.();
      });
    }
  });
}
