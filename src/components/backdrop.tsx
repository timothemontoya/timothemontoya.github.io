"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/use-media";

/** Nombre de points gardés en mémoire pour la traînée d'encre de la souris. */
const TRAIL = 28;

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec2 uRes;
  uniform float uDpr;
  uniform float uTime;
  uniform float uScroll;
  uniform float uFocus;
  // Traînée de la souris : position (pixels) et force de chaque point, du plus récent au plus ancien.
  uniform vec3 uTrail[${TRAIL}];

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
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 17.0;
      a *= 0.5;
    }
    return v;
  }

  // Matrice de Bayer 4 × 4 : le seuil qui donne la trame du tramage.
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x / 2.0 + a.y * a.y * 0.75);
  }
  float bayer4(vec2 a) {
    return bayer2(0.5 * a) * 0.25 + bayer2(a);
  }

  void main() {
    // Position en pixels, origine en haut à gauche.
    vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
    vec2 uv = p / uRes.y;
    uv.y += uScroll;

    // Taches : un bruit fractal déformé par lui-même. Coulures : le même bruit étiré vers le bas.
    vec2 warp = vec2(fbm(uv * 1.1 + vec2(0.0, uTime * 0.012)), fbm(uv * 1.1 + vec2(5.2, 1.3 - uTime * 0.01)));
    float stain = fbm(uv * 1.35 + warp * 1.6);
    float drip = fbm(vec2(uv.x * 7.0 + warp.x * 2.0, uv.y * 0.5 - uTime * 0.015));
    float v = stain * 0.74 + drip * 0.34;

    // À l'accueil, une flaque se forme derrière le modèle 3D : il a l'air d'en sortir.
    vec2 pool = (p - vec2(uRes.x * 0.66, uRes.y * 0.47)) / uRes.y;
    v += uFocus * 0.13 * exp(-dot(pool, pool) * 5.0);

    // La souris remue l'encre : un trait fin qui fonce légèrement la tache puis s'évapore.
    // Le bruit le déforme à peine, pour qu'il reste fluide.
    float ink = 0.0;
    for (int i = 0; i < ${TRAIL}; i++) {
      vec2 d = (p - uTrail[i].xy) / uRes.y + (warp - 0.5) * 0.03;
      ink += uTrail[i].z * exp(-dot(d, d) * 900.0);
    }
    v += smoothstep(0.5, 5.0, ink) * 0.2;
    v = smoothstep(0.50, 0.82, v);

    // Réduction à quelques teintes, tramée.
    float levels = 4.0;
    float vq = clamp(floor(v * levels + bayer4(p / 3.0)) / levels, 0.0, 1.0);

    vec3 col = vec3(0.957, 0.941, 0.906);
    col = mix(col, vec3(0.890, 0.835, 0.950), step(0.25, vq));
    col = mix(col, vec3(0.745, 0.560, 0.985), step(0.50, vq));
    col = mix(col, vec3(0.610, 0.240, 0.960), step(0.75, vq));
    col = mix(col, vec3(0.790, 0.130, 0.900), step(1.00, vq));

    // Grain fixe, pour le côté imprimé.
    col += (hash(floor(p)) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Field({ still }: { still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uFocus: { value: 0 },
      uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3(-9999, -9999, 0)) },
    }),
    [],
  );

  // Dernière position connue de la souris (ou du doigt), en pixels.
  const pointer = useRef<{ x: number; y: number } | null>(null);
  // Pinceau : il suit la souris avec un peu de retard, ce qui arrondit les mouvements brusques.
  const brush = useRef<{ x: number; y: number } | null>(null);
  const head = useRef(0);
  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => (pointer.current = { x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const { width, height } = state.size;
    u.uRes.value.set(width, height);
    u.uDpr.value = state.viewport.dpr;
    // Le décor suit la page, un peu moins vite qu'elle : il a l'air posé derrière.
    u.uScroll.value = (window.scrollY / height) * 0.35;
    // La flaque derrière le modèle n'existe qu'en haut de la page d'accueil, sur grand écran.
    const home = window.location.pathname === "/" && width >= 768;
    u.uFocus.value = home ? Math.max(0, 1 - window.scrollY / (height * 0.9)) : 0;
    if (still) return;
    const dt = Math.min(0.05, delta);
    u.uTime.value += dt;

    // Traînée : chaque point s'efface vite ; le pinceau rattrape la souris en douceur et pose
    // un point tous les quelques pixels (le plus ancien est recyclé), d'où un trait continu.
    const trail = u.uTrail.value as THREE.Vector3[];
    const fade = Math.exp(-dt * 2.6);
    for (const point of trail) point.z *= fade;
    const at = pointer.current;
    if (at) {
      const b = (brush.current ??= { ...at });
      const k = 1 - Math.exp(-dt * 14);
      b.x += (at.x - b.x) * k;
      b.y += (at.y - b.y) * k;
      const last = trail[head.current];
      const gap = Math.hypot(b.x - last.x, b.y - last.y);
      if (gap > 9) {
        head.current = (head.current + 1) % TRAIL;
        // Plus le geste est rapide, plus le trait est léger : il ne fait plus de grosses flaques.
        trail[head.current].set(b.x, b.y, Math.min(1, 0.55 + 6 / gap));
      }
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * Fond de tout le site : un papier crème taché de violet, réduit à quelques teintes et tramé
 * comme une impression. Fixe derrière le contenu, il dérive très lentement, et la souris y
 * laisse un fin trait d'encre qui s'évapore.
 */
export function Backdrop() {
  const still = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas dpr={[1, 1.5]} flat gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}>
        <Field still={still} />
      </Canvas>
    </div>
  );
}
