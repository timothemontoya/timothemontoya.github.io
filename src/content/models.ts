// Modèles de la salle de projection.
// Pour en ajouter un : exporter le .blend en .glb (voir scripts/export-model.sh),
// le déposer dans public/models/, puis ajouter une entrée ici.

export type Model = {
  slug: string;
  name: string;
  file: string;
  /** Année d'après la date du fichier .blend d'origine. */
  year: number;
  caption: string;
  /** Couleur de la lumière principale de la scène. */
  key: string;
  /** Orientation de présentation [x, y, z] en radians (face au visiteur, léger trois-quarts). */
  rotation?: [number, number, number];
  /** Remplace les matériaux exportés par une matière « studio » si Blender en avait peu. */
  studio?: boolean;
  /** Impose une finition à tout le modèle (couleur, métal, rugosité). */
  finish?: Finish;
};

export type Finish = { color: string; metalness: number; roughness: number };

export const models: Model[] = [
  {
    slug: "tie",
    name: "TIE Fighter",
    file: "/models/tie.glb",
    year: 2023,
    caption: "Chasseur impérial modélisé en hard-surface : miroir, biseaux et grille en wireframe.",
    rotation: [0.08, -0.5, 0],
    key: "#8b7cf6",
    finish: { color: "#8a8f99", metalness: 0.55, roughness: 0.36 },
  },
  {
    slug: "maison",
    name: "Sanctuaire",
    file: "/models/maison.glb",
    year: 2023,
    caption: "Maison à colombages pensée comme un asset de jeu : toit courbé, bois texturé.",
    rotation: [0.08, -0.5, 0],
    key: "#ffc27a",
  },
  {
    slug: "robot",
    name: "Robot",
    file: "/models/robot.glb",
    year: 2022,
    caption: "Personnage robot articulé, modélisé pièce par pièce.",
    rotation: [0.05, -0.35, 0],
    key: "#ffc27a",
    studio: true,
  },
  {
    slug: "chaudron",
    name: "Chaudron",
    file: "/models/cauldron.glb",
    year: 2021,
    caption: "Chaudron de sorcière stylisé, louche et bocaux sur des dalles taillées.",
    rotation: [0.12, -0.4, 0],
    key: "#7dffc4",
  },
  {
    slug: "pigeon",
    name: "Pigeon urbain",
    file: "/models/pigeon.glb",
    year: 2026,
    caption: "Sculpture organique d'un pigeon de ville, pensée pour un rendu tournant.",
    rotation: [0.05, -0.45, 0],
    key: "#ffd2a8",
  },
  {
    slug: "guitare",
    name: "Guitare",
    file: "/models/guitare.glb",
    year: 2024,
    caption: "Guitare électrique : corps courbé, frettes en array, cordes guidées par courbe.",
    rotation: [0, -0.35, Math.PI],
    key: "#ff7a3d",
  },
  {
    slug: "gameboy",
    name: "Game Boy",
    file: "/models/gameboy.glb",
    year: 2023,
    caption: "Console portable en modélisation produit : boutons, croix, écran.",
    rotation: [0.05, -Math.PI / 2 + 0.4, 0],
    key: "#ffb4d8",
  },
  {
    slug: "terre",
    name: "Planète low poly",
    file: "/models/earth_low_poly.glb",
    year: 2022,
    caption: "Une petite planète en low poly : continents facettés, sapins, rochers et nuages.",
    rotation: [0.1, 0, 0],
    key: "#9fd4ff",
  },
  {
    slug: "pingouin",
    name: "Pingouin",
    file: "/models/pingouin2.glb",
    year: 2024,
    caption: "Personnage stylisé, formes douces et matières mates.",
    rotation: [0.05, -0.35, 0],
    key: "#9fd4ff",
  },
  {
    slug: "chateau",
    name: "Château de sable",
    file: "/models/chateau_de_sable.glb",
    year: 2024,
    caption: "Petite scène en modélisation polygonale : tours, créneaux, seau.",
    rotation: [0.2, -0.4, 0],
    key: "#ffc27a",
  },
  {
    slug: "epee",
    name: "Épée",
    file: "/models/epee.glb",
    year: 2024,
    caption: "Lame, garde et poignée tressée le long d'une courbe.",
    rotation: [0, -0.3, 0],
    key: "#c9d6ff",
  },
  {
    slug: "talisman",
    name: "Talisman",
    file: "/models/talisman.glb",
    year: 2024,
    caption: "Amulette en coque épaisse, un exercice de solidify et de matières.",
    rotation: [0.1, -0.3, 0],
    key: "#ff7a3d",
  },
  {
    slug: "gemme",
    name: "Bague",
    file: "/models/toon.glb",
    year: 2024,
    caption: "Bague sertie d'une gemme taillée, étude de shading cartoon.",
    rotation: [0.15, -0.4, 0],
    key: "#8b7cf6",
  },
];
