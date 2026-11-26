"""Name me opens a card: type your own name for the pal, or let it pick one (2026-11-26)."""
from pathlib import Path
p = Path(__file__).resolve().parent.parent / "src" / "creature-pals.html"; C = p.read_text(encoding="utf-8")
def rep(a, b, n=1):
    global C
    assert C.count(a) == n, (C.count(a), a[:80]); C = C.replace(a, b)
rep("html, body { height: 100%; }", """#namer { position: fixed; inset: 0; z-index: 25; display: grid; place-items: start center; padding: max(12vh, 16px) 16px 16px;
  background: rgba(20, 18, 40, .4); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
#namer form { width: min(420px, 100%); background: #fff; color: #2b2457; border-radius: 24px; padding: 20px; text-align: center; box-shadow: 0 8px 0 rgba(0,0,0,.18); }
#namer h2 { margin: 0 0 12px; font-size: 26px; font-weight: 700; }
#namer input { box-sizing: border-box; width: 100%; font: inherit; font-size: 26px; font-weight: 700; text-align: center; color: #2b2457;
  padding: 12px; border: 3px solid #c9c3ee; border-radius: 16px; outline: none; -webkit-user-select: text; user-select: text; }
#namer input:focus { border-color: #8a7fe0; }
#namer .row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 14px; }
#namer button { color: #2b2457; background: #eeebff; }
#namer #namer-save { background: #ffd77a; font-weight: 700; padding-inline: 28px; }
#namer #namer-save:disabled { opacity: .45; }
html, body { height: 100%; }""")
rep('<canvas id="stage"', """<div id="namer" hidden><form>
  <h2 id="namer-title">What's my name?</h2>
  <input id="namer-input" maxlength="16" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" aria-labelledby="namer-title">
  <div class="row"><button id="namer-save" type="submit">Save</button><button id="namer-random" type="button">Surprise me</button><button id="namer-cancel" type="button">Cancel</button></div>
</form></div>
<canvas id="stage\"""")
rep('const n = names[Math.floor(Math.random() * names.length)];', 'const n = takeName() || names[Math.floor(Math.random() * names.length)];', 15)
rep("showPanel();\n{ const words", """showPanel();
// ---- naming: "Name me" opens a card to type a name; each pal's own Name me code then says it and keeps it
let typedName = "";
const takeName = () => { const n = typedName; typedName = ""; return n; };
const namer = document.getElementById("namer"), namerIn = document.getElementById("namer-input"), namerSave = document.getElementById("namer-save");
let nameBtn = null;
addEventListener("click", e => {          // catch Name me before the pal's own handler, which would pick a random name
  const b = e.target.closest && e.target.closest('button[id$="-b-name"]'); if (!b) return;
  e.stopPropagation(); nameBtn = b;
  namerIn.value = ""; namerSave.disabled = true; namer.hidden = false; namerIn.focus();
}, true);
const closeNamer = () => { namer.hidden = true; namerIn.blur(); };
namerIn.oninput = () => namerSave.disabled = !namerIn.value.trim();
namer.querySelector("form").onsubmit = e => { e.preventDefault(); const n = namerIn.value.trim().replace(/\s+/g, " "); if (!n) return; typedName = n; closeNamer(); nameBtn.onclick(); };
document.getElementById("namer-random").onclick = () => { closeNamer(); nameBtn.onclick(); };
document.getElementById("namer-cancel").onclick = closeNamer;
namer.onclick = e => { if (e.target === namer) closeNamer(); };
{ const words""")
p.write_text(C, encoding="utf-8"); print("custom names added")
