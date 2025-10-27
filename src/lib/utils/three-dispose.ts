import * as THREE from "three";

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((o: any) => {
    if (o?.isMesh) {
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats?.forEach((m) => {
        if (!m) return;
        // Dispose mọi texture user-owned trên material
        for (const k in m) {
          const v = (m as any)[k];
          if (v?.isTexture) v.dispose?.();
        }
        m.dispose?.();
      });
    }
  });
}
