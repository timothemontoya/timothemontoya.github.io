"use client";

import { ReactLenis, useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useCoarsePointer, useReducedMotion } from "@/lib/use-media";

/**
 * Cale le défilement sur le début des grandes parties marquées `data-snap`,
 * seulement quand on s'arrête à proximité : on ne reste jamais « bloqué » dans une section.
 * Souris et pavé tactile uniquement : sur téléphone, Lenis interviendrait pendant l'inertie
 * du doigt et ferait des retours en arrière. Le calage y est natif (globals.css).
 */
function SnapToSections() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;
    const snap = new Snap(lenis, {
      type: "proximity",
      distanceThreshold: "30%",
      debounce: 180,
      duration: 0.9,
      easing: (t) => 1 - Math.pow(1 - t, 4),
    });
    // Attend que la page soit rendue avant de mesurer les sections.
    const t = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-snap]").forEach((el) => snap.addElement(el, { align: ["start"] }));
    }, 100);
    return () => {
      clearTimeout(t);
      snap.destroy();
    };
  }, [lenis, pathname]);

  return null;
}

/**
 * À chaque changement de page : on arrive en haut (ou sur l'ancre demandée, ex. /#projets).
 * Sans cela, Lenis pouvait finir un défilement commencé sur la page précédente
 * et poser le visiteur en bas de la nouvelle.
 */
function ResetOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const popped = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => (popped.current = true);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (first.current) {
      first.current = false;
      return;
    }
    // Retour arrière : le navigateur remet l'ancienne position, on arrête juste l'élan de Lenis.
    if (popped.current) {
      popped.current = false;
      lenis.stop();
      lenis.start();
      return;
    }
    const id = decodeURIComponent(window.location.hash.slice(1));
    // Lenis garde la hauteur de l'ancienne page tant qu'on ne lui dit pas de la remesurer :
    // sans cela, il bloquerait la destination à la longueur de la page précédente.
    lenis.resize();
    if (!id) {
      lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }
    // Laisse la page s'afficher avant de mesurer la position de l'ancre.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        lenis.resize();
        const el = document.getElementById(id);
        if (el) lenis.scrollTo(el, { immediate: true, force: true });
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [lenis, pathname]);

  return null;
}

/**
 * Va à une section de la page courante (id) ou tout en haut (null), et met l'adresse à jour.
 * `instant` : saut direct, utile quand un écran (le menu) cache le trajet.
 */
export function useScrollToSection() {
  const lenis = useLenis();
  return useCallback(
    (id: string | null, { instant = false }: { instant?: boolean } = {}) => {
      const el = id ? document.getElementById(id) : null;
      if (id && !el) return false;
      window.history.pushState(window.history.state, "", id ? `#${id}` : window.location.pathname);
      const target = el ?? 0;
      lenis?.resize();
      if (lenis) lenis.scrollTo(target, { immediate: instant, force: true, duration: 1.2 });
      else if (el) el.scrollIntoView({ behavior: instant ? "instant" : "smooth" });
      else window.scrollTo({ top: 0, behavior: instant ? "instant" : "smooth" });
      return true;
    },
    [lenis],
  );
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const touch = useCoarsePointer();
  return (
    <ReactLenis root options={{ lerp: reduced ? 1 : 0.09, smoothWheel: !reduced }}>
      {!reduced && !touch && <SnapToSections />}
      <ResetOnNavigate />
      {children}
    </ReactLenis>
  );
}
