"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

function Ring({ radius, opacity, color, spin }: { radius: number; opacity: number; color: string; spin: React.RefObject<THREE.Group | null> }) {
  return (
    <group ref={spin}>
      <mesh>
        <torusGeometry args={[radius, 0.0035, 6, 200]} />
        <meshBasicMaterial color="#c9d0ff" transparent opacity={opacity} toneMapped={false} depthWrite={false} />
      </mesh>
      {/* Petit satellite qui parcourt l'anneau */}
      <mesh position={[radius, 0, 0]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Deux orbites très fines autour du modèle de l'accueil, chacune avec son satellite. */
export function Orbits({ still }: { still: boolean }) {
  const a = useRef<THREE.Group>(null);
  const b = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (still) return;
    if (a.current) a.current.rotation.z += delta * 0.3;
    if (b.current) b.current.rotation.z -= delta * 0.2;
  });

  return (
    <group>
      <group rotation={[Math.PI / 2.25, 0.25, 0]}>
        <Ring radius={2.05} opacity={0.34} color="#ff7a3d" spin={a} />
      </group>
      <group rotation={[Math.PI / 1.75, -0.55, 0.3]}>
        <Ring radius={2.5} opacity={0.16} color="#f2f2f0" spin={b} />
      </group>
    </group>
  );
}
