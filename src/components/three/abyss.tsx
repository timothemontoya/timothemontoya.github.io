"use client";

import { useFrame } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

// Le plan couvre tout l'écran, quelle que soit la caméra : il est placé directement en coordonnées d'écran.
const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.999, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.03 + 17.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y);

    // L'eau : bleu profond près de la surface, noir vers le fond. Défiler, c'est descendre.
    vec3 surface = mix(vec3(0.035, 0.115, 0.185), vec3(0.016, 0.045, 0.085), uScroll);
    vec3 deep = vec3(0.012, 0.014, 0.020);
    vec3 col = mix(deep, surface, pow(uv.y, 1.5));

    // Rais de lumière qui tombent de la surface, en éventail depuis un point hors champ.
    vec2 d = p - vec2(0.66 * uAspect, 1.4);
    float ang = atan(d.x, -d.y);
    float sway = fbm(vec2(ang * 2.5, uTime * 0.045)) * 3.5;
    float rays = smoothstep(0.25, 1.0, sin(ang * 13.0 + sway + uTime * 0.07));
    rays += 0.55 * smoothstep(0.35, 1.0, sin(ang * 29.0 - sway * 1.4 - uTime * 0.05 + 1.7));
    rays *= smoothstep(1.9, 0.35, length(d)) * smoothstep(0.05, 0.6, uv.y);
    col += vec3(0.07, 0.19, 0.26) * rays * 0.42 * (1.0 - 0.65 * uScroll);

    // Nappes de courant, très lentes.
    float drift = fbm(p * vec2(1.6, 2.8) + vec2(uTime * 0.018, -uTime * 0.012));
    col += vec3(0.018, 0.05, 0.07) * (drift - 0.42) * 1.4;

    // Bords assombris, puis un tramage fixe pour éviter les bandes dans les dégradés sombres.
    col *= 1.0 - 0.6 * pow(length((uv - vec2(0.5, 0.55)) * vec2(1.0, 1.15)) * 1.2, 2.2);
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(max(col, 0.0), 1.0);
  }
`;

/**
 * Fond de l'accueil : une eau profonde, des rais de lumière qui tombent de la surface
 * et des courants lents. Pensé pour la raie manta ; il s'assombrit à mesure qu'on défile.
 */
export function Abyss({ progress, still }: { progress?: MotionValue<number>; still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uAspect: { value: 1.6 } }), []);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    if (!still) u.uTime.value += delta;
    u.uScroll.value = still || !progress ? 0 : progress.get();
    u.uAspect.value = state.size.width / state.size.height;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}
