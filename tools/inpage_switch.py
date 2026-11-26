"""Switch friends inside the page (no reload), so sound keeps playing; add a one-time "Tap to play" title screen.

Browsers allow sound only after a tap since the page opened. Reloading on every switch reset that, so each habitat sound
waited for a tap. Now: one tap on the title screen, then every friend's habitat starts as soon as it appears.
"""
from pathlib import Path
p = Path(__file__).resolve().parent.parent / "src" / "creature-pals.html"; C = p.read_text(encoding="utf-8")
def rep(a, b, n=1):
    global C
    assert C.count(a) == n, (a[:70], C.count(a)); C = C.replace(a, b)

# ---- page setup becomes a function that can run again for each friend
rep('''const who = FRIENDS.some(([id]) => "#" + id === location.hash) ? location.hash.slice(1) : "possum";
document.body.className = who;
for (const [id] of FRIENDS) document.getElementById("panel-" + id).hidden = who !== id;
const pick = document.getElementById("pick");
for (const [id, label] of FRIENDS) pick.add(new Option(label, id, false, id === who));
pick.onchange = () => { location.hash = pick.value; location.reload(); };
document.getElementById("name").textContent = FRIENDS.find(([id]) => id === who)[1] + " Pal";''',
'''let who = FRIENDS.some(([id]) => "#" + id === location.hash) ? location.hash.slice(1) : "possum";
let GEN = 0, CLEANUP = null;            // GEN: which friend is current; an older friend's loop sees the change and stops
const pick = document.getElementById("pick");
for (const [id, label] of FRIENDS) pick.add(new Option(label, id, false, id === who));
function showPanel() {
  document.body.className = who;
  for (const [id] of FRIENDS) document.getElementById("panel-" + id).hidden = who !== id;
  document.querySelectorAll("#panel-" + who + " .swatch").forEach(b => b.remove());   // the friend adds its colour buttons again
  document.getElementById("name").textContent = FRIENDS.find(([id]) => id === who)[1] + " Pal";
  document.getElementById("say").textContent = "Tap me!";
  pick.value = who;
}
showPanel();''')
rep('document.querySelector("#panel-" + who + " .row").append(soundBtn);   // sits right after "Name me"',
    'const placeSound = () => document.querySelector("#panel-" + who + " .row").append(soundBtn);   // sits right after "Name me"\nplaceSound();')

# ---- habitat loops: one at a time, and a late-loading loop never starts after its friend has gone
rep('''    if (!buf || ambience) return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; s.loop = true; g.gain.value = soundOn ? vol : 0;
    s.connect(g).connect(c.destination); s.start(); ambience = { g, vol };''',
'''    if (!buf || ambience || AMBIENCE[who] !== name) return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; s.loop = true; g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(soundOn ? vol : 0, c.currentTime + 1.2);    // fade in
    s.connect(g).connect(c.destination); s.start(); ambience = { g, vol, s };''')
rep("function ambienceFollowsSound() {",
    "function stopAmbience() {\n  if (!ambience) return; const { g, s } = ambience, t = audio().currentTime; ambience = null;\n  g.gain.setTargetAtTime(0, t, 0.15); s.stop(t + 0.8);\n}\nfunction ambienceFollowsSound() {")

# ---- every friend: register its cleanup, stop its loop and resize handler once it is no longer current
n = C.count("const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });")
assert n == 13, n
C = C.replace("const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });",
              "const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });\nconst myGen = ++GEN; CLEANUP = () => { renderer.dispose(); renderer.forceContextLoss(); };")
rep("requestAnimationFrame(frame);", "if (myGen === GEN) requestAnimationFrame(frame);", 13)
rep('addEventListener("resize", resize); resize();', 'addEventListener("resize", () => myGen === GEN && resize()); resize();', 13)

# ---- the switch itself, and the title screen
a = C.index("({ possum, giraffe, gorilla,"); b = C.index("[who]();", a) + len("[who]();")
fns = C[a + 1:C.index("})", a) + 1]          # "{ possum, giraffe, ... }"
C = C[:a] + f'''const FRIEND_FNS = {fns};
function switchTo(id) {{
  if (id === who || !FRIEND_FNS[id]) return;
  GEN++; if (CLEANUP) CLEANUP();                               // stop and free the old friend
  const old = document.getElementById("stage"), fresh = old.cloneNode(false); old.replaceWith(fresh);   // drops its listeners
  who = id; try {{ history.replaceState(null, "", "#" + id); }} catch (e) {{}}
  showPanel(); placeSound(); stopAmbience(); startAmbience(AMBIENCE[who]);
  FRIEND_FNS[id]();
}}
pick.onchange = () => switchTo(pick.value);
addEventListener("hashchange", () => switchTo(location.hash.slice(1)));
FRIEND_FNS[who]();
// a title screen on opening: its one tap is what lets the browser play sound from then on
const titleScreen = document.getElementById("splash");
document.getElementById("play").onclick = () => {{ audio(); titleScreen.hidden = true; startAmbience(AMBIENCE[who]); }};''' + C[b:]

rep('<canvas id="stage"', '''<div id="splash"><div class="splash-card"><h2>Creature Pals</h2><p id="count">Lots of friends to play with</p><button id="play">Tap to play</button></div></div>
<canvas id="stage"''')
rep("[hidden] { display: none !important; }", """[hidden] { display: none !important; }
#splash { position: fixed; inset: 0; z-index: 20; display: grid; place-items: center; background: rgba(20, 18, 40, .35);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); padding: 16px; }
#splash .splash-card { text-align: center; color: #fff; }
#splash h2 { margin: 0; font-size: clamp(40px, 11vw, 72px); font-weight: 700; text-shadow: 0 4px 0 rgba(0,0,0,.25); }
#splash p { margin: 6px 0 26px; font-size: clamp(17px, 4.5vw, 22px); }
#play { font-size: clamp(22px, 6vw, 30px); font-weight: 700; padding: 18px 44px; border-radius: 999px; border: 0; color: #2b2457;
  background: #ffd77a; box-shadow: 0 6px 0 rgba(0,0,0,.2); cursor: pointer; }
#play:active { transform: translateY(3px); box-shadow: 0 3px 0 rgba(0,0,0,.2); }""")
p.write_text(C, encoding="utf-8"); print("in-page switching and title screen added")
