"use client";

import { type RefObject, useEffect, useState } from "react";

/** Vrai quand l'élément est (presque) à l'écran. Sert à couper le rendu 3D hors champ. */
export function useInView(ref: RefObject<Element | null>, margin = "200px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return inView;
}
