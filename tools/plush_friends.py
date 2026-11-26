"""Give the other eight friends the plush makeover via plushAll."""
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
def once(a, b):
    global C
    assert C.count(a) == 1, a[:70]; C = C.replace(a, b)
once("function plushAll(root, { mats, felt = () => false }) {", "function plushAll(root, { mats, felt = () => false, keep = [] }) {")
once("const absorb = o => o.isMesh && o.visible && lens.has(o.material)", "const absorb = o => o.isMesh && o.visible && !keep.includes(o) && lens.has(o.material)")
CFG = {
 "possum":  ('root', '[[fur, 0.05], [face, 0], [pink, 0]]', 'keep: [nose]', 'eyes', 1.0, '[smile]'),
 "giraffe": ('root', '[[coat, 0.03], [spotMat, 0.03], [cream, 0], [hoof, 0]]', 'keep: [muzzle]', 'eyes', 1.0, '[smile]'),
 "gorilla": ('root', '[[fur, 0.05], [silver, 0.05], [skin, 0]]', 'keep: [brow]', 'eyes', 0.9, '[]'),
 "sloth":   ('root', '[[fur, 0.06], [faceMat, 0], [mask, 0]]', '', 'eyes', 0.75, '[mouth]'),
 "monkey":  ('root', '[[fur, 0.045], [face, 0]]', '', 'eyes', 0.8, '[smile]'),
 "octopus": ('root', '[[skin, 0.012], [pale, 0.012], [spotMat, 0.012]]', '', 'eyes', 1.15, '[smile]'),
 "lobster": ('root', '[[shell, 0.01], [pale, 0.01]]', '', None, 0, '[]'),
 "manta":   ('root', '[[skin, 0.012], [belly, 0.012]]', '', 'eyes', 0.8, '[smile]'),
}
names = list(CFG) + ["otter"]
for n, (root, mats, extra, eyes, size, decor) in CFG.items():
    s = C.index(f"\nfunction {n}() {{"); e = min([C.index(f"\nfunction {m}() {{") for m in names if C.index(f"\nfunction {m}() {{") > s] + [C.index("({ possum,")])
    body = C[s:e]; assert body.count("\nfunction frame() {") == 1, n
    setup = (f"\n// plush makeover (2026-11-26): seamless soft shapes, fur or short pile, felt faces, button eyes\n"
             f"const plush = plushAll({root}, {{ mats: {mats}{', ' + extra if extra else ''} }});\n"
             + (f"plush.buttons({eyes}, {size});\n" if eyes else "")
             + (f"plush.resurface({decor});\n" if decor != "[]" else ""))
    body = body.replace("\nfunction frame() {", setup + "function frame() {\n  plush.recolor();", 1)
    C = C[:s] + body + C[e:]
p.write_text(C, encoding="utf-8"); print("8 friends wired")
