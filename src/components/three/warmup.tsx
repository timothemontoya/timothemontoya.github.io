"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { useSiteReady } from "@/lib/site-ready";

// ─── Préparation des scènes pendant l'écran de chargement ───────────────────
// Une scène qui doit être prête à l'ouverture du site le signale avec holdLoading() ;
// l'écran de chargement attend whenWarm() avant de se retirer.

let pending = 0;
const waiters = new Set<() => void>();

/** Retient l'écran de chargement. Renvoie la fonction qui le libère (sans effet au deuxième appel). */
export function holdLoading(): () => void {
  pending++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--pending > 0) return;
    waiters.forEach((w) => w());
    waiters.clear();
  };
}

/** Résolue quand plus aucune scène ne retient l'écran de chargement. */
export function whenWarm(): Promise<void> {
  return pending === 0 ? Promise.resolve() : new Promise((r) => waiters.add(r));
}

/**
 * Vrai un peu après l'ouverture du site, quand le navigateur souffle : moment choisi pour
 * préparer les scènes dont le contenu n'arrive qu'après le chargement (le carrousel).
 */
export function useWarmup(delay = 1200) {
  const siteReady = useSiteReady();
  const [warm, setWarm] = useState(false);
  useEffect(() => {
    if (!siteReady) return;
    const t = setTimeout(() => {
      // Safari n'a pas requestIdleCallback : simple délai dans ce cas.
      if ("requestIdleCallback" in window) window.requestIdleCallback(() => setWarm(true), { timeout: 1500 });
      else setWarm(true);
    }, delay);
    return () => clearTimeout(t);
  }, [siteReady, delay]);
  return warm;
}

/**
 * Prépare une scène hors écran : compile ses shaders et dessine quelques images (ombres,
 * reflets du studio, envoi des modèles et textures à la carte graphique). Sans cela, tout
 * ce travail tombe sur la première image affichée et la page accroche à l'entrée de la scène.
 * Le Canvas doit être en frameloop « demand » (ou « always ») pendant ce temps.
 */
export function Warmup({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const { gl, scene, camera, invalidate } = useThree();
  useEffect(() => {
    if (!active) return;
    gl.compile(scene, camera);
    let n = 0;
    let id = 0;
    const tick = () => {
      invalidate();
      if (++n < 4) id = requestAnimationFrame(tick);
      else onDone?.();
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, gl, scene, camera, invalidate, onDone]);
  return null;
}
