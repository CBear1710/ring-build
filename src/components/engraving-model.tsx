"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as THREE from "three";
import React, { useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useConfigStore } from "@/store/configurator";

const MIRROR_X = true;   
const ROTATE_PI = false; 

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
  const { gl } = useThree();

  const fontFamily = useMemo(() => {
    switch (fontKey) {
      case "regular": return "Segoe UI";
      case "italics": return "italic Segoe UI"; 
      case "script":  return "Brush Script MT, Segoe Script, cursive";
      case "roman":   return "Times New Roman, Times, serif";
      default:        return "Arial";
    }
  }, [fontKey]);

  const { cylGeo, pos, quat, scl } = useMemo(() => {
    if (!sourceMesh) return { cylGeo: null, pos: null, quat: null, scl: null } as any;
    sourceMesh.updateWorldMatrix(true, true);
    const mat = sourceMesh.matrixWorld.clone();
    const p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
    mat.decompose(p, q, s);
    return { cylGeo: sourceMesh.geometry as THREE.BufferGeometry, pos: p, quat: q, scl: s };
  }, [sourceMesh]);

  const texture = useMemo(() => {
    if (!text) return null;
    const cap = gl.capabilities.getMaxAnisotropy?.() ?? 16;
    return makeEngravingTexture(text, fontFamily, cap);
  }, [text, fontFamily, gl]);

  if (!text || !cylGeo || !pos || !quat || !scl) return null;

  return (
    <group position={pos} quaternion={quat} scale={scl}>
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
