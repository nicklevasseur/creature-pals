from pathlib import Path
C = Path("creature-pals.html").read_text(encoding="utf-8")
tail = Path("sea/common-tail.js").read_text(encoding="utf-8")
def rep(a, b):
    global C
    assert C.count(a) == 1, a[:90]; C = C.replace(a, b)
js = Path("sea/monkey-head.js").read_text(encoding="utf-8") + tail + Path("sea/monkey.js").read_text(encoding="utf-8")
js = js.replace('getElementById("b-', 'getElementById("y-b-').replace('getElementById("colors")', 'getElementById("y-colors")')
rep("}\nbody.octopus, body.lobster, body.manta {", """}
body.monkey {
  --sky-top: #5fc3d6; --sky-bot: #fff1b8; --accent: #d9661c; --ink: #3a2412; --ink-soft: #5e4228; --say: #3a2412;
  --chip: rgba(255,255,255,.62); --title: #ffffff; --title-shadow: rgba(90,50,10,.4); --swatch-ring: rgba(255,255,255,.9);
  color-scheme: light;
}
body.octopus, body.lobster, body.manta {""")
rep('    <button id="to-octopus" aria-pressed="false">Octopus</button>', '    <button id="to-monkey" aria-pressed="false">Monkey</button>\n    <button id="to-octopus" aria-pressed="false">Octopus</button>')
btns = [("swing", "Swing"), ("peek", "Peekaboo"), ("ooh", "Ooh ooh ah ah"), ("cart", "Cartwheel"), ("name", "Name me")]
rows = "\n".join(f'    <button id="y-b-{k}">{lab}</button>' for k, lab in btns)
rep('<div class="panel" id="panel-gorilla" hidden>', f'<div class="panel" id="panel-monkey" hidden>\n  <div class="row">\n{rows}\n  </div>\n  <div class="row" id="y-colors" aria-label="Fur color"></div>\n  <div id="hint">Drag to spin me around. Tap me to say hi.</div>\n</div>\n<div class="panel" id="panel-gorilla" hidden>')
rep("({ possum, giraffe, gorilla, otter, sloth, monkey,", "function monkey() {" + js + "}\n({ possum, giraffe, gorilla, otter, sloth, monkey,")
rep('  if (who === "lobster") {', '''  if (who === "monkey") {        // chattery monkey sounds
    const ooh = (at, f = 420) => voice(f, 0.2, at, 0.17, 650), ah = (at, f = 560) => voice(f, 0.26, at, 0.17, 1400);
    if (name === "swing") { ooh(0, 500); whoosh(0.5, 0.9); voice(520, 1.1, 0.6, 0.15, 1500); whoosh(1.6, 0.9); whoosh(2.6, 0.9); thud(4.0, 1.2); }
    if (name === "peek") [0.75, 2.15].forEach(t => { tone(600, 600, 0.1, "triangle", 0.12, t); tone(700, 700, 0.1, "triangle", 0.12, t + 0.12); tone(900, 1100, 0.2, "triangle", 0.14, t + 0.24); squeak(t + 0.5); });
    if (name === "ooh") [0, 1.4].forEach(t => { ooh(t); ooh(t + 0.3); ah(t + 0.62); ah(t + 0.95); });
    if (name === "cart") { whoosh(0, 1.1); thud(1.25, 1.2); whoosh(1.3, 1.1); thud(2.55, 1.2); sparkle(2.6); }
    if (name === "hop") { ooh(0, 480); boing(0.05, 1.2); sparkle(0.7); }
    if (name === "shake") for (let i = 0; i < 6; i++) noise(0.06, 2500, 0.12, i * 0.08, 3);
    return;
  }
  if (who === "lobster") {''')
Path("creature-pals.html").write_text(C, encoding="utf-8")
print("ok", len(C))
