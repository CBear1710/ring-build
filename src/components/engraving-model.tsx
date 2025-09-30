"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { JSX, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Group, Mesh, BufferGeometry, BufferAttribute } from "three";
import { Text } from "@react-three/drei";
import { useConfigStore } from "@/store/configurator";

// Cast Text to any so we can pass curveRadius without TS complaining
const TextAny = Text as unknown as (props: any) => JSX.Element;

type Props = {
  shankRef: React.RefObject<Group | null>;
  inwardOffset?: number;          // how much to push text into the band (local Z-)
  textSize?: number;              // world units
  extraCurveTightness?: number;   // add to measured inner radius
  letterSpacing?: number;
};

export default function Engraving3D({
  shankRef,
  inwardOffset = -0.28,
  textSize = 1.05,
  extraCurveTightness = 0,
  letterSpacing = -0.01,
}: Props) {
  // Read engraving text/font the same way as before (with safe fallbacks)
  const engravingText = useConfigStore((s: any) =>
    typeof s?.engravingText === "string"
      ? s.engravingText
      : s?.engraving?.text
      ? String(s.engraving.text)
      : ""
  );

  const fontUrl = useConfigStore((s: any) => s?.engravingFontUrl || s?.engravingFont || "/fonts/Inter-Regular.woff");

  const text = useMemo(() => (engravingText || "").trim(), [engravingText]);
  const holder = useRef<Group | null>(null);

  // Measure an "inner radius" from the shank geometry to bend the text around
  const curveRadius = useMemo(() => {
    const parent = shankRef.current;
    if (!parent) return -(8.5 + extraCurveTightness); // fallback

    let minR = Infinity;
    const v = new THREE.Vector3();

    parent.traverse((o) => {
      const m = o as Mesh;
      const g = m?.geometry as BufferGeometry | undefined;
      const pos = g?.attributes?.position as BufferAttribute | undefined;
      if (!m?.isMesh || !pos) return;

      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        m.localToWorld(v);
        // sample near band mid-height to avoid prongs/heads
        if (v.y > -2.5 && v.y < 2.5) {
          const r = Math.hypot(v.x, v.z);
          if (r < minR) minR = r;
        }
      }
    });

    if (!isFinite(minR) || minR === Infinity) return -(8.5 + extraCurveTightness);
    const inner = Math.max(2.0, minR * 0.98);
    return -(inner + extraCurveTightness);
  }, [shankRef, extraCurveTightness]);

  // Nudge text slightly into the band
  useEffect(() => {
    if (!holder.current) return;
    holder.current.position.z += inwardOffset;
    holder.current.updateMatrixWorld(true);
  }, [inwardOffset]);

  if (!text) return null;

  const maxWidth = Math.abs(curveRadius) * Math.PI * 0.75;

  return (
    <group ref={holder} renderOrder={-10}>
      <TextAny
        font={fontUrl}
        fontSize={textSize}
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        letterSpacing={letterSpacing}
        maxWidth={maxWidth}
        curveRadius={curveRadius}
        color="#222222"
       
        material-polygonOffset
        material-polygonOffsetFactor={-2}
        material-polygonOffsetUnits={-2}
        material-metalness={0.15}
        material-roughness={0.9}
      >
        {text}
      </TextAny>
    </group>
  );
}
