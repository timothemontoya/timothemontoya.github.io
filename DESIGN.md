# DESIGN.md — Timothé Montoya

Adapté de « Design System Inspired by Runway » (VoltAgent/awesome-design-md), réglé pour un
portfolio où **la 3D est le contenu principal**. Les rendus Blender et les modèles temps réel
remplacent la photographie cinéma de Runway.

## 1. Atmosphère

Une salle de projection. Fond noir profond, interface quasi invisible, l'image et la 3D occupent
l'écran. Les titres ressemblent à des génériques de film : serrés, très grands, interlignage 0.9–1.0.
Tout bouge lentement et avec inertie (scroll Lenis, interpolations `lerp`), jamais de rebond.

Caractéristiques :
- Rendus et modèles 3D en plein écran : c'est eux qui portent la couleur.
- Une seule famille de police : **Geist** (Geist Mono pour les micro-étiquettes).
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

Règles : jamais de graisse supérieure à 600. Les capitales ont toujours un espacement positif.

## 4. Composants

- **Boutons** : texte 14px graisse 500, bordure `--line`, rayon 999px réservé aux sélecteurs
  de la salle de projection. Les autres boutons ont un rayon de 6px. Au survol, le texte passe
  en `--fg` et la bordure s'éclaircit.
- **Cartes projet** : l'image *est* la carte, avec un rayon de 10px et un titre posé dessous.
  Au survol, l'image grossit lentement (scale 1.03 en 1.2s).
- **Navigation** : fixe, transparente, avec un dégradé noir très léger derrière. Logo
  « TM » en mono.
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
