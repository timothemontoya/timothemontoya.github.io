"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import type { Finish } from "@/content/models";
import { asset } from "@/lib/asset";

/** Taille (diagonale de la boîte englobante) de tous les modèles une fois normalisés. */
const TARGET_SIZE = 2.6;

type Props = {
  url: string;
  studio?: boolean;
  finish?: Finish;
} & Omit<React.ComponentProps<"group">, "children">;

/**
 * Charge un .glb, le centre et le met à l'échelle pour que tous les modèles
 * occupent la même place à l'écran, quelle que soit leur taille dans Blender.
 */
export function Model({ url, studio, finish, ...props }: Props) {
  const { scene } = useGLTF(asset(url));
  const object = useMemo(() => {
    // Clone aussi les matériaux : une finition imposée ne doit pas déteindre sur une autre instance.
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = Array.isArray(child.material) ? child.material.map((m) => m.clone()) : child.material.clone();
      }
    });
    return clone;
  }, [scene]);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length() || 1;
    const center = box.getCenter(new THREE.Vector3());
    return { scale: TARGET_SIZE / size, offset: center.multiplyScalar(-1) };
  }, [object]);

  useLayoutEffect(() => {
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;
        // Les shaders procéduraux de Blender ne s'exportent pas : on garde la couleur de base
        // mais on règle les matières pour qu'elles réagissent bien à l'éclairage studio.
        if (finish) {
          m.color.set(finish.color);
          m.metalness = finish.metalness;
          m.roughness = finish.roughness;
        } else if (studio) {
          m.metalness = 0.15;
          m.roughness = 0.45;
        }
        m.envMapIntensity = 1.1;
        m.needsUpdate = true;
      });
    });
  }, [object, studio, finish]);

  return (
    <group {...props}>
      <group scale={scale}>
        <primitive object={object} position={offset} />
      </group>
    </group>
  );
}

export const preloadModel = (url: string) => useGLTF.preload(asset(url));
