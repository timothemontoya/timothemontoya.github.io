# DESIGN.md — Timothé Montoya

Un portfolio où **la 3D est le contenu principal** : les rendus Blender et les modèles temps
réel tiennent la place qu'occupe la photographie sur un site de studio.

## 1. Atmosphère

Une feuille imprimée qui se révèle être une simulation. Fond crème taché de violet, tramé comme
une sérigraphie ; les blocs du fond se soulèvent au passage de la souris et laissent voir un
quadrillage. Les rendus, les scènes animées et la visionneuse sont des écrans sombres posés sur
cette page claire. Les titres restent serrés et très grands, tout bouge avec inertie.

Caractéristiques :
- Rendus et modèles 3D en grand : avec les taches violettes, ce sont eux qui portent la couleur.
- Une famille de police : **Geist** (Geist Mono pour les micro-étiquettes), plus **Doto**, une
  police à points, réservée aux numéros et à quelques mots très courts.
- Zéro ombre CSS. La profondeur vient de la 3D, du flou et des blocs qui sortent du fond.
- Filets fins, encre à 17 % d'opacité : ils tiennent aussi bien sur le crème que sur le violet.
- Étiquettes en capitales espacées pour structurer.

## 2. Couleurs

| Rôle | Token | Valeur |
|---|---|---|
| Fond (papier) | `--ink-0` | `#f4f0e7` |
| Surface | `--ink-1` | `#ece7db` |
| Surface relevée | `--ink-2` | `#e1dbcd` |
| Filet | `--line` | encre à 17 % |
| Texte principal | `--fg` | `#15121b` |
| Texte secondaire | `--fg-2` | `#37323f` |
| Texte discret | `--fg-3` | `#5f5968` |
| Accent violet | `--accent` | `#7a1fe6` |

Taches du fond, du plus clair au plus dense : lilas `#e3d5f2`, violet `#be8ffb`, violet vif
`#9c3df5`, magenta `#c921e6`. Le cyan `#59ccff` n'apparaît que dans le quadrillage sous les blocs.

La classe `screen` redonne les mêmes jetons en version nuit (fond `#050506`, texte `#f2f2f0`,
accent `#cf6bff`) : elle s'applique à la visionneuse, aux scènes animées et au 2048.

L'accent sert à l'état actif, au focus et à un mot par écran au maximum.

## 3. Typographie

| Rôle | Taille | Graisse | Interligne | Espacement |
|---|---|---|---|---|
| Display héros | `clamp(3.5rem, 11vw, 10rem)` | 500 | 0.88 | -0.045em |
| Titre de section | `clamp(2.25rem, 5vw, 4.5rem)` | 500 | 0.95 | -0.035em |
| Titre de carte | 1.5rem | 500 | 1.05 | -0.02em |
| Corps | 1rem / 1.125rem | 400 | 1.5 | -0.01em |
| Étiquette | 0.75rem mono, capitales | 400 | 1.2 | 0.08em |
| Numéro en points (`dots`) | 0.95rem à 1.9rem, Doto | 900 | 1 | 0.06em |
| Titre de projet (liste) | `clamp(2.25rem, 4.6vw, 4.5rem)`, capitales | 500 | 0.92 | -0.03em |
| Entrée du menu | `clamp(2.5rem, 6.5vw, 5rem)`, minuscules | 500 | 1.05 | -0.045em |

Règles : jamais de graisse supérieure à 600 en Geist. Les petites capitales ont toujours un
espacement positif ; seuls les grands titres de projet sont en capitales serrées. Doto ne sert
jamais pour une phrase.

## 4. Composants

- **Boutons** : texte 14px graisse 500, bordure `--line`, rayon 999px réservé aux sélecteurs
  de la salle de projection. Les autres boutons ont un rayon de 6px. Au survol, le texte passe
  en `--fg` et la bordure s'éclaircit.
- **Explorateur de projets** : la liste des titres en capitales à gauche, le projet actif à
  droite (visuel, résumé, rôle, technologies). Le survol d'un titre l'active : son numéro passe
  en violet et le titre se « décode » lettre par lettre. Au doigt, un appui choisit, le
  suivant ouvre.
- **Fond du site** (`backdrop.tsx`) : un seul shader fixe derrière toutes les pages. Taches et
  coulures violettes en bruit fractal, réduites à quatre teintes et tramées (matrice de Bayer),
  grain fixe. Il suit la page un peu moins vite qu'elle. Les blocs survolés se soulèvent, en
  gros pixels, et retombent lentement ; de temps en temps un bloc se soulève tout seul.
  Aucun rai de lumière ni orbite à l'accueil : seulement de la poussière violette en 3D.
- **Spirale des rendus** (WebGL) : les rendus préférés défilent en diagonale sur des écrans
  bombés, un cran toutes les quelques secondes. Pendant le mouvement, l'image se déchire comme
  une cassette mal lue ; à l'arrêt il reste un frémissement léger et un court décrochage de
  temps en temps. Un clic fait entrer dans l'image : elle
  grandit jusqu'à sa place dans la visionneuse, et en ressort à la fermeture.
  La liste se règle dans `renders.ts` (`spiral`).
- **Entrée de la salle** : volets fermés, décompte 3-2-1 d'amorce de film, les volets
  s'ouvrent, le faisceau s'allume en hésitant, le titre fait sa mise au point.
- **Un effet de texte par étape** : le nom monte lettre par lettre (accueil), mise au point
  (salle), glitch (rendus), décodage (projets), mots allumés au scroll (à propos), machine à
  écrire (contact). Jamais deux fois le même.
- **Fil des sections** : sur grand écran, six traits sur le bord droit ; celui de la section
  à l'écran s'allonge en violet et affiche son numéro.
- **Accueil** : cadre de visée et fiche du modèle, coordonnées et heure de Toulouse.
- **Couvertures animées** : quand un projet n'a pas de belle image, une petite scène codée
  (nuage d'anomalies, motif de recul) tient lieu de visuel.
- **Navigation** : fixe, transparente, avec un dégradé noir très léger derrière. Le nom à
  gauche, un lien « On en parle » et le bouton Menu à droite. Le menu s'ouvre en plein écran :
  grandes entrées en minuscules, numérotées comme les sections, liens précédés de « > ».
- **Écran de chargement** : le mot « Chargement » en points et une barre, un peu plus d'une
  seconde, uniquement à l'ouverture du site. Tout en CSS.
- **Étiquette de section** : numéro en points, filet de 32px, libellé en mono.
- **Bloc téléchargement** : carte `--ink-1`. Bouton plein quand le
  fichier existe, pastille « Bientôt disponible » en pointillés sinon. Le bloc de dons
  n'apparaît que si un lien est renseigné.
- **Salle de projection** : une scène 3D plein écran, une liste de modèles en bas, un cartouche
  d'informations (nom, année, polygones) en bas à gauche, à la manière d'une fiche de musée.

## 5. Mise en page

- Base de 8px. Sections espacées de 160 à 240px sur desktop, 96px sur mobile.
- Conteneur max 1600px, gouttières `clamp(16px, 4vw, 48px)`.
- Grilles éditoriales asymétriques, avec un grand visuel et deux petits.
- Rayons : 6px pour les contrôles, 10px pour les médias, 999px seulement pour les sélecteurs.

## 6. Mouvement

- Scroll lissé avec Lenis (`lerp 0.09`).
- 3D : rotation et position du modèle liées au scroll et à la souris, avec un lissage
  (`damp`, λ ≈ 4). Aucune animation pré-calculée.
- Apparitions : fondu + translation de 24px, courbe `cubic-bezier(.2,.7,.1,1)`, durée 0.9s.
- `prefers-reduced-motion` : rotations figées, plus de parallaxe, fondus seulement.

## 7. À faire / À éviter

À faire : montrer le travail en grand, laisser respirer, des légendes en mono, des écrans sombres sur papier clair.
À éviter : ombres portées, dégradés décoratifs dans l'UI, jauges de compétence en %,
jargon « RPG », plus d'un accent coloré par écran.
