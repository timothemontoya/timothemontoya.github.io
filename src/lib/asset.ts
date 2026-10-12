/**
 * Préfixe un chemin de /public avec le sous-dossier du site.
 * Sur GitHub Pages, le site vit sous /<nom-du-dépôt>/ : next/link l'ajoute tout seul,
 * mais pas les <img>, <video> ni les modèles 3D, d'où cette fonction.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
