"""Plush makeover on the otter: shared helpers go in once before the friends; the otter's fur test is replaced by them."""
import re
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
helpers = Path("src/plush.js").read_text(encoding="utf-8")
helpers = helpers.replace("V(", "PV(").replace("calm ? 8 : 14", 'matchMedia("(prefers-reduced-motion: reduce)").matches ? 8 : 14').replace("clamp(vy * 0.05, -0.07, 0.07)", "Math.min(0.07, Math.max(-0.07, vy * 0.05))")
helpers = "const PV = (x, y, z) => new THREE.Vector3(x, y, z);\n" + helpers
assert "function plushify" not in C
C = C.replace("\nfunction possum() {", "\n" + helpers + "\nfunction possum() {", 1)
a, b = C.index("function otter() {"), C.index("function sloth() {")
O = C[a:b]
i, j = O.index("// ---- soft fur:"), O.index("const pops = [];")
O = O[:i] + '''// ---- plush makeover: one seamless soft body per moving part, fur on it, felt face with button eyes and a stitched smile
const otterPlush = plushify({ groups: [body, head, tail, ...paws], face, fur, cream, ear: earMat });
eyes.forEach(e => e.visible = false);
face.children.forEach(o => { if (o.isMesh && o.material === dark) o.visible = false; });   // the old nose
const headPart = otterPlush.find(head), faceDir = V(0, 0, 1).applyQuaternion(face.quaternion);
const fp = (x, y, z) => face.position.clone().add(V(x, y, z).applyQuaternion(face.quaternion));   // face spot -> head space
for (const s of [-1, 1]) stickOn(headPart, buttonEye(0.85), fp(0.15 * s, 0.33, 0.12), faceDir);
const nose = new THREE.Mesh(ball, new THREE.MeshStandardMaterial({ color: 0x3b2a24, roughness: 1 })); nose.scale.set(0.075, 0.05, 0.045);
stickOn(headPart, nose, fp(0, 0.2, 0.44), faceDir, 0.025);
stickOn(headPart, stitchedSmile(), fp(0, 0.1, 0.42), faceDir, 0.006);
const otterMotion = plushMotion([[root, 16], [head, 8], [tail, 6], [paws[0], 12], [paws[1], 12]], body, root);

''' + O[j:]
assert O.count("  syncFur();\n") == 1
O = O.replace("  syncFur();\n", "  otterMotion(t); otterPlush.recolor();\n")
assert "syncFur" not in O and "furTex" not in O
p.write_text(C[:a] + O + C[b:], encoding="utf-8"); print("ok")
