/* eslint-disable react-hooks/rules-of-hooks */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from "three";
import React, { useMemo, useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useConfigStore } from "@/store/configurator";

type Props = { sourceMesh: THREE.Mesh | null };

const TEXT_CANVAS_WIDTH = 1100;
const TEXT_CANVAS_HEIGHT = 28;
const TEXT_CANVAS_SCALE = 2; 

const styleTextureRules: Record<
  string,
  { mirrorHorizontally: boolean; flipV?: boolean; verticalFill?: number; verticalCenter?: number }
> = {
  plain:       { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
  wide_plain:  { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
  cathedral:   { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
  knife:       { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
  split:       { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
  twisted:     { mirrorHorizontally: true,  verticalFill: 0.92, verticalCenter: 0.5 },
};

// Per-style vertical shift in the surface's local Y 
const verticalOffsetByStyle: Record<string, number> = {
  plain:      0.0,
  wide_plain: 1.2,
  cathedral:  0.3,
  knife:      1.1,
  split:      0.8,
  twisted:    0.6,
};


const VISIBILITY_MODE = "BRIGHT" as "BRIGHT" | "PRODUCTION";
const SHOW_DEBUG_WIREFRAME = false;

export default function EngravingModel({ sourceMesh }: Props) {
  const rootRef = useRef<THREE.Group>(null!);

  const engravingText = useConfigStore((s: any) => s.engravingText);
  const engravingFontKey = useConfigStore((s: any) => s.engravingFont);
  const style = useConfigStore((s: any) => s.style);

  const rules = styleTextureRules[style] ?? styleTextureRules.plain;
  const localYShift = verticalOffsetByStyle[style] ?? 0;

  const { gl } = useThree();

  // Follow the inner surface
  useFrame(() => {
    if (!rootRef.current || !sourceMesh) return;
    rootRef.current.matrixAutoUpdate = false;
    rootRef.current.matrix.copy(sourceMesh.matrixWorld);
    rootRef.current.matrix.decompose(
      rootRef.current.position,
      rootRef.current.quaternion,
      rootRef.current.scale
    );
    rootRef.current.matrixAutoUpdate = true;
  });

  const fontFamily = useMemo(() => {
    switch (engravingFontKey) {
      case "regular": return "Segoe UI";
      case "italics": return "italic Segoe UI";
      case "script":  return "Brush Script MT, Segoe Script, cursive";
      case "roman":   return "Times New Roman, Times, serif";
      default:        return "Arial";
    }
  }, [engravingFontKey]);

  const textTexture = useMemo(() => {
    if (!engravingText?.trim()) return null;

    const cw = TEXT_CANVAS_WIDTH * TEXT_CANVAS_SCALE;
    const ch = TEXT_CANVAS_HEIGHT * TEXT_CANVAS_SCALE;

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, cw, ch);

    // shadow halo for contrast on shiny metal
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 6 * TEXT_CANVAS_SCALE;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const italic = /italic/i.test(fontFamily) ? "italic" : "normal";
    const family = fontFamily.replace(/italic/gi, "").trim() || "Arial";
    const px = Math.round(13 * TEXT_CANVAS_SCALE); 
    ctx.font = `${italic} ${px}px ${family}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    ctx.lineWidth = 2 * TEXT_CANVAS_SCALE;
    ctx.strokeStyle = "rgba(0,0,0,0.9)";
    ctx.fillStyle = "white";

    const totalW = ctx.measureText(engravingText).width;
    let penX = (cw - totalW) / 2;
    const midY = ch / 2 - 6 * TEXT_CANVAS_SCALE;

    for (const chx of engravingText) {
      const w = ctx.measureText(chx).width;
      ctx.strokeText(chx, penX, midY);
      ctx.fillText(chx, penX, midY);
      penX += w;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy?.() ?? 8);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const vFill = rules.verticalFill ?? 0.92;
    const vCenter = rules.verticalCenter ?? 0.5;
    const vOffset = Math.max(0, Math.min(1 - vFill, vCenter - vFill / 2));

    const uRepeat = rules.mirrorHorizontally ? -1 : 1;
    const uOffset = rules.mirrorHorizontally ? 1 : 0;

    tex.repeat.set(uRepeat, rules.flipV ? -vFill : vFill);
    tex.offset.set(uOffset, rules.flipV ? 1 - vOffset - vFill : vOffset);

    tex.needsUpdate = true;
    return tex;
  }, [engravingText, fontFamily, gl, rules]);

  useEffect(() => () => textTexture?.dispose?.(), [textTexture]);

  if (!engravingText?.trim() || !sourceMesh?.geometry) return null;

  const edges = useMemo(
    () => (SHOW_DEBUG_WIREFRAME ? new THREE.EdgesGeometry(sourceMesh.geometry) : null),
    [sourceMesh.geometry]
  );
  useEffect(() => () => edges?.dispose(), [edges]);

  const isBright = VISIBILITY_MODE === "PRODUCTION";

  return (
    <group ref={rootRef}>
      <group position={[0, localYShift, 0]}>
        {SHOW_DEBUG_WIREFRAME && edges && (
          <lineSegments geometry={edges} renderOrder={998}>
            <lineBasicMaterial color="#00ff88" depthTest={false} />
          </lineSegments>
        )}

        <mesh geometry={sourceMesh.geometry} renderOrder={isBright ? 999 : 3}>
          {isBright ? (
            <meshBasicMaterial
              map={textTexture ?? undefined}
              transparent
              alphaTest={0.02}
              side={THREE.DoubleSide}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          ) : (
            <meshStandardMaterial
              map={textTexture ?? undefined}
              transparent
              alphaTest={0.02}
              color={"#ffffff"}
              metalness={0}
              roughness={0.2}
              side={THREE.BackSide}
              depthTest={true}
              depthWrite={false}
              emissive={"#ffffff"}
              emissiveIntensity={0.12}
              toneMapped
              polygonOffset
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
            />
          )}
        </mesh>
      </group>
    </group>
  );
}
