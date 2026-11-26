"""Add the crab, tarantula, chicken and pigeon to src/creature-pals.html."""
from pathlib import Path
R = Path(__file__).resolve().parent.parent
p = R / "src" / "creature-pals.html"; C = p.read_text(encoding="utf-8")
octo = (R / "tools" / "octopus-pal.html").read_text(encoding="utf-8")
sea_head = octo.split("</script>\n<script>", 1)[1].split("// the octopus\n", 1)[0]
land_head = (R / "sea" / "land-head.js").read_text(encoding="utf-8")
tail = (R / "sea" / "common-tail.js").read_text(encoding="utf-8")
NEW = [  # id, prefix, menu name, head, camera target, buttons
  ("crab", "r-", "Crab", sea_head, ("controls.target.set(0, 0.9, 0)", "controls.target.set(0, 0.5, 0)"), [("side", "Sidestep"), ("snip", "Snip snap"), ("dig", "Dig"), ("bubbles", "Bubbles"), ("name", "Name me")]),
  ("tarantula", "u-", "Tarantula", land_head, ("controls.target.set(0, 1.4, 0)", "controls.target.set(0, 0.55, 0)"), [("wave", "Wave"), ("dance", "Tap dance"), ("burrow", "Burrow"), ("jump", "Jump"), ("name", "Name me")]),
  ("chicken", "h-", "Chicken", land_head, ("controls.target.set(0, 1.4, 0)", "controls.target.set(0, 0.9, 0)"), [("egg", "Lay an egg"), ("peck", "Peck"), ("flap", "Flap"), ("dance", "Chicken dance"), ("name", "Name me")]),
  ("pigeon", "q-", "Pigeon", land_head, ("controls.target.set(0, 1.4, 0)", "controls.target.set(0, 0.85, 0)"), [("coo", "Coo"), ("strut", "Strut"), ("fly", "Fly"), ("snack", "Snack"), ("name", "Name me")]),
]
def rep(a, b):
    global C
    assert C.count(a) == 1, a[:90]; C = C.replace(a, b)
for n, *_ in NEW: assert f"function {n}()" not in C, n
rep('"Octopus"], ["lobster", "Lobster"], ["manta", "Manta Ray"]];',
    '"Octopus"], ["crab", "Crab"], ["lobster", "Lobster"], ["manta", "Manta Ray"]];')
rep('["monkey", "Monkey"],\n', '["monkey", "Monkey"],\n  ["chicken", "Chicken"], ["pigeon", "Pigeon"], ["tarantula", "Tarantula"],\n')
rep("body.otter, body.sloth, body.monkey, body.octopus, body.lobster, body.manta { --pressed-ink: #ffffff; }",
    "body.otter, body.sloth, body.monkey, body.octopus, body.lobster, body.manta, body.crab, body.tarantula, body.chicken, body.pigeon { --pressed-ink: #ffffff; }")
rep("}\nbody.octopus, body.lobster, body.manta {", """}
body.tarantula {
  --sky-top: #5b3f8c; --sky-bot: #f7a35c; --accent: #d9531e; --ink: #3a1f14; --ink-soft: #5a3524; --say: #fff3e0;
  --chip: rgba(255,255,255,.62); --title: #ffffff; --title-shadow: rgba(60,20,60,.45); --swatch-ring: rgba(255,255,255,.9);
  color-scheme: light;
}
body.chicken {
  --sky-top: #6fc3f0; --sky-bot: #e8f7ff; --accent: #e2453b; --ink: #3a2a14; --ink-soft: #5e4628; --say: #3a2a14;
  --chip: rgba(255,255,255,.66); --title: #ffffff; --title-shadow: rgba(30,80,120,.4); --swatch-ring: rgba(255,255,255,.9);
  color-scheme: light;
}
body.pigeon {
  --sky-top: #9cc8ea; --sky-bot: #f2efe8; --accent: #4f74a3; --ink: #26313f; --ink-soft: #46546a; --say: #26313f;
  --chip: rgba(255,255,255,.66); --title: #ffffff; --title-shadow: rgba(40,60,90,.4); --swatch-ring: rgba(255,255,255,.9);
  color-scheme: light;
}
body.octopus, body.lobster, body.manta, body.crab {""")
panels, funcs = "", ""
for n, pre, label, head, (tfrom, tto), btns in NEW:
    rows = "\n".join(f'    <button id="{pre}b-{k}">{lab}</button>' for k, lab in btns)
    panels += f'<div class="panel" id="panel-{n}" hidden>\n  <div class="row">\n{rows}\n  </div>\n  <div class="row" id="{pre}colors" aria-label="Color"></div>\n  <div id="hint">Drag to spin me around. Tap me to say hi.</div>\n</div>\n'
    assert head.count(tfrom) == 1, (n, tfrom)
    js = head.replace(tfrom, tto) + tail + (R / "sea" / f"{n}.js").read_text(encoding="utf-8")
    js = js.replace('getElementById("b-', f'getElementById("{pre}b-').replace('getElementById("colors")', f'getElementById("{pre}colors")')
    funcs += f"function {n}() {{{js}}}\n"
rep('<div class="panel" id="panel-gorilla" hidden>', panels + '<div class="panel" id="panel-gorilla" hidden>')
rep("({ possum, giraffe, gorilla, otter, sloth, monkey, octopus, lobster, manta })[who]();",
    funcs + "({ possum, giraffe, gorilla, otter, sloth, monkey, octopus, lobster, manta, crab, tarantula, chicken, pigeon })[who]();")
rep('  if (who === "monkey") {', '''  if (who === "chicken") {       // clucks and bawks, wing flutters
    const cluck = (at, f = 520) => { voice(f, 0.09, at, 0.2, 1700); noise(0.03, 2600, 0.08, at, 3); };
    const flutter = (at, n = 8) => { for (let i = 0; i < n; i++) noise(0.05, 1800, 0.12, at + i * 0.08, 2); };
    if (name === "egg") { voice(300, 0.5, 0.1, 0.12, 600); voice(330, 0.5, 0.8, 0.12, 600); cluck(1.5, 560); cluck(1.7, 600); voice(720, 0.35, 2.05, 0.22, 2000); sparkle(2.2); }
    if (name === "peck") for (let i = 0; i < 10; i++) { tone(1800, 1400, 0.03, "square", 0.05, 0.3 + i * 0.22); if (i % 3 === 0) cluck(0.4 + i * 0.22); }
    if (name === "flap") { flutter(0, 20); cluck(0.4, 640); cluck(1.2, 600); }
    if (name === "dance") for (let i = 0; i < 14; i++) { tone([523, 523, 587, 659][i % 4], [523, 523, 587, 659][i % 4], 0.14, "square", 0.07, i * 0.25); if (i % 2) cluck(i * 0.25 + 0.1, 600); }
    if (name === "hop") { cluck(0, 600); flutter(0.05, 6); boing(0.1, 1.2); }
    if (name === "shake") flutter(0, 6);
    return;
  }
  if (who === "pigeon") {        // soft coos and wing claps
    const coo = (at, f = 320, d = 0.45) => voice(f, d, at, 0.17, 480);
    const flutter = (at, n = 8) => { for (let i = 0; i < n; i++) noise(0.06, 1400, 0.12, at + i * 0.09, 1.5); };
    if (name === "coo") { coo(0.05, 300, 0.35); coo(0.45, 360, 0.55); coo(1.1, 300, 0.6); }
    if (name === "strut") { for (let i = 0; i < 12; i++) tone(500, 300, 0.04, "sine", 0.06, i * 0.28); coo(1.5, 320); }
    if (name === "fly") { flutter(0, 12); whoosh(1.0, 1.5); whoosh(2.5, 1.5); flutter(4.1, 8); }
    if (name === "snack") for (let i = 0; i < 9; i++) tone(1600, 1200, 0.03, "square", 0.05, 0.3 + i * 0.25);
    if (name === "hop") { coo(0, 380, 0.3); flutter(0.05, 5); sparkle(0.6); }
    if (name === "shake") flutter(0, 5);
    return;
  }
  if (who === "crab") {          // clicky claws, scuttles, bubbles
    const bloop = (at, f = 500) => tone(f, f * 1.8, 0.09, "sine", 0.16, at);
    if (name === "side") for (let i = 0; i < 24; i++) noise(0.025, 3800, 0.08, i * 0.13, 5);
    if (name === "snip") for (let i = 0; i < 9; i++) clack(0.1 + i * 0.225);
    if (name === "dig") { noise(1.0, 700, 0.2, 0.1, 0.8, 300); squeak(1.7, 1.1); boing(2.5, 1.2); }
    if (name === "bubbles") for (let i = 0; i < 14; i++) bloop(i * 0.18, 400 + (i % 5) * 90);
    if (name === "hop") { clack(0); clack(0.1); boing(0.15, 1.2); sparkle(0.7); }
    if (name === "shake") for (let i = 0; i < 6; i++) clack(i * 0.12);
    return;
  }
  if (who === "tarantula") {     // soft little feet, gentle and friendly
    const patter = (at, n = 8, gap = 0.07) => { for (let i = 0; i < n; i++) noise(0.02, 4200, 0.06, at + i * gap, 6); };
    if (name === "wave") { squeak(0.1, 0.9); squeak(0.35, 1.1); sparkle(0.8); }
    if (name === "dance") for (let i = 0; i < 16; i++) { patter(i * 0.2, 2, 0.05); tone([392, 494, 587, 494][i % 4], [392, 494, 587, 494][i % 4], 0.12, "triangle", 0.07, i * 0.2); }
    if (name === "burrow") { patter(0, 14); noise(0.8, 600, 0.12, 1.0, 0.8, 250); squeak(1.9, 1.2); patter(3.0, 14); }
    if (name === "jump") { tone(200, 700, 0.3, "sine", 0.15, 0.3); patter(1.15, 4); }
    if (name === "hop") { boing(0, 1.2); sparkle(0.6); }
    if (name === "shake") patter(0, 10, 0.05);
    return;
  }
  if (who === "monkey") {''')
rep('lobster: "amb-underwater", manta: "amb-underwater" };', 'lobster: "amb-underwater", manta: "amb-underwater", crab: "amb-underwater" };')
rep('const SEA = ["octopus", "lobster", "manta"];', 'const SEA = ["octopus", "lobster", "manta", "crab"];\nSAMPLES["crab:bubbles"] = [["bubble", 0.1, 0.7], ["bubble", 0.7, 0.6, 1.2], ["bubble", 1.4, 0.6, 0.9]]; SAMPLES["crab:dig"] = [["swirl", 0.1, 0.5, 1.4]];')
p.write_text(C, encoding="utf-8"); print("four friends added")
