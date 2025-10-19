/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";

export function fitToBox(object: THREE.Object3D, targetSize = 1) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetSize / maxDim;

  object.scale.setScalar(scale);

  const center = new THREE.Vector3();
  box.getCenter(center);
  object.position.sub(center.multiplyScalar(scale));
}

export function centerOnlyForNewModel(
  object3d: THREE.Object3D,
  controls: any,
  camera: THREE.PerspectiveCamera,
  savedRadius: number | null
) {
  const box = new THREE.Box3().setFromObject(object3d);
  if (box.isEmpty()) return;

  const center = new THREE.Vector3();
  box.getCenter(center);

  const curRadius = camera.position.distanceTo(controls?.target ?? center);
  const keepRadius = savedRadius ?? curRadius;

  const dir = camera.position.clone().sub(controls?.target ?? center).normalize();
  const newPos = center.clone().add(dir.multiplyScalar(keepRadius));

  camera.position.copy(newPos);
  if (controls?.target) controls.target.copy(center);
  camera.updateProjectionMatrix();
  controls?.update?.();
}
