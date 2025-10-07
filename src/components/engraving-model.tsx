"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from "three";
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useConfigStore } from "@/store/configurator";

// match the template's defaults
const FIXED_ROTATION: [number, number, number] = [0, Math.PI, 0]; // El
const FIXED_SCALE: [number, number, number] = [-0.36, 0.33, 0.33]; // vl

// per-style position (k) pulled from the RingConfig template
const POS_BY_STYLE: Record<string, [number, number, number]> = {
  plain:       [0, 1.30, 0],
  wide_plain:  [0, 0.57, 0],
  cathedral:   [0, 0.57, 0],
  knife:       [0, 0.57, 0],       // "KNIFE-EDGE" in template
  split:       [0, 1.29, 0],
  twisted:     [0, 0.57, 0],
};

const MIRROR_X = true;   // safe default for inner-band UVs
const ROTATE_PI = false; // leave off unless text is upside-down in your asset

function makeEngravingTexture(
  text: string,
  fontFamily: string,
  maxAniso: number
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1100;
  canvas.height = 28;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // transparent bg so metal shows through
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const italic = /italic/i.test(fontFamily) ? "italic" : "normal";
  const family = fontFamily.replace(/italic/gi, "").trim() || "Arial";

  ctx.font = `${italic} 12px ${family}`;
  const totalWidth = ctx.measureText(text).width;
  let penX = (canvas.width - totalWidth) / 2;
  const midY = canvas.height / 2 - 6;

  for (const ch of text) {
    const w = ctx.measureText(ch).width;
    ctx.fillText(ch, penX, midY);
    penX += w;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(16, maxAniso);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  if (MIRROR_X) {
    tex.repeat.x = -1;
    tex.offset.x = 1;
  }
  if (ROTATE_PI) {
    tex.center.set(0.5, 0.5);
    tex.rotation = Math.PI;
  }

  tex.needsUpdate = true;
  return tex;
}

type Props = { sourceMesh: THREE.Mesh | null };

export default function EngravingModel({ sourceMesh }: Props) {
  const text = useConfigStore((s) => s.engravingText);
  const fontKey = useConfigStore((s) => s.engravingFont);
  const style = useConfigStore((s) => s.style);
  const { gl } = useThree();

  // enum -> browser font family
  const fontFamily = useMemo(() => {
    switch (fontKey) {
      case "regular": return "Segoe UI";
      case "italics": return "italic Segoe UI";
      case "script":  return "Brush Script MT, Segoe Script, cursive";
      case "roman":   return "Times New Roman, Times, serif";
      default:        return "Arial";
    }
  }, [fontKey]);

  // we only need the geometry from the OBJ’s Cylinder — placement is our own constants
  const cylGeo = useMemo(() => {
    return sourceMesh?.geometry as THREE.BufferGeometry | undefined;
  }, [sourceMesh]);

  // build texture
  const texture = useMemo(() => {
    if (!text) return null;
    const cap = gl.capabilities.getMaxAnisotropy?.() ?? 16;
    return makeEngravingTexture(text, fontFamily, cap);
  }, [text, fontFamily, gl]);

  if (!text || !cylGeo) return null;

  // style-specific position
  const pos = POS_BY_STYLE[style] ?? POS_BY_STYLE.plain;
  const rot = FIXED_ROTATION;
  const scl = FIXED_SCALE;

  return (
    <group position={pos as any} rotation={rot as any} scale={scl as any}>
      <mesh geometry={cylGeo} castShadow receiveShadow>
        <meshStandardMaterial
          map={texture ?? undefined}
          color="#ffffff"
          metalness={0}
          roughness={0.15}
          transparent
          alphaTest={0.05}
          side={THREE.DoubleSide}
          toneMapped
          emissive={"#ffffff"}
          emissiveIntensity={0.15}
        />
      </mesh>
    </group>
  );
}
