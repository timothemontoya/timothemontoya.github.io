# DESIGN.md — Timothé Montoya

Un portfolio où **la 3D est le contenu principal** : les rendus Blender et les modèles temps
réel tiennent la place qu'occupe la photographie sur un site de studio.

## 1. Atmosphère

Une salle de projection. Fond noir profond, interface quasi invisible, l'image et la 3D occupent
l'écran. Les titres ressemblent à des génériques de film : serrés, très grands, interlignage 0.9–1.0.
Tout bouge lentement et avec inertie (scroll Lenis, interpolations `lerp`), jamais de rebond.

Caractéristiques :
- Rendus et modèles 3D en plein écran : c'est eux qui portent la couleur.
- Une famille de police : **Geist** (Geist Mono pour les micro-étiquettes), plus **Doto**, une
  police à points, réservée aux numéros et à quelques mots très courts.
- Zéro ombre CSS. La profondeur vient de la lumière 3D, du flou et des superpositions.
- Bordures fines `#26262a`, presque invisibles.
- Étiquettes en capitales espacées pour structurer.

## 2. Couleurs

| Rôle | Token | Valeur |
|---|---|---|
| Fond | `--ink-0` | `#050506` |
| Surface | `--ink-1` | `#0d0d10` |
| Surface relevée | `--ink-2` | `#16161a` |
| Bordure | `--line` | `#26262a` |
| Texte principal | `--fg` | `#f2f2f0` |
| Texte secondaire | `--fg-2` | `#9a9ca3` (gris froid) |
| Texte discret | `--fg-3` | `#5d6068` |
| Accent « braise » | `--ember` | `#ff7a3d` |

L'accent braise vient de la lumière du rendu « Donjon ». Il sert seulement à l'état actif, au
focus et à un mot par écran au maximum. Le violet « nébuleuse » (`#8b7cf6`) n'existe que dans
les lumières 3D, jamais en couleur d'interface.

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
  en braise et le titre se « décode » lettre par lettre. Au doigt, un appui choisit, le
  suivant ouvre.
- **Fond de l'accueil** : une nappe de lumière froide venue du haut, trois faisceaux flous qui
  oscillent lentement, et de la poussière 3D en suspension qui file quand on défile. Pas de
  grain, pas de trame.
- **Spirale des rendus** (WebGL) : les rendus préférés défilent en diagonale sur des écrans
  bombés, un cran toutes les quelques secondes. Pendant le mouvement, l'image se déchire comme
  une cassette mal lue ; à l'arrêt elle est nette. Un clic fait entrer dans l'image : elle
  grandit jusqu'à sa place dans la visionneuse, et en ressort à la fermeture.
  La liste se règle dans `renders.ts` (`spiral`).
- **Entrée de la salle** : volets fermés, décompte 3-2-1 d'amorce de film, les volets
  s'ouvrent, le faisceau s'allume en hésitant, le titre fait sa mise au point.
- **Un effet de texte par étape** : le nom monte lettre par lettre (accueil), mise au point
  (salle), glitch (rendus), décodage (projets), mots allumés au scroll (à propos), machine à
  écrire (contact). Jamais deux fois le même.
- **Fil des sections** : sur grand écran, six traits sur le bord droit ; celui de la section
  à l'écran s'allonge en braise et affiche son numéro.
- **Accueil** : cadre de visée et fiche du modèle, coordonnées et heure de Toulouse, deux
  orbites fines autour du modèle.
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

À faire : montrer le travail en grand, laisser respirer, des légendes en mono, du noir vrai.
À éviter : ombres portées, dégradés décoratifs dans l'UI, jauges de compétence en %,
jargon « RPG », plus d'un accent coloré par écran.
