"use client";

import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** Générateur pseudo-aléatoire déterministe : la poussière est la même à chaque visite. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Hauteur du volume dans lequel les grains tournent en boucle. */
const HEIGHT = 8;

const vertexShader = /* glsl */ `
  attribute float aScale;
  uniform float uTime;
  uniform float uScroll;
  uniform float uPixel;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Les grains montent lentement ; le scroll les fait filer, comme si on descendait.
    p.y = mod(p.y + uTime * 0.07 * (0.4 + aScale) + uScroll * 9.0 + ${(HEIGHT / 2).toFixed(1)}, ${HEIGHT.toFixed(1)}) - ${(HEIGHT / 2).toFixed(1)};
    p.x += sin(uTime * 0.25 + position.z * 1.7) * 0.18;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aScale * uPixel * 44.0 / -mv.z;
    float far = smoothstep(20.0, 7.0, -mv.z);
    float edge = smoothstep(${(HEIGHT / 2).toFixed(1)}, ${(HEIGHT / 2 - 1.2).toFixed(1)}, abs(p.y));
    vAlpha = far * edge * (0.3 + 0.6 * aScale);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(0.42, 0.14, 0.86, a * a * vAlpha);
  }
`;

/**
 * Poussière violette en suspension : des centaines de grains flous, plus gros
 * quand ils sont près de la caméra. Donne de la profondeur derrière et devant le modèle.
 */
export function Dust({ progress, still, count = 520 }: { progress?: MotionValue<number>; still: boolean; count?: number }) {
  const { positions, scales } = useMemo(() => {
    const r = rng(11);
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r() - 0.5) * 16;
      p[i * 3 + 1] = (r() - 0.5) * HEIGHT;
      p[i * 3 + 2] = -9 + r() * 13;
      s[i] = 0.25 + r() * r() * 0.75;
    }
    return { positions: p, scales: s };
  }, [count]);

  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uPixel: { value: 1 } }), []);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    if (!still) u.uTime.value += delta;
    u.uScroll.value = still || !progress ? 0 : progress.get();
    u.uPixel.value = state.viewport.dpr;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
