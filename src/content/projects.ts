import { list, optional, t } from "./textes";

// Projets. Les textes sont dans TEXTES.txt ([projet.<slug>.…]) ; ici ne restent que
// les images, l'année et la structure. Pour ajouter un projet : copier une entrée,
// puis ajouter ses balises dans TEXTES.txt. La page /projets/<slug> est générée automatiquement.

export type Media =
  | { type: "image"; src: string; alt: string; ratio: number; fit?: "contain"; pixel?: boolean }
  | { type: "video"; src: string; alt: string; ratio: number }
  /** Scène 3D temps réel codée dans le site (voir components/media.tsx). */
  | { type: "scene"; scene: "anomalies"; alt: string; ratio: number };

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  year: string;
  status?: string;
  summary: string;
  role: string;
  stack: string[];
  cover: Media;
  /** Chiffres ou faits marquants, affichés en grand. */
  facts: { value: string; label: string }[];
  sections: { title: string; body: string; media?: Media; demo?: "2048" }[];
};

type ProjectData = {
  slug: string;
  year: string;
  cover: Media;
  /** Nombre de chiffres clés ([projet.<slug>.chiffreN] dans TEXTES.txt). */
  facts: number;
  /** Une entrée par partie ([projet.<slug>.partieN.…]), avec son image éventuelle. */
  sections: { media?: Media; demo?: "2048" }[];
};

function withText({ slug, year, cover, facts, sections }: ProjectData): Project {
  const k = (key: string) => `projet.${slug}.${key}`;
  return {
    slug,
    year,
    cover,
    title: t(k("titre")),
    kicker: t(k("sous-titre")),
    status: optional(k("statut")),
    summary: t(k("resume")),
    role: t(k("role")),
    stack: list(k("technologies")),
    facts: Array.from({ length: facts }, (_, i) => ({ value: t(k(`chiffre${i + 1}`)), label: t(k(`chiffre${i + 1}.texte`)) })),
    sections: sections.map((s, i) => ({ ...s, title: t(k(`partie${i + 1}.titre`)), body: t(k(`partie${i + 1}.texte`)) })),
  };
}

export const projects: Project[] = (
  [
    {
      slug: "chroma-buddy",
      year: "2026",
      cover: { type: "image", src: "/projects/chroma-buddy.svg", alt: "Interface de debrief de Chroma Buddy", ratio: 16 / 10 },
      facts: 3,
      sections: [{}, {}, {}],
    },
    {
      slug: "maintenance-predictive",
      year: "2025",
      cover: { type: "scene", scene: "anomalies", alt: "Nuage de mesures en 3D : vibrations normales et anomalies détectées", ratio: 16 / 9 },
      facts: 3,
      sections: [
        { media: { type: "image", src: "/rnd/turbine.jpg", alt: "Turbine d'extraction de gaz utilisée pour les mesures", ratio: 674 / 384 } },
        { media: { type: "image", src: "/rnd/vibrations.jpg", alt: "Courbes de vibration sur trois axes avec les phases de défaillance", ratio: 1964 / 714 } },
        { media: { type: "image", src: "/rnd/anomalies3d.jpg", alt: "Nuage de points 3D, mesures normales et anomalies", ratio: 1224 / 1016 } },
      ],
    },
    {
      slug: "bullies",
      year: "2026",
      cover: { type: "image", src: "/projects/bullies/cour.png", alt: "BULLIES : la cour de l'école, un mur devenu transparent, la minimap", ratio: 16 / 9, pixel: true },
      facts: 3,
      sections: [
        { media: { type: "image", src: "/projects/bullies/hall.png", alt: "Le hall de l'école et les portes des classes", ratio: 16 / 9, pixel: true } },
        { media: { type: "image", src: "/projects/bullies/debug.png", alt: "Mode debug : collisions en rouge, hitbox du joueur en jaune, mur transparent", ratio: 16 / 9, pixel: true } },
        { media: { type: "image", src: "/projects/bullies/cm1.png", alt: "Une salle de classe, la minimap en haut à droite", ratio: 16 / 9, pixel: true } },
        { media: { type: "image", src: "/projects/bullies/pnj.png", alt: "Planche de sprites des personnages du jeu", ratio: 1, pixel: true } },
      ],
    },
    {
      slug: "2048",
      year: "2022",
      cover: { type: "image", src: "/projects/2048/logo.png", alt: "Logo du projet 2048", ratio: 1, fit: "contain" },
      facts: 3,
      sections: [
        { media: { type: "image", src: "/projects/2048/terminal.jpg", alt: "Le 2048 en Python dans un terminal", ratio: 1120 / 460 } },
        {},
        { demo: "2048" },
      ],
    },
  ] satisfies ProjectData[]
).map(withText);

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
