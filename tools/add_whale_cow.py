"""Add the whale (sea) and the cow (farm pasture) to src/creature-pals.html."""
from pathlib import Path
R = Path(__file__).resolve().parent.parent
p = R / "src" / "creature-pals.html"; C = p.read_text(encoding="utf-8")
octo = (R / "tools" / "octopus-pal.html").read_text(encoding="utf-8")
sea_head = octo.split("</script>\n<script>", 1)[1].split("// the octopus\n", 1)[0]
land_head = (R / "sea" / "land-head.js").read_text(encoding="utf-8")
tail = (R / "sea" / "common-tail.js").read_text(encoding="utf-8")
RENDER = "const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });"
GENLINE = RENDER + "\nconst myGen = ++GEN; CLEANUP = () => { renderer.dispose(); renderer.forceContextLoss(); };"
NEW = [  # id, prefix, head, extra (habitat file read before the body), camera target, buttons
  ("whale", "w-", sea_head, None, ("controls.target.set(0, 0.9, 0)", "controls.target.set(0, 1.3, 0)"),
   [("spout", "Spout"), ("sing", "Sing"), ("breach", "Breach"), ("wave", "Wave"), ("name", "Name me")]),
  ("cow", "v-", land_head, "pasture.js", ("controls.target.set(0, 1.4, 0)", "controls.target.set(0, 1.1, 0)"),
   [("moo", "Moo"), ("munch", "Munch"), ("jump", "Jump over the moon"), ("bell", "Ring bell"), ("name", "Name me")]),
]
def rep(a, b):
    global C
    assert C.count(a) == 1, a[:90]; C = C.replace(a, b)
for n, *_ in NEW: assert f"function {n}()" not in C, n
rep('["chicken", "Chicken"], ', '["chicken", "Chicken"], ["cow", "Cow"], ')
rep('["manta", "Manta Ray"]];', '["manta", "Manta Ray"], ["whale", "Whale"]];')
rep("body.crab, body.tarantula, body.chicken, body.pigeon { --pressed-ink: #ffffff; }",
    "body.crab, body.tarantula, body.chicken, body.pigeon, body.whale, body.cow { --pressed-ink: #ffffff; }")
rep("body.chicken {", "body.chicken, body.cow {")
rep("body.octopus, body.lobster, body.manta, body.crab {", "body.octopus, body.lobster, body.manta, body.crab, body.whale {")
panels, funcs = "", ""
for n, pre, head, extra, (tfrom, tto), btns in NEW:
    rows = "\n".join(f'    <button id="{pre}b-{k}">{lab}</button>' for k, lab in btns)
    panels += f'<div class="panel" id="panel-{n}" hidden>\n  <div class="row">\n{rows}\n  </div>\n  <div class="row" id="{pre}colors" aria-label="Color"></div>\n  <div id="hint">Drag to spin me around. Tap me to say hi.</div>\n</div>\n'
    assert head.count(tfrom) == 1 and head.count(RENDER) == 1, n
    t2 = tail.replace('addEventListener("resize", resize); resize();', 'addEventListener("resize", () => myGen === GEN && resize()); resize();')
    js = head.replace(tfrom, tto).replace(RENDER, GENLINE) + (( R / "sea" / extra).read_text(encoding="utf-8") if extra else "") + t2 + (R / "sea" / f"{n}.js").read_text(encoding="utf-8")
    js = js.replace('getElementById("b-', f'getElementById("{pre}b-').replace('getElementById("colors")', f'getElementById("{pre}colors")')
    funcs += f"function {n}() {{{js}}}\n"
rep('<div class="panel" id="panel-gorilla" hidden>', panels + '<div class="panel" id="panel-gorilla" hidden>')
rep("const FRIEND_FNS = { possum, giraffe, gorilla, otter, sloth, monkey, octopus, lobster, manta, crab, tarantula, chicken, pigeon };",
    funcs + "const FRIEND_FNS = { possum, giraffe, gorilla, otter, sloth, monkey, octopus, lobster, manta, crab, tarantula, chicken, pigeon, whale, cow };")
rep('  if (who === "chicken") {', '''  if (who === "whale") {         // deep, gentle whale sounds
    const hum = (at, f0, f1, d) => { tone(f0, f1, d, "sine", 0.14, at); tone(f0 * 1.5, f1 * 1.5, d, "sine", 0.04, at); };
    if (name === "spout") { noise(1.2, 900, 0.25, 0.3, 0.6, 2400); whoosh(0.3, 1.0); }
    if (name === "sing") { hum(0, 180, 320, 1.0); hum(1.0, 320, 220, 0.9); hum(2.0, 260, 400, 1.2); }
    if (name === "breach") { whoosh(0.3, 1.0); hum(0.4, 200, 500, 0.8); splash(2.25, 1.6); }
    if (name === "wave") { hum(0, 260, 340, 0.5); sparkle(0.6); }
    if (name === "hop") { hum(0, 240, 420, 0.5); sparkle(0.7); }
    if (name === "shake") for (let i = 0; i < 4; i++) noise(0.2, 600, 0.12, i * 0.2, 0.6);
    return;
  }
  if (who === "cow") {           // moos and a cowbell
    const moo = (at, f = 150, d = 1.0) => voice(f, d, at, 0.2, 650);
    const ding = at => { tone(1320, 1320, 0.5, "triangle", 0.14, at); tone(1980, 1980, 0.35, "sine", 0.06, at); };
    if (name === "moo") moo(0.15, 140, 1.4);
    if (name === "munch") for (let i = 0; i < 12; i++) chomp(0.6 + i * 0.2);
    if (name === "jump") { whoosh(0.3, 1.0); boing(0.4, 0.8); sparkle(1.2); thud(2.0, 1.2); ding(2.05); }
    if (name === "bell") for (let i = 0; i < 6; i++) ding(i * 0.25);
    if (name === "hop") { moo(0, 170, 0.5); boing(0.1, 1.0); ding(0.8); }
    if (name === "shake") { ding(0); ding(0.2); }
    return;
  }
  if (who === "chicken") {''')
rep('chicken: "amb-farm",', 'chicken: "amb-farm", cow: "amb-farm", whale: "amb-underwater",')
rep('const SEA = ["octopus", "lobster", "manta", "crab"];', 'const SEA = ["octopus", "lobster", "manta", "crab", "whale"];')
p.write_text(C, encoding="utf-8"); print("whale and cow added")
