import * as THREE from "three";
/* eslint-disable @typescript-eslint/no-explicit-any */


function disposeMaterial(mat: THREE.Material | null | undefined) {
  if (!mat) return;
  // Dispose any textures referenced by the material
  Object.values(mat as unknown as Record<string, unknown>).forEach((v) => {
    const tex = v as THREE.Texture;
    if ((tex as any)?.isTexture) tex.dispose();
  });
  mat.dispose();
}

export function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj: THREE.Object3D) => {
    const mesh = obj as THREE.Mesh;
    if ((mesh as any)?.isMesh) {
      mesh.geometry?.dispose?.();

      const materials: Array<THREE.Material | null | undefined> = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((m: THREE.Material | null | undefined) => disposeMaterial(m));
    }
  });
}
