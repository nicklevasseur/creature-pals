"""Friend buttons -> one drop-down, driven by a single FRIENDS list."""
import re
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
a = C.index('  <div id="switch" role="group" aria-label="Choose a friend">'); b = C.index("  </div>", a) + len("  </div>")
old = C[a:b]; sound = re.search(r'    <button id="sound"[^\n]*\n', old)
C = C[:a] + '  <div id="switch"><select id="pick" aria-label="Choose a friend"></select></div>' + ("\n" + sound.group(0).rstrip() if sound else "") + C[b:]
css_old = '#switch button[aria-pressed="true"] { background: var(--accent); color: var(--pressed-ink, #2b2457); }'
assert C.count(css_old) == 1
C = C.replace(css_old, css_old + '''
#pick { font: inherit; font-size: 19px; font-weight: 700; color: var(--ink); background-color: var(--chip); border: 2px solid var(--accent);
  border-radius: 999px; padding: 8px 44px 8px 20px; -webkit-appearance: none; appearance: none; cursor: pointer; max-width: 100%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 16px center; background-size: 14px; }
#pick:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
#pick option { color: #222; background: #fff; }''')
C = C.replace('#switch { display: inline-flex; flex-wrap: wrap; justify-content: center; max-width: 100%; gap: 4px; padding: 4px; border-radius: 999px; background: var(--chip); pointer-events: auto; margin-bottom: 6px; }',
              '#switch { display: inline-flex; justify-content: center; max-width: 100%; pointer-events: auto; margin-bottom: 6px; }')
a = C.index('const who = ['); b = C.index("// ---- sounds: made live with Web Audio")
C = C[:a] + '''// every friend, in menu order: [id, menu name, title]
const FRIENDS = [["possum", "Possum"], ["giraffe", "Giraffe"], ["gorilla", "Gorilla"], ["otter", "Otter"], ["sloth", "Sloth"], ["monkey", "Monkey"],
  ["octopus", "Octopus"], ["lobster", "Lobster"], ["manta", "Manta Ray"]];
const who = FRIENDS.some(([id]) => "#" + id === location.hash) ? location.hash.slice(1) : "possum";
document.body.className = who;
for (const [id] of FRIENDS) document.getElementById("panel-" + id).hidden = who !== id;
const pick = document.getElementById("pick");
for (const [id, label] of FRIENDS) pick.add(new Option(label, id, false, id === who));
pick.onchange = () => { location.hash = pick.value; location.reload(); };
document.getElementById("name").textContent = FRIENDS.find(([id]) => id === who)[1] + " Pal";

''' + C[b:]
p.write_text(C, encoding="utf-8"); print("drop-down in")
