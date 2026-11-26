"""Whale tail: taper the body into the tail so it reads as one piece (2026-11-26)."""
from pathlib import Path
R = Path(__file__).resolve().parent.parent
OLD = """const tail1 = new THREE.Group(); tail1.position.set(0, 0.05, -1.0); body.add(tail1);
part(ball, skin, tail1, 0, 0, -0.3, 0.36, 0.32, 0.55);
const tail2 = new THREE.Group(); tail2.position.set(0, 0, -0.75); tail1.add(tail2);
part(ball, skin, tail2, 0, 0, -0.15, 0.16, 0.14, 0.28);
"""
NEW = """part(ball, skin, body, 0, 0.03, -0.75, 0.55, 0.48, 0.7);                      // the body tapers toward the tail
// each tail piece starts inside the one before it, a little narrower, so the tail flows out of the body with no joins
const tail1 = new THREE.Group(); tail1.position.set(0, 0.04, -1.0); body.add(tail1);
part(ball, skin, tail1, 0, 0, -0.2, 0.4, 0.35, 0.6);
part(ball, skin, tail1, 0, 0, -0.6, 0.24, 0.21, 0.45);
const tail2 = new THREE.Group(); tail2.position.set(0, 0, -0.75); tail1.add(tail2);
part(ball, skin, tail2, 0, 0, -0.1, 0.2, 0.17, 0.32);
"""
for p in (R / "sea" / "whale.js", R / "src" / "creature-pals.html"):
    t = p.read_text(encoding="utf-8"); assert t.count(OLD) == 1, p
    p.write_text(t.replace(OLD, NEW), encoding="utf-8"); print("updated", p.name)
