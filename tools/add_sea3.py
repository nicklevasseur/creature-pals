from pathlib import Path
C = Path("creature-pals.html").read_text(encoding="utf-8")
octo = Path("octopus-pal.html").read_text(encoding="utf-8")
head = octo.split("</script>\n<script>", 1)[1].split("// the octopus\n", 1)[0]
tail = Path("sea/common-tail.js").read_text(encoding="utf-8")
FRIENDS = [  # name, prefix, title, camera target height, buttons
  ("lobster", "l-", "Lobster Pal", 0.5, [("snip", "Snip snap"), ("dance", "Dance"), ("flip", "Tail flip"), ("wave", "Wave"), ("name", "Name me")]),
  ("manta", "m-", "Manta Ray Pal", 1.0, [("swoop", "Swoop"), ("backflip", "Backflip"), ("flap", "Big flap"), ("roll", "Roll"), ("name", "Name me")]),
]
def rep(a, b):
    global C
    assert C.count(a) == 1, a[:90]
    C = C.replace(a, b)
names = [f[0] for f in FRIENDS]
rep("body.otter, body.sloth, body.octopus { --pressed-ink: #ffffff; }\nbody.octopus {", "body.otter, body.sloth, body.monkey, body.octopus, body.lobster, body.manta { --pressed-ink: #ffffff; }\nbody.octopus, body.lobster, body.manta {")
rep('    <button id="to-octopus" aria-pressed="false">Octopus</button>', '    <button id="to-octopus" aria-pressed="false">Octopus</button>\n' + "\n".join(f'    <button id="to-{n}" aria-pressed="false">{t.replace(" Pal", "")}</button>' for n, _, t, _, _ in FRIENDS))
panels, funcs = "", ""
for n, pre, title, ty, btns in FRIENDS:
    rows = "\n".join(f'    <button id="{pre}b-{k}">{lab}</button>' for k, lab in btns)
    panels += f'<div class="panel" id="panel-{n}" hidden>\n  <div class="row">\n{rows}\n  </div>\n  <div class="row" id="{pre}colors" aria-label="Color"></div>\n  <div id="hint">Drag to spin me around. Tap me to say hi.</div>\n</div>\n'
    js = head.replace("controls.target.set(0, 0.9, 0)", f"controls.target.set(0, {ty}, 0)") + tail + Path(f"sea/{n}.js").read_text(encoding="utf-8")
    js = js.replace('getElementById("b-', f'getElementById("{pre}b-').replace('getElementById("colors")', f'getElementById("{pre}colors")')
    funcs += f"function {n}() {{{js}}}\n"
rep('<div class="panel" id="panel-gorilla" hidden>', panels + '<div class="panel" id="panel-gorilla" hidden>')
rep('["#giraffe", "#gorilla", "#otter", "#sloth", "#octopus"]', '["#giraffe", "#gorilla", "#otter", "#sloth", "#monkey", "#octopus", "#lobster", "#manta"]')
rep('for (const w of ["giraffe", "gorilla", "otter", "sloth", "octopus"])', 'for (const w of ["giraffe", "gorilla", "otter", "sloth", "monkey", "octopus", "lobster", "manta"])')
assert C.count('"sloth", "octopus"])') == 2
C = C.replace('"sloth", "octopus"])', '"sloth", "monkey", "octopus", "lobster", "manta"])')
rep('octopus: "Octopus Pal" }[who];', 'octopus: "Octopus Pal", monkey: "Monkey Pal", lobster: "Lobster Pal", manta: "Manta Ray Pal" }[who];')
rep("({ possum, giraffe, gorilla, otter, sloth, octopus })[who]();", funcs + "({ possum, giraffe, gorilla, otter, sloth, monkey, octopus, lobster, manta })[who]();")
rep('  if (who === "octopus") {', '''  if (who === "lobster") {       // clicky claws, a little boogie tune
    if (name === "snip") for (let i = 0; i < 9; i++) clack(0.1 + i * 0.225);
    if (name === "dance") for (let i = 0; i < 12; i++) { tone([392, 494, 587, 494][i % 4], [392, 494, 587, 494][i % 4], 0.14, "square", 0.07, i * 0.26); clack(i * 0.26 + 0.13); }
    if (name === "flip") { whoosh(0, 0.6); tone(700, 250, 0.4, "sine", 0.12, 0); thud(0.7, 1.3); for (let i = 0; i < 8; i++) noise(0.04, 3500, 0.08, 1.0 + i * 0.18, 4); }
    if (name === "wave") { squeak(0, 1.1); for (let i = 0; i < 4; i++) clack(0.3 + i * 0.35); }
    if (name === "hop") { clack(0); clack(0.1); boing(0.15, 1.2); sparkle(0.7); }
    if (name === "shake") for (let i = 0; i < 6; i++) clack(i * 0.12);
    return;
  }
  if (who === "manta") {         // soft whooshes, like wings through water
    const swish = (at, dur = 0.5) => noise(dur, 500, 0.12, at, 0.6, 1400);
    if (name === "swoop") { for (let i = 0; i < 4; i++) swish(i * 1.2, 1.0); tone(400, 800, 2.4, "sine", 0.05, 0.3); tone(800, 400, 2.0, "sine", 0.05, 2.7); }
    if (name === "backflip") { swish(0, 1.2); tone(300, 900, 1.2, "sine", 0.08, 0.2); sparkle(2.1); }
    if (name === "flap") for (let i = 0; i < 4; i++) swish(i * 0.52, 0.35);
    if (name === "roll") { swish(0, 1.5); squeak(1.5, 1.2); }
    if (name === "hop") { voice(330, 0.6, 0, 0.12, 900); swish(0.1, 0.8); sparkle(0.9); }
    if (name === "shake") for (let i = 0; i < 4; i++) swish(i * 0.2, 0.2);
    return;
  }
  if (who === "octopus") {''')
Path("creature-pals.html").write_text(C, encoding="utf-8")
print("ok", len(C))
