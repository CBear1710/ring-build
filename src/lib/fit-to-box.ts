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
