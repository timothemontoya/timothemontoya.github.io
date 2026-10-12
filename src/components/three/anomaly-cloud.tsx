"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useInView } from "@/lib/use-in-view";
import { useReducedMotion } from "@/lib/use-media";
import { usePointer } from "@/lib/use-pointer";

/** Générateur pseudo-aléatoire déterministe : le nuage est identique au serveur et au client. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function gaussian(r: () => number) {
  return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());
}

/**
 * Reconstitution du nuage de mesures du projet : un amas dense de vibrations normales
 * et des anomalies dispersées, comme dans la visualisation d'origine.
 */
function Cloud({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = usePointer();

  const { normal, anomalies } = useMemo(() => {
    const r = rng(7);
    const n: number[] = [];
    for (let i = 0; i < 1400; i++) n.push(gaussian(r) * 0.42, gaussian(r) * 0.32, gaussian(r) * 0.42);
    const a: number[] = [];
    for (let i = 0; i < 160; i++) {
      const dir = new THREE.Vector3(gaussian(r), gaussian(r) * 0.8, gaussian(r)).normalize();
      const dist = 0.9 + r() * 1.3;
      a.push(dir.x * dist, dir.y * dist, dir.z * dist);
    }
    return { normal: new Float32Array(n), anomalies: new Float32Array(a) };
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const p = still ? { x: 0, y: 0 } : pointer.current;
    if (!still) g.rotation.y += delta * 0.12;
    easing.damp(g.rotation, "x", 0.35 - p.y * 0.3, 0.5, delta);
    easing.damp(g.position, "x", p.x * 0.15, 0.5, delta);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[normal, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.035} color="#c9d0ff" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[anomalies, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#ff7a3d" sizeAttenuation depthWrite={false} />
      </points>
      <gridHelper args={[4.4, 11, "#2a2a30", "#1a1a1f"]} position-y={-1.3} />
    </group>
  );
}

export function AnomalyCloud({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  const still = useReducedMotion();
  return (
    <div ref={ref} className="absolute inset-0" role="img" aria-label={label}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgb(139 124 246 / 0.16), transparent 70%), #08080a" }}
      />
      <Canvas frameloop={visible ? "always" : "never"} dpr={[1, 1.75]} camera={{ position: [0, 0.6, 5.2], fov: 40 }}>
        <Cloud still={still} />
      </Canvas>
      <div className="label pointer-events-none absolute bottom-5 left-5 flex gap-5 text-fg-2">
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-[#c9d0ff]" /> Normal
        </span>
        <span className="flex items-center gap-2">
          <i className="size-2 rounded-full bg-ember" /> Anomalie
        </span>
      </div>
    </div>
  );
}
