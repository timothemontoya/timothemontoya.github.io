import type { NextConfig } from "next";

/**
 * Sous-dossier du site en ligne. Sur GitHub Pages (https://<pseudo>.github.io/<dépôt>/),
 * le workflow de déploiement le fournit via BASE_PATH ; en local il est vide.
 */
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Export en fichiers statiques (dossier out/) : GitHub Pages n'exécute pas de serveur.
  output: "export",
  basePath,
  // Chaque page devient dossier/index.html, ce que GitHub Pages sert directement.
  trailingSlash: true,
  // L'optimisation d'images de Next.js demande un serveur : les images sont servies telles quelles.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // TEXTES.txt est lu comme une simple chaîne de caractères (voir src/content/textes.ts).
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
