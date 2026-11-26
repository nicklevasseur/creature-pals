"""The plush otter, built in Blender for comparison with the web version.

    blender.exe --background --python blender/otter.py -- [out.png] [samples]

Z is up. The otter floats on its back along Y: tail toward the camera, head at the far end, raised and looking at the
viewer over its tummy, holding its rock. One smooth body from metaballs, fur from hair particles (none on the felt
face), button eyes, a felt nose and a stitched smile.
"""
import math, sys
from pathlib import Path
import bpy, bmesh
from mathutils import Vector

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(args[0]) if args else Path(__file__).with_name("otter.png")
SAMPLES = int(args[1]) if len(args) > 1 else 48

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def mat(name, color, rough=0.8, metal=0.0, sheen=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    for key in ("Sheen Weight", "Sheen"):
        if key in b.inputs: b.inputs[key].default_value = sheen; break
    return m

FUR, CREAM = (0.30, 0.16, 0.07), (0.86, 0.74, 0.58)
fur_m, cream_m = mat("Fur", FUR, 0.9, sheen=0.6), mat("Cream", CREAM, 0.9, sheen=0.6)
felt_m = mat("Felt", (0.93, 0.84, 0.70), 1.0, sheen=0.4)
button_m = mat("Button", (0.015, 0.012, 0.02), 0.12)
thread_m = mat("Thread", (0.9, 0.85, 0.75), 1.0)
nose_m = mat("Nose", (0.13, 0.08, 0.06), 1.0, sheen=0.3)
rock_m = mat("Rock", (0.30, 0.29, 0.28), 0.45)

# ---- one smooth body: overlapping shapes fused into one mesh, then the joins smoothed like a stuffed toy
H = Vector((0, 1.0, 0.80))                                   # head centre
CAM = Vector((2.1, -4.1, 3.7))
look = (CAM - H).normalized()                 # the face looks at the camera
right = (Vector((1, 0, 0)) - look * look.x).normalized(); upv = look.cross(right).normalized()   # face axes
SHAPES = [((0, 0, 0.36), (0.55, 1.05, 0.36)),               # body
          ((0, -0.05, 0.48), (0.44, 0.82, 0.24)),            # tummy
          (tuple(H), (0.42, 0.38, 0.38)),                    # head
          (tuple(H + look * 0.30 - upv * 0.10), (0.20, 0.16, 0.15)),     # muzzle
          ((0, 0.72, 0.62), (0.30, 0.26, 0.26))]             # neck
for s in (-1, 1):
    SHAPES += [(tuple(H + Vector((0.29 * s, 0.06, 0.27))), (0.085, 0.06, 0.08)),    # ears
               ((0.30 * s, -1.0, 0.36), (0.15, 0.25, 0.11))]                          # back feet
    for i in range(5):                                       # arms, shoulder to paw on the rock
        t = i / 4; c = Vector((0.40 * s, 0.40, 0.56)).lerp(Vector((0.16 * s, -0.16, 0.80)), t)
        SHAPES.append((tuple(c), (0.10, 0.10, 0.10) if i < 4 else (0.11, 0.10, 0.08)))
for i in range(5):
    t = i / 4; SHAPES.append(((0, -1.0 - 0.22 * i, 0.31 - 0.04 * i), (0.17 - 0.05 * t, 0.20, 0.09 - 0.03 * t)))   # tail
parts = []
for c, r in SHAPES:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=c); o = bpy.context.object; o.scale = r; parts.append(o)
bpy.ops.object.select_all(action="DESELECT")
for o in parts: o.select_set(True)
bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join(); ot = bpy.context.object; ot.name = "OtterMesh"
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
rm = ot.modifiers.new("fuse", "REMESH"); rm.mode = "VOXEL"; rm.voxel_size = 0.016; rm.adaptivity = 0.0
bpy.ops.object.modifier_apply(modifier="fuse")
sm = ot.modifiers.new("soften", "SMOOTH"); sm.factor = 1.0; sm.iterations = 18
bpy.ops.object.modifier_apply(modifier="soften")
mesh = ot.data
for p in mesh.polygons: p.use_smooth = True
ot.data.materials.append(fur_m); ot.data.materials.append(cream_m); ot.data.materials.append(felt_m)

# ---- regions: cream tummy, felt face (no fur), brown elsewhere; vertex groups steer where fur grows
def inside(p, c, r): return sum(((p[i] - c[i]) / r[i]) ** 2 for i in range(3)) < 1
TUMMY = ((0, -0.15, 0.55), (0.42, 0.88, 0.42))
FACE = (tuple(H + look * 0.30 - upv * 0.07), (0.33, 0.33, 0.33))
vg_fur, vg_cream = ot.vertex_groups.new(name="fur"), ot.vertex_groups.new(name="cream")
for v in mesh.vertices:
    if inside(v.co, *FACE): continue
    (vg_cream if inside(v.co, *TUMMY) else vg_fur).add([v.index], 1.0, "REPLACE")
for p in mesh.polygons:
    c = p.center
    p.material_index = 2 if inside(c, *FACE) else 1 if inside(c, *TUMMY) else 0

def fur(name, group, slot, count, length):
    m = ot.modifiers.new(name, "PARTICLE_SYSTEM"); ps = m.particle_system; st = ps.settings
    st.type = "HAIR"; st.count = count; st.hair_length = length; st.use_advanced_hair = True
    st.child_type = "INTERPOLATED"
    for names, value in [(("child_percent", "child_nbr"), 3), (("rendered_child_count",), 12), (("child_length",), 0.9),
                         (("root_radius",), 1.0), (("tip_radius",), 0.0), (("radius_scale",), 0.0045),
                         (("roughness_2",), 0.025), (("roughness_endpoint",), 0.01), (("clump_factor",), 0.2)]:
        for n in names:          # setting names move between Blender versions
            if hasattr(st, n): setattr(st, n, value); break
        else: print("skipped hair setting", names)
    st.material_slot = slot
    ps.vertex_group_density = group; ps.vertex_group_length = group
    st.display_step = 3; st.render_step = 4
fur("FurBrown", "fur", "Fur", 22000, 0.055)
fur("FurCream", "cream", "Cream", 9000, 0.045)

# ---- face details stuck onto the felt: button eyes with a thread cross, felt nose, stitched smile
def surface(origin, direction):
    """Where a ray from origin along direction meets the otter, and the surface normal there."""
    ok, loc, nrm, _ = ot.ray_cast(Vector(origin), Vector(direction).normalized())
    return (loc, nrm) if ok else (Vector(origin), -Vector(direction))
def place(obj, origin, direction, lift=0.0):
    loc, nrm = surface(origin, direction)
    obj.location = loc + nrm * lift; obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(nrm)
for s in (-1, 1):
    o = H + right * (0.14 * s) + upv * 0.12 + look * 1.2
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.058, depth=0.022); eye = bpy.context.object
    eye.data.materials.append(button_m); bpy.ops.object.shade_smooth(); place(eye, o, -look, 0.008)
    bpy.ops.object.modifier_add(type="BEVEL"); eye.modifiers[-1].width = 0.008; eye.modifiers[-1].segments = 3
    for r in (0.785, -0.785):
        bpy.ops.mesh.primitive_cube_add(size=1); t = bpy.context.object; t.scale = (0.035, 0.006, 0.006)
        t.data.materials.append(thread_m); t.parent = eye; t.location = (0, 0, 0.013); t.rotation_euler = (0, 0, r)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=32, ring_count=16); nose = bpy.context.object
nose.scale = (0.07, 0.05, 0.045); nose.data.materials.append(nose_m); bpy.ops.object.shade_smooth()
place(nose, H - upv * 0.04 + look * 1.2, -look, 0.02); nose.scale = (0.07, 0.045, 0.05)
for s in (-1, 1):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.032, minor_radius=0.006, major_segments=24, minor_segments=8); a = bpy.context.object
    a.data.materials.append(nose_m)
    loc, nrm = surface(H + right * (0.033 * s) - upv * 0.13 + look * 1.2, -look); a.location = loc + nrm * 0.004
    from mathutils import Matrix
    a.rotation_mode = "QUATERNION"; a.rotation_quaternion = Matrix((right, upv, look)).transposed().to_quaternion()
    bm = bmesh.new(); bm.from_mesh(a.data); bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.y > 0.001], context="VERTS"); bm.to_mesh(a.data); bm.free()

# ---- the rock on its tummy, the water, light and camera
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=0.17, location=(0, -0.22, 0.86)); rock = bpy.context.object
rock.scale = (1.0, 1.15, 0.75); rock.data.materials.append(rock_m); bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, 0.18)); water = bpy.context.object
wm = mat("Water", (0.10, 0.45, 0.60), 0.08); wm.node_tree.nodes["Principled BSDF"].inputs["IOR"].default_value = 1.33
water.data.materials.append(wm)
nt = wm.node_tree; nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 6.0
bump = nt.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.15
nt.links.new(nz.outputs["Fac"], bump.inputs["Height"]); nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])
w = sc.world or bpy.data.worlds.new("World"); sc.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs[0].default_value = (0.55, 0.78, 0.92, 1); w.node_tree.nodes["Background"].inputs[1].default_value = 0.9
bpy.ops.object.light_add(type="SUN", location=(3, -2, 6)); sun = bpy.context.object; sun.data.energy = 3.2; sun.data.angle = math.radians(8)
sun.rotation_euler = (math.radians(40), math.radians(15), math.radians(30))
bpy.ops.object.camera_add(location=CAM); cam = bpy.context.object; sc.camera = cam
cam.data.lens = 50
target = Vector((0, 0.35, 0.66)); cam.rotation_mode = "QUATERNION"; cam.rotation_quaternion = (target - cam.location).to_track_quat("-Z", "Y")

# ---- render
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = 1000, 800; sc.render.film_transparent = False
sc.view_settings.view_transform = "AgX" if "AgX" in [t.identifier for t in sc.view_settings.bl_rna.properties["view_transform"].enum_items] else "Filmic"
sc.render.filepath = str(OUT)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT.with_suffix(".blend")))
bpy.ops.render.render(write_still=True)
print("RENDERED", OUT, "faces", len(mesh.polygons))
