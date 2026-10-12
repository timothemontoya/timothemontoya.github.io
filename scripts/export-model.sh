#!/usr/bin/env bash
# Exporte un fichier Blender en modèle web compressé dans public/models/.
#
#   ./scripts/export-model.sh ~/chemin/mon_modele.blend
#   ./scripts/export-model.sh ~/chemin/scene.blend exclude=Sol,Fond      # ignore des objets
#   ./scripts/export-model.sh ~/chemin/scene.blend include=Corps,Yeux    # garde seulement ceux-là
#   ./scripts/export-model.sh ~/chemin/lourd.blend decimate=0.1          # allège les maillages très denses
#
# Ensuite, ajouter une entrée dans src/content/models.ts.
set -euo pipefail
src="$1"; shift || true
name="$(basename "${src%.*}" | tr 'A-Z' 'a-z')"
root="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

if [[ "$src" == *.fbx ]]; then
  blender -b --python "$root/scripts/blender-export.py" -- "$tmp/$name.glb" "$src" "$@"
else
  blender -b "$src" --python "$root/scripts/blender-export.py" -- "$tmp/$name.glb" "$@"
fi

npx gltf-transform optimize "$tmp/$name.glb" "$root/public/models/$name.glb" \
  --compress meshopt --texture-compress webp --texture-size 1024 \
  --simplify-ratio 0.5 --simplify-error 0.001

echo "OK : public/models/$name.glb ($(du -h "$root/public/models/$name.glb" | cut -f1))"
