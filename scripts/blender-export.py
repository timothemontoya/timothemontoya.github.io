# Appelé par export-model.sh : exporte les objets visibles d'une scène Blender en .glb.
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
out = argv[0]
src = argv[1] if len(argv) > 1 and argv[1].endswith(".fbx") else None
opts = dict(a.split("=", 1) for a in argv[1:] if "=" in a)
exclude = set(filter(None, opts.get("exclude", "").split(",")))
include = set(filter(None, opts.get("include", "").split(",")))
# decimate=0.1 : garde ~10 % des faces des maillages lourds (> 20 000 faces).
decimate = float(opts.get("decimate", "1"))

if src:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=src)

for o in bpy.data.objects:
    try:
        o.select_set(False)
    except RuntimeError:
        pass

n = 0
for o in bpy.context.scene.objects:
    if o.type != "MESH" or o.hide_render or o.hide_get():
        continue
    if o.name in exclude or (include and o.name not in include):
        continue
    # Ignore les sols et fonds plats (4 faces ou moins).
    if o.name.lower().startswith(("plan", "plane", "grille")) and len(o.data.polygons) <= 4:
        continue
    if decimate < 1 and len(o.data.polygons) > 20000:
        mod = o.modifiers.new("web_decimate", "DECIMATE")
        mod.ratio = decimate
    o.select_set(True)
    n += 1

bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", use_selection=True, export_apply=True,
                          export_cameras=False, export_lights=False, export_yup=True)
print("EXPORTED", out, n)
