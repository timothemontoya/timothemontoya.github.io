/**
 * Distance de caméra pour qu'un modèle normalisé (≈ 2,6 unités) tienne en largeur.
 * Sur ordinateur on garde 7 ; sur un écran étroit (téléphone en portrait) on recule.
 */
export function fitDistance(aspect: number, fov = 30, width = 3.4, min = 7) {
  const visible = 2 * Math.tan(((fov / 2) * Math.PI) / 180) * aspect;
  return Math.max(min, width / visible);
}
