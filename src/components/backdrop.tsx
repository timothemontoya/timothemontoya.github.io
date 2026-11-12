"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/use-media";

/** Côté de la grille de « chaleur » (une case par bloc de l'écran, 64 × 64 au maximum). */
const GRID = 64;
/** Taille d'un bloc en pixels : une quarantaine de blocs en largeur, jamais moins de 56px. */
const cellSize = (width: number) => Math.max(56, Math.ceil(width / 40));

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
  uniform float uCell;
  uniform sampler2D uHeat;

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

  // Le décor en un point (pixels, origine en haut à gauche) : crème, avec des taches et des coulures
  // violettes réduites à quelques teintes et tramées.
  vec3 scene(vec2 q) {
    vec2 uv = q / uRes.y;
    uv.y += uScroll;
    vec2 warp = vec2(fbm(uv * 1.1 + vec2(0.0, uTime * 0.012)), fbm(uv * 1.1 + vec2(5.2, 1.3 - uTime * 0.01)));
    float stain = fbm(uv * 1.35 + warp * 1.6);
    // Coulures : le bruit est étiré vers le bas.
    float drip = fbm(vec2(uv.x * 7.0 + warp.x * 2.0, uv.y * 0.5 - uTime * 0.015));
    float v = smoothstep(0.50, 0.82, stain * 0.74 + drip * 0.34);

    float levels = 4.0;
    float vq = clamp(floor(v * levels + bayer4(q / 3.0)) / levels, 0.0, 1.0);

    vec3 col = vec3(0.957, 0.941, 0.906);
    col = mix(col, vec3(0.890, 0.835, 0.950), step(0.25, vq));
    col = mix(col, vec3(0.745, 0.560, 0.985), step(0.50, vq));
    col = mix(col, vec3(0.610, 0.240, 0.960), step(0.75, vq));
    col = mix(col, vec3(0.790, 0.130, 0.900), step(1.00, vq));
    return col;
  }

  float heat(vec2 cell) {
    return texture2D(uHeat, (cell + 0.5) / ${GRID.toFixed(1)}).r;
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
    vec2 ci = floor(p / uCell);

    // Un bloc « chaud » se soulève vers le haut à gauche. On cherche lequel recouvre ce pixel :
    // le sien, ou celui d'une case voisine à droite ou en dessous.
    float top = 0.0;
    vec2 q = p;
    vec2 tc = ci;
    for (int j = 0; j < 2; j++) {
      for (int i = 0; i < 2; i++) {
        vec2 c = ci + vec2(float(i), float(j));
        float h = heat(c);
        vec2 moved = p + h * uCell * vec2(0.24, 0.32);
        if (h > 0.03 && floor(moved / uCell) == c && h > top) {
          top = h;
          q = moved;
          tc = c;
        }
      }
    }

    vec3 col;
    if (top > 0.0) {
      // Dessus du bloc : le même décor en gros pixels, cerné d'un filet sombre.
      vec2 lp = q - tc * uCell;
      float sub = uCell / 6.0;
      col = scene(tc * uCell + (floor(lp / sub) + 0.5) * sub);
      col = mix(col, vec3(1.0), 0.12 * top);
      float edge = min(min(lp.x, lp.y), min(uCell - lp.x, uCell - lp.y));
      col = mix(vec3(0.16, 0.06, 0.32), col, smoothstep(0.0, 1.5, edge));
    } else if (heat(ci) > 0.03) {
      // Le vide laissé par le bloc : l'envers du décor, un quadrillage de simulation.
      vec2 lp = p - ci * uCell;
      float sub = uCell / 4.0;
      float wire = min(1.0, step(fract(lp.x / sub), 0.07) + step(fract(lp.y / sub), 0.07));
      col = mix(vec3(0.10, 0.04, 0.22), vec3(0.35, 0.80, 1.0), wire * 0.8);
    } else {
      col = scene(p);
    }

    // Grain fixe, pour le côté imprimé.
    col += (hash(floor(p)) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Field({ still }: { still: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const heat = useRef<Float32Array | null>(null);
  const ambient = useRef(0);

  const uniforms = useMemo(() => {
    const map = new THREE.DataTexture(new Uint8Array(GRID * GRID), GRID, GRID, THREE.RedFormat);
    map.magFilter = THREE.NearestFilter;
    map.minFilter = THREE.NearestFilter;
    map.needsUpdate = true;
    return {
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uCell: { value: 56 },
      uHeat: { value: map },
    };
  }, []);

  // La souris « chauffe » le bloc qu'elle survole, et parfois un voisin.
  useEffect(() => {
    if (still) return;
    const grid = (heat.current ??= new Float32Array(GRID * GRID));
    const onMove = (e: PointerEvent) => {
      const cell = cellSize(window.innerWidth);
      const cx = Math.floor(e.clientX / cell);
      const cy = Math.floor(e.clientY / cell);
      if (cx < 0 || cy < 0 || cx >= GRID || cy >= GRID) return;
      grid[cy * GRID + cx] = 1;
      const nx = cx + Math.round(Math.random() * 2 - 1);
      const ny = cy + Math.round(Math.random() * 2 - 1);
      if (Math.random() < 0.45 && nx >= 0 && ny >= 0 && nx < GRID && ny < GRID) grid[ny * GRID + nx] = Math.max(grid[ny * GRID + nx], 0.6);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    const dt = Math.min(0.05, delta);
    const { width, height } = state.size;
    const cell = cellSize(width);
    u.uRes.value.set(width, height);
    u.uDpr.value = state.viewport.dpr;
    u.uCell.value = cell;
    // Le décor suit la page, un peu moins vite qu'elle : il a l'air posé derrière.
    u.uScroll.value = (window.scrollY / height) * 0.35;
    if (still) return;
    u.uTime.value += dt;

    const grid = (heat.current ??= new Float32Array(GRID * GRID));
    // De temps en temps, un bloc se soulève tout seul quelque part à l'écran.
    if ((ambient.current += dt) > 0.9) {
      ambient.current = 0;
      const cx = Math.floor(Math.random() * Math.min(GRID, Math.ceil(width / cell)));
      const cy = Math.floor(Math.random() * Math.min(GRID, Math.ceil(height / cell)));
      grid[cy * GRID + cx] = Math.max(grid[cy * GRID + cx], 0.75);
    }
    const map = u.uHeat.value as THREE.DataTexture;
    const data = map.image.data as Uint8Array;
    const fade = Math.exp(-dt * 1.5);
    for (let i = 0; i < grid.length; i++) {
      grid[i] *= fade;
      // Courbe douce : le bloc sort vite et rentre lentement.
      data[i] = Math.round(255 * Math.sqrt(grid[i]));
    }
    map.needsUpdate = true;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

/**
 * Fond de tout le site : un papier crème taché de violet, tramé comme une impression,
 * dont les blocs se soulèvent au passage de la souris et laissent voir un quadrillage,
 * comme si le décor n'était qu'une simulation. Fixe derrière le contenu.
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
