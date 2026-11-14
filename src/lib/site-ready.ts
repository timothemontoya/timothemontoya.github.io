"use client";

import { useSyncExternalStore } from "react";

// Vrai quand l'écran de chargement s'est retiré : les chargements secondaires
// (carrousel, modèles de la salle) attendent ce moment pour ne pas ralentir l'arrivée.

let ready = false;
const listeners = new Set<() => void>();

export function markSiteReady() {
  if (ready) return;
  ready = true;
  document.documentElement.classList.add("is-ready");
  listeners.forEach((l) => l());
}

export function useSiteReady() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ready,
    () => false,
  );
}
