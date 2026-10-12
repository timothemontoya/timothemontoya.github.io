# Portfolio — Timothé Montoya

Site personnel : modèles 3D en temps réel, rendus Blender et projets.
Next.js (export statique), React Three Fiber, Tailwind, Lenis.

## Développer

```bash
npm install
npm run dev        # http://localhost:3000
```

## Modifier le contenu

Tout le contenu est dans `src/content/` :

- `site.ts` : nom, présentation, liens de contact
- `models.ts` : modèles de la salle de projection
- `renders.ts` : rendus de la galerie et de la frise
- `projects.ts` : projets (une page est générée par projet)

Les fichiers (images, vidéos, `.glb`) vont dans `public/`.
Pour ajouter un modèle Blender : `./scripts/export-model.sh chemin/vers/modele.blend`.

Ne pas mettre de fichiers `.blend` dans ce dossier : les sources restent dans `../eportfolio-sources/`.

## Mettre en ligne

Chaque `git push` sur `main` construit et publie le site sur GitHub Pages
(`.github/workflows/deploy.yml`). Le design est décrit dans `DESIGN.md`.
