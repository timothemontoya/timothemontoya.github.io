// Projets. Pour en ajouter un : copier une entrée et remplir les champs.
// La page /projets/<slug> est générée automatiquement.

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

export const projects: Project[] = [
  {
    slug: "chroma-buddy",
    title: "Chroma Buddy",
    kicker: "Coach IA pour jeux vidéo",
    year: "2026",
    status: "En cours",
    summary:
      "Une application de bureau qui regarde ta partie d'Apex Legends par capture d'écran, comprend ce qui se passe et te livre un debrief clair après chaque match. Sans toucher au jeu, donc compatible anti-cheat.",
    role: "Conception, architecture, développement",
    stack: ["Tauri", "Rust", "React", "TypeScript", "Python", "OCR", "LLM local"],
    cover: { type: "image", src: "/projects/chroma-buddy.svg", alt: "Interface de debrief de Chroma Buddy", ratio: 16 / 10 },
    facts: [
      { value: "3", label: "langages qui dialoguent : TS, Rust, Python" },
      { value: "28", label: "légendes dans la base de connaissances" },
      { value: "0", label: "octet lu dans la mémoire du jeu" },
    ],
    sections: [
      {
        title: "Lire un HUD comme un joueur",
        body: "Le moteur découpe l'écran en zones accrochées aux bords (valable en 16:9, 16:10 et 21:9) et y lit les kills, la santé, les boucliers, les coéquipiers, l'arme en main et l'ultime, par templates, OCR local et analyse de couleurs.",
      },
      {
        title: "Une architecture en trois couches",
        body: "Interface React, cœur natif Rust via Tauri, moteur d'analyse Python lancé en processus enfant à basse priorité. Les couches se parlent en JSON, une ligne par message. Chaque jeu est un module qui respecte un contrat commun et est découvert automatiquement.",
      },
      {
        title: "Un coach qui cite ses sources",
        body: "La base de connaissances (armes, légendes, cartes, principes de jeu) est datée et sourcée. Le coach répond avec ces fiches et, si un modèle de langage local est installé, rédige une réponse à partir d'elles uniquement.",
      },
    ],
  },
  {
    slug: "maintenance-predictive",
    title: "Signal faible",
    kicker: "Maintenance prédictive par l'IA",
    year: "2025",
    summary:
      "Détecter une panne avant qu'elle arrive. Un capteur de vibrations sur une vraie turbine d'extraction de gaz, des défaillances provoquées volontairement, et un algorithme d'Isolation Forest qui apprend à repérer l'anormal.",
    role: "Expérimentation, analyse de données, modèle",
    stack: ["Python", "scikit-learn", "Isolation Forest", "Capteurs IoT", "Matplotlib"],
    cover: { type: "scene", scene: "anomalies", alt: "Nuage de mesures en 3D : vibrations normales et anomalies détectées", ratio: 16 / 9 },
    facts: [
      { value: "~74 %", label: "des anomalies détectées dans la plage de défaillance" },
      { value: "3 axes", label: "de vitesse de vibration mesurés" },
      { value: "ms", label: "par point analysé, compatible temps réel" },
    ],
    sections: [
      {
        title: "Le terrain",
        body: "Une turbine d'extraction de gaz bien réelle, un capteur de vibrations fixé sur le moteur. Les pannes coûtent environ 22 milliards d'euros par an à l'industrie française et la plupart des interventions se font dans l'urgence. Les vibrations trahissent la majorité des défauts mécaniques : déséquilibre, désalignement, roulement abîmé.",
        media: { type: "image", src: "/rnd/turbine.jpg", alt: "Turbine d'extraction de gaz utilisée pour les mesures", ratio: 674 / 384 },
      },
      {
        title: "Provoquer la panne",
        body: "Obstruction de l'entrée et de la sortie à 50 %, 80 %, puis 100 %, et suppression d'une phase électrique. Chaque scénario laisse une signature dans la vitesse de vibration sur trois axes.",
        media: { type: "image", src: "/rnd/vibrations.jpg", alt: "Courbes de vibration sur trois axes avec les phases de défaillance", ratio: 1964 / 714 },
      },
      {
        title: "Isoler l'anormal",
        body: "Une Isolation Forest découpe l'espace au hasard : un point normal demande beaucoup de coupes pour être isolé, une anomalie très peu. Chaque mesure reçoit un score, au-delà de 0,6 c'est une alerte.",
        media: { type: "image", src: "/rnd/anomalies3d.jpg", alt: "Nuage de points 3D, mesures normales et anomalies", ratio: 1224 / 1016 },
      },
    ],
  },
  {
    slug: "bullies",
    title: "BULLIES",
    kicker: "RPG en Java, projet long à l'N7",
    year: "2026",
    summary:
      "Un jeu de rôle en pixel art dans une école primaire, développé à cinq sur un moteur écrit de zéro en Java et Swing. Développeur et Product Owner, j'ai porté la construction de la carte, le rendu en profondeur, l'interface en jeu et le système de quêtes.",
    role: "Développeur & Product Owner, équipe de 5",
    stack: ["Java", "Swing", "Programmation objet", "Git", "Sprints"],
    cover: { type: "image", src: "/projects/bullies/cour.png", alt: "BULLIES : la cour de l'école, un mur devenu transparent, la minimap", ratio: 16 / 9, pixel: true },
    facts: [
      { value: "5", label: "développeurs, trois itérations de février à mai 2026" },
      { value: "6 700", label: "lignes de Java, sans moteur de jeu externe" },
      { value: "4", label: "états par scénario de quête : attente, dialogue, choix, terminé" },
    ],
    sections: [
      {
        title: "Une carte qu'on déclare",
        body: "J'ai refondu le Map Builder : les salles, obstacles et décors se déclarent en quelques lignes, et des zones fusionnées donnent des pièces aux formes non rectangulaires, comme le hall ou la cour. Sols, murs et contours sont texturés à partir de tilesets.",
        media: { type: "image", src: "/projects/bullies/hall.png", alt: "Le hall de l'école et les portes des classes", ratio: 16 / 9, pixel: true },
      },
      {
        title: "Devant, derrière",
        body: "Un tri en profondeur (Y-sorting) place le joueur devant ou derrière chaque élément du décor, et les murs deviennent transparents seulement quand il passe derrière. Un mode debug (touche P) affiche les collisions en temps réel, ce qui nous a permis de corriger les bugs nés de la fusion des salles.",
        media: { type: "image", src: "/projects/bullies/debug.png", alt: "Mode debug : collisions en rouge, hitbox du joueur en jaune, mur transparent", ratio: 16 / 9, pixel: true },
      },
      {
        title: "Une minimap qui se cadre seule",
        body: "La minimap flottante calcule son zoom pour toujours contenir l'école entière. Les arrondis laissaient des fissures d'un pixel entre les salles fusionnées : un agrandissement d'un pixel au rendu les a soudées.",
        media: { type: "image", src: "/projects/bullies/cm1.png", alt: "Une salle de classe, la minimap en haut à droite", ratio: 16 / 9, pixel: true },
      },
      {
        title: "Des PNJ et des quêtes",
        body: "J'ai dessiné la planche de tous les personnages, deux images d'animation chacun, chargée via un fichier JSON. Au-dessus, une architecture de scénarios (attente, dialogue, choix, terminé) s'attache à n'importe quel PNJ : la feuille de triche d'Alex, ou la quête de la fleur qui fait intervenir Émilie, Madeleine et Sarah.",
        media: { type: "image", src: "/projects/bullies/pnj.png", alt: "Planche de sprites des personnages du jeu", ratio: 1, pixel: true },
      },
    ],
  },
  {
    slug: "2048",
    title: "2048",
    kicker: "Premier jeu, Trophées NSI",
    year: "2022",
    summary:
      "Le jeu 2048 recodé de zéro en Python, au lycée, sans regarder le programme d'origine. Mon premier vrai projet d'équipe, présenté aux Trophées NSI. Tu peux y jouer juste en dessous.",
    role: "Programmation, recherche d'idées, à trois",
    stack: ["Python", "Algorithmique", "Travail en équipe"],
    cover: { type: "image", src: "/projects/2048/logo.png", alt: "Logo du projet 2048", ratio: 1, fit: "contain" },
    facts: [
      { value: "3", label: "élèves, deux heures par semaine" },
      { value: "4", label: "fonctions de mouvement découpées en sous-fonctions" },
      { value: "40 %", label: "de chances de tirer un 4, notre règle maison" },
    ],
    sections: [
      {
        title: "Du terminal…",
        body: "La version d'origine tourne dans un terminal : une grille formatée pour rester lisible, les touches ZQSD pour jouer, et des fonctions de mouvement découpées en gestion ligne par ligne, addition et décalage.",
        media: { type: "image", src: "/projects/2048/terminal.jpg", alt: "Le 2048 en Python dans un terminal", ratio: 1120 / 460 },
      },
      {
        title: "Le bug de la ligne 1",
        body: "Au début, seule la première ligne se décalait. Trouver pourquoi les trois autres restaient figées a été notre premier vrai débogage, et la meilleure leçon du projet.",
      },
      {
        title: "…au navigateur",
        body: "Les mêmes règles, réécrites en TypeScript pour ce portfolio. Flèches ou ZQSD sur ordinateur, glisser sur téléphone.",
        demo: "2048",
      },
    ],
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
