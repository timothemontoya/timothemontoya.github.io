import { t } from "./textes";

// Library de rendus Blender. Titre et note de chaque rendu : TEXTES.txt ([rendu.<id>.titre], [rendu.<id>.note]).
// Un rendu peut avoir plusieurs vues (`shots`) : la première sert de couverture dans la galerie,
// les autres se parcourent en plein écran. Fichiers dans public/renders/ ou public/videos/.

export type Shot = {
  src: string;
  kind: "image" | "video";
  /** Rapport largeur / hauteur, pour réserver la place avant chargement. */
  ratio: number;
};

export type Render = {
  id: string;
  title: string;
  note: string;
  /** Mois de réalisation « AAAA-MM », d'après la date du fichier d'origine (.blend ou rendu). */
  date: string;
  /** Vrai quand seule une date de copie est connue : le rendu peut être plus ancien. */
  approx?: boolean;
  shots: Shot[];
};

const img = (src: string, ratio: number): Shot => ({ src, kind: "image", ratio });
const vid = (src: string, ratio: number): Shot => ({ src, kind: "video", ratio });

type RenderData = Omit<Render, "title" | "note">;

const withText = (r: RenderData): Render => ({ ...r, title: t(`rendu.${r.id}.titre`), note: t(`rendu.${r.id}.note`) });

export const renders: Render[] = ([
  {
    id: "nebuleuse", date: "2026-09", approx: true,
    shots: [
      img("/renders/helmet-nebula.jpg", 16 / 9),
      img("/renders/helmet-scan.jpg", 16 / 9),
      img("/renders/helmet-dark1.jpg", 16 / 9),
      img("/renders/helmet-dark2.jpg", 16 / 9),
    ],
  },
  { id: "seuil", date: "2026-06", approx: true, shots: [img("/renders/donjon.jpg", 1168 / 1652)] },
  { id: "chambre", date: "2026-09", approx: true, shots: [img("/renders/chambre-retro.jpg", 1)] },
  { id: "chaudron", date: "2021-10", shots: [img("/renders/chaudron.jpg", 1)] },
  { id: "egouts", date: "2021-09", shots: [img("/renders/egouts.jpg", 1)] },
  {
    id: "liminal", date: "2026-09", approx: true,
    shots: [vid("/videos/liminal-corridor.webm", 540 / 640), img("/renders/liminal-champ.jpg", 1000 / 1350)],
  },
  { id: "ecran", date: "2021-05", shots: [vid("/videos/ecran-cinema.webm", 16 / 9)] },
  { id: "particules", date: "2021-10", shots: [vid("/videos/particules.webm", 16 / 9)] },
  { id: "gameboy", date: "2023-01", shots: [img("/renders/gameboy.jpg", 16 / 9)] },
  { id: "sanctuaire", date: "2023-01", shots: [img("/renders/maison.jpg", 16 / 9)] },
  { id: "comptoir", date: "2026-09", approx: true, shots: [img("/renders/bar-nuit.jpg", 1)] },
  { id: "prise", date: "2021-06", shots: [img("/renders/prise.jpg", 16 / 9)] },
  { id: "pigeon", date: "2026-06", shots: [vid("/videos/cityrender-turntable.webm", 1)] },
  { id: "popcorn", date: "2021-08", shots: [img("/renders/popcorn.jpg", 16 / 9)] },
] satisfies RenderData[]).map(withText);
