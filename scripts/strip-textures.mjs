// Retire toutes les textures d'un .glb (les couleurs de base des matériaux restent).
// Usage : node scripts/strip-textures.mjs public/models/x.glb public/models/x.glb
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
const [input, output] = process.argv.slice(2);
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(input);
for (const m of doc.getRoot().listMaterials()) {
  console.log("matériau", m.getName(), "couleur", m.getBaseColorFactor().map((v) => v.toFixed(2)).join(","), "texture", !!m.getBaseColorTexture());
}
for (const tex of doc.getRoot().listTextures()) tex.dispose();
await io.write(output, doc);
