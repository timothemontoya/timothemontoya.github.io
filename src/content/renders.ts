// Library de rendus Blender.
// Un rendu peut avoir plusieurs vues (`shots`) : la première sert de couverture dans la galerie,
// les autres se parcourent en plein écran. Fichiers dans public/renders/ ou public/videos/.

export type Shot = {
  src: string;
  kind: "image" | "video";
  /** Rapport largeur / hauteur, pour réserver la place avant chargement. */
  ratio: number;
};

export type Render = {
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

export const renders: Render[] = [
  {
    title: "Nébuleuse", date: "2026-09", approx: true,
    note: "Casque NASA, HUD animé, volumétrie",
    shots: [
      img("/renders/helmet-nebula.jpg", 16 / 9),
      img("/renders/helmet-scan.jpg", 16 / 9),
      img("/renders/helmet-dark1.jpg", 16 / 9),
      img("/renders/helmet-dark2.jpg", 16 / 9),
    ],
  },
  { title: "Le seuil", date: "2026-06", approx: true, note: "Architecture, brouillard, post-production", shots: [img("/renders/donjon.jpg", 1168 / 1652)] },
  { title: "Chambre 2009", date: "2026-09", approx: true, note: "Intérieur, mise en scène d'objets", shots: [img("/renders/chambre-retro.jpg", 1)] },
  { title: "Chaudron", date: "2021-10", note: "Stylisé, lumières colorées", shots: [img("/renders/chaudron.jpg", 1)] },
  { title: "La porte", date: "2025-10", note: "Couloir, lumière volumétrique", shots: [img("/renders/porte.jpg", 832 / 1800)] },
  { title: "Égouts", date: "2021-09", note: "Grille, lave, ambiance horrifique", shots: [img("/renders/egouts.jpg", 1)] },
  {
    title: "Espaces liminaux", date: "2026-09", approx: true,
    note: "Couloir animé, panneau en plein champ",
    shots: [vid("/videos/liminal-corridor.webm", 540 / 640), img("/renders/liminal-champ.jpg", 1000 / 1350)],
  },
  { title: "Écran", date: "2021-05", note: "Objet 3D intégré dans une salle filmée", shots: [vid("/videos/ecran-cinema.webm", 16 / 9)] },
  { title: "Particules", date: "2021-10", note: "Simulation, bulles lumineuses", shots: [vid("/videos/particules.webm", 16 / 9)] },
  { title: "Game Boy", date: "2023-01", note: "Objet produit, studio pastel", shots: [img("/renders/gameboy.jpg", 16 / 9)] },
  { title: "Sanctuaire", date: "2023-01", note: "Asset de jeu texturé", shots: [img("/renders/maison.jpg", 16 / 9)] },
  { title: "Comptoir, 2 h", date: "2026-09", approx: true, note: "Nature morte, lumière chaude", shots: [img("/renders/bar-nuit.jpg", 1)] },
  { title: "Prise", date: "2021-06", note: "Design produit, néons", shots: [img("/renders/prise.jpg", 16 / 9)] },
  { title: "Pigeon, turntable", date: "2026-06", note: "Modélisation organique", shots: [vid("/videos/cityrender-turntable.webm", 1)] },
  { title: "Pop-corn", date: "2021-08", note: "Accessoire cartoon", shots: [img("/renders/popcorn.jpg", 16 / 9)] },
];
