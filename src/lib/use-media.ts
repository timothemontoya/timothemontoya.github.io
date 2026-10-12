"use client";

import { useSyncExternalStore } from "react";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/** Vrai sur les écrans tactiles (doigt plutôt que souris). */
export const useCoarsePointer = () => useMediaQuery("(pointer: coarse)");
