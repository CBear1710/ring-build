/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useConfigStore } from "@/store/configurator";
import { resolveEngravingFontUrlAsync } from "@/lib/engraving-fonts";

/** copy only world position + rotation (ignore scale) */
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

type Props = { anchor?: THREE.Object3D | null };

// Cast to allow Troika-only props like curveRadius, suspend
const TroikaText = Text as unknown as React.FC<any>;

export default function EngravingModel({ anchor }: Props) {
  const text          = useConfigStore((s) => s.engravingText) || "";
  const fontEnum      = useConfigStore((s) => s.engravingFont);
  const fontOverride  = useConfigStore((s) => s.engravingFontUrl);
  const sizeMM        = useConfigStore((s) => s.engravingSize || 1.6);
  const letterSpacing = useConfigStore((s) => s.engravingLetterSpacing || 0.02);
  const color         = useConfigStore((s) => s.engravingColor || "#222222");
  const opacity       = useConfigStore((s) => s.engravingOpacity ?? 1);
  const side          = useConfigStore((s) => s.engravingSide || "inner");
  const offsetAngle   = useConfigStore((s) => s.engravingOffsetX || 0);

  const [fontUrl, setFontUrl] = useState<string | null>(null);

  // Resolve + precheck the URL once inputs change
  useEffect(() => {
    let alive = true;
    (async () => {
      const url = await resolveEngravingFontUrlAsync(fontEnum, fontOverride);
      if (alive) setFontUrl(url);
    })();
    return () => { alive = false; };
  }, [fontEnum, fontOverride]);

  const group = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  useLayoutEffect(() => {
    const g = group.current;
    if (!g || !anchor) return;

    // hide the placeholder anchor mesh (e.g., "Cylinder")
    const mesh = anchor as THREE.Mesh;
    mesh.visible = false;

    copyWorldPR(anchor, g);
    g.rotation.x = side === "inner" ? Math.PI : 0;

    // Nudge slightly along +Z to avoid z-fighting
    const fw = new THREE.Vector3(0, 0, 1).applyQuaternion(
      anchor.getWorldQuaternion(new THREE.Quaternion())
    );
    g.position.add(fw.multiplyScalar(side === "inner" ? -0.002 : 0.002));

    g.updateMatrixWorld(true);
    invalidate();
  }, [anchor, side, invalidate]);

  // derive curve radius from anchor bounds
  const curveRadius = useMemo(() => {
    if (!anchor) return side === "inner" ? -0.9 : 0.9;
    const box = new THREE.Box3().setFromObject(anchor);
    const size = new THREE.Vector3();
    box.getSize(size);
    const r = Math.max(size.x, size.z) * 0.5;
    return side === "inner" ? -Math.max(0.001, r) : Math.max(0.001, r);
  }, [anchor, side]);

  // Don’t render text until we have both a message and a resolved URL
  if (!text || !fontUrl) return <group ref={group} />;

  const fontSize = sizeMM * 0.05;

  return (
    <group ref={group}>
      <TroikaText
        suspend={false}                 // prevents React Suspense blanking the scene
        font={fontUrl}
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        curveRadius={curveRadius}
        rotation={[0, offsetAngle, 0]}
        anchorX="center"
        anchorY="middle"
      >
        {text}
        <meshStandardMaterial
          roughness={0.35}
          metalness={0.2}
          color={color}
          transparent={opacity < 1}
          opacity={opacity}
          toneMapped
        />
      </TroikaText>
    </group>
  );
}
