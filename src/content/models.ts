import { t } from "./textes";

// Modèles de la salle de projection.
// Pour en ajouter un : exporter le .blend en .glb (voir scripts/export-model.sh),
// le déposer dans public/models/, ajouter une entrée ici, puis son nom et sa légende
// dans TEXTES.txt ([modele.<slug>.nom] et [modele.<slug>.legende]).

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

type ModelData = Omit<Model, "name" | "caption">;

const withText = (m: ModelData): Model => ({ ...m, name: t(`modele.${m.slug}.nom`), caption: t(`modele.${m.slug}.legende`) });

export const models: Model[] = ([
  {
    slug: "tie",
    file: "/models/tie.glb",
    year: 2023,
    rotation: [0.08, -0.5, 0],
    key: "#8b7cf6",
    finish: { color: "#8a8f99", metalness: 0.55, roughness: 0.36 },
  },
  {
    slug: "maison",
    file: "/models/maison.glb",
    year: 2023,
    rotation: [0.08, -0.5, 0],
    key: "#ffc27a",
    // Textures retirées (scripts/strip-textures.mjs) : rendu mat façon maquette.
    studio: true,
  },
  {
    slug: "robot",
    file: "/models/robot.glb",
    year: 2022,
    rotation: [0.05, -0.35, 0],
    key: "#ffc27a",
    studio: true,
  },
  {
    slug: "chaudron",
    file: "/models/cauldron.glb",
    year: 2021,
    rotation: [0.12, -0.4, 0],
    key: "#7dffc4",
  },
  {
    slug: "pigeon",
    file: "/models/pigeon.glb",
    year: 2026,
    rotation: [0.05, -0.45, 0],
    key: "#ffd2a8",
  },
  {
    slug: "guitare",
    file: "/models/guitare.glb",
    year: 2024,
    rotation: [0, -0.35, Math.PI],
    key: "#ff7a3d",
  },
  {
    slug: "gameboy",
    file: "/models/gameboy.glb",
    year: 2023,
    rotation: [0.05, -Math.PI / 2 + 0.4, 0],
    key: "#ffb4d8",
  },
  {
    slug: "terre",
    file: "/models/earth_low_poly.glb",
    year: 2022,
    rotation: [0.1, 0, 0],
    key: "#9fd4ff",
  },
  {
    slug: "chateau",
    file: "/models/chateau_de_sable.glb",
    year: 2024,
    rotation: [0.2, -0.4, 0],
    key: "#ffc27a",
  },
  {
    slug: "epee",
    file: "/models/epee.glb",
    year: 2024,
    rotation: [0, -0.3, 0],
    key: "#c9d6ff",
  },
  {
    slug: "gemme",
    file: "/models/toon.glb",
    year: 2024,
    rotation: [0.15, -0.4, 0],
    key: "#8b7cf6",
  },
] satisfies ModelData[]).map(withText);
