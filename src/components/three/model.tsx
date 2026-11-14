"use client";

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import type { Finish } from "@/content/models";
import { asset } from "@/lib/asset";

// ─── Suivi du chargement des modèles ─────────────────────────────────────────
// `progress` : part téléchargée du fichier (0 → 1). `ready` : modèle affiché au moins une fois.
// Sert à l'écran de chargement et à la petite barre de la salle de projection.

const progress = new Map<string, number>();
const ready = new Set<string>();
const pending = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/**
 * Télécharge un modèle (une seule fois) et suit sa progression. Le chargeur de three.js
 * regroupe les demandes d'un même fichier : celle de useGLTF rejoint celle-ci, rien n'est
 * téléchargé deux fois. La promesse se résout quand le fichier est arrivé.
 */
export function fetchModel(url: string): Promise<void> {
  const full = asset(url);
  const known = pending.get(full);
  if (known) return known;
  const done = new Promise<void>((resolve) => {
    const finish = () => {
      progress.set(full, 1);
      notify();
      resolve();
    };
    if (!progress.has(full)) progress.set(full, 0);
    new THREE.FileLoader()
      .setResponseType("arraybuffer")
      .load(
        full,
        finish,
        (e) => {
          if (!e.lengthComputable || !e.total) return;
          progress.set(full, Math.min(0.99, e.loaded / e.total));
          notify();
        },
        finish,
      );
  });
  pending.set(full, done);
  useGLTF.preload(full);
  return done;
}

/** Résolue quand le modèle a été affiché (téléchargé, lu et monté dans la scène). */
export function whenModelReady(url: string): Promise<void> {
  const full = asset(url);
  if (ready.has(full)) return Promise.resolve();
  return new Promise((resolve) => {
    const off = subscribe(() => {
      if (!ready.has(full)) return;
      off();
      resolve();
    });
  });
}

/** État de chargement d'un modèle : `null` s'il est prêt, sinon la part téléchargée (ou -1 si inconnue). */
export function useModelLoading(url: string): number | null {
  const full = asset(url);
  return useSyncExternalStore(
    subscribe,
    () => (ready.has(full) ? null : (progress.get(full) ?? -1)),
    () => -1,
  );
}

/** Part téléchargée d'un modèle (0 → 1), ou -1 tant qu'on ne la connaît pas. */
export const modelProgress = (url: string) => {
  const full = asset(url);
  return ready.has(full) ? 1 : (progress.get(full) ?? -1);
};
export const subscribeModels = subscribe;

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

  // Le modèle est dans la scène : la barre de chargement peut disparaître.
  useLayoutEffect(() => {
    const full = asset(url);
    if (ready.has(full)) return;
    ready.add(full);
    progress.set(full, 1);
    notify();
  }, [url]);

  return (
    <group {...props}>
      <group scale={scale}>
        <primitive object={object} position={offset} />
      </group>
    </group>
  );
}
