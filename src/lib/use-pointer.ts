"use client";

import { useEffect, useRef } from "react";

/**
 * Position de la souris sur toute la fenêtre, de -1 à 1 sur chaque axe.
 * Stockée dans une ref pour être lue à chaque image sans provoquer de rendu React.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return pointer;
}
