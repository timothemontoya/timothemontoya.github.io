"use client";

import { ReactLenis, useLenis } from "lenis/react";
import Snap from "lenis/snap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/use-media";

/**
 * Cale le défilement sur le début des grandes parties marquées `data-snap`,
 * seulement quand on s'arrête à proximité : on ne reste jamais « bloqué » dans une section.
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

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <ReactLenis root options={{ lerp: reduced ? 1 : 0.09, smoothWheel: !reduced, anchors: true }}>
      {!reduced && <SnapToSections />}
      {children}
    </ReactLenis>
  );
}
