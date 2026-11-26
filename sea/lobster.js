
// ---- the lobster: sits on the sand with two big claws, eyes on stalks and long swishy feelers
const COLORS = { Red: [0xe0452f, 0xffc2a8], Blue: [0x3f7fd0, 0xbfe0ff], Bubblegum: [0xf07fb0, 0xffd8ea], Orange: [0xf08a3c, 0xffe0b8], Golden: [0xe8b93a, 0xfff0bf] };
const LINES = { Blue: "Blue lobsters are super rare!", Golden: "Golden lobsters are rare too!" };
const shell = new THREE.MeshStandardMaterial({ color: COLORS.Red[0], roughness: 0.45 });
const pale = new THREE.MeshStandardMaterial({ color: COLORS.Red[1], roughness: 0.6 });
const cyl = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r1, r0, len, 10); g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2); return g; };   // runs along +z from 0

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); body.scale.setScalar(1.25); root.add(body);
part(ball, shell, body, 0, 0.32, 0.12, 0.3, 0.26, 0.42);                // back shell
part(ball, pale, body, 0, 0.22, 0.14, 0.26, 0.17, 0.38);                // pale underside
part(ball, shell, body, 0, 0.36, 0.5, 0.21, 0.18, 0.2);                 // head
part(new THREE.ConeGeometry(0.04, 0.16, 8), shell, body, 0, 0.44, 0.68).rotation.x = Math.PI / 2;
// the tail: five segments and a fan, curled under a little
const tail = []; let tp = body;
for (let j = 0; j < 5; j++) {
  const g = new THREE.Group(); g.position.set(0, j ? 0 : 0.3, j ? -0.17 : -0.24); tp.add(g);
  const r = 0.25 - j * 0.03;
  part(ball, shell, g, 0, 0, -0.09, r, r * 0.68, 0.13);
  part(ball, pale, g, 0, -r * 0.3, -0.09, r * 0.85, r * 0.45, 0.11);
  tail.push(g); tp = g;
}
const fan = new THREE.Group(); fan.position.z = -0.17; tp.add(fan);
for (let k = -2; k <= 2; k++) part(ball, shell, fan, k * 0.06, 0, -0.1, 0.06, 0.02, 0.14).rotation.y = k * 0.35;
// eyes on stalks
const stalks = [], eyes = [];
for (const s of [-1, 1]) {
  const st = new THREE.Group(); st.position.set(0.09 * s, 0.48, 0.58); st.rotation.z = -0.3 * s; body.add(st);
  part(new THREE.CylinderGeometry(0.022, 0.028, 0.16, 8), shell, st, 0, 0.08, 0);
  const eye = cartoonEye(st, 0, 0.18, 0.02, s, 0.75); stalks.push(st); eyes.push(eye);
}
part(new THREE.TorusGeometry(0.06, 0.012, 8, 20, Math.PI), dark, body, 0, 0.3, 0.69).rotation.z = Math.PI;   // smile
// long feelers: a chain of thin segments
const feelers = [];
for (const s of [-1, 1]) {
  const segs = []; let parent = new THREE.Group(); parent.position.set(0.07 * s, 0.42, 0.66); parent.rotation.set(-0.95, 0.4 * s, 0, "YXZ"); body.add(parent);
  for (let j = 0; j < 9; j++) {
    const g = new THREE.Group(); g.position.z = j ? 0.2 : 0; parent.add(g);
    part(cyl(0.016 - j * 0.0012, 0.015 - j * 0.0012, 0.21), shell, g, 0, 0, 0); segs.push(g); parent = g;
  }
  feelers.push(segs);
}
// eight little walking legs
const legs = [];
for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
  const lg = new THREE.Group(); lg.position.set(0.22 * s, 0.22, 0.3 - i * 0.14); lg.rotation.order = "YXZ"; lg.rotation.y = s * (i - 1.5) * 0.3; body.add(lg);
  part(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 6), shell, lg, 0.13 * s, -0.06, 0).rotation.z = -2.0 * s;
  part(new THREE.CylinderGeometry(0.016, 0.01, 0.2, 6), shell, lg, 0.27 * s, -0.17, 0).rotation.z = -0.2 * s;
  legs.push(lg);
}
// two big claws, each on an arm with an elbow, the top pincer opens
const arms = [];
for (const s of [-1, 1]) {
  const sh = new THREE.Group(); sh.position.set(0.2 * s, 0.32, 0.42); sh.rotation.order = "YXZ"; body.add(sh);
  part(cyl(0.06, 0.05, 0.3), shell, sh, 0, 0, 0);
  const el = new THREE.Group(); el.position.z = 0.3; el.rotation.y = -0.75 * s; sh.add(el);
  part(ball, shell, el, 0, 0, 0, 0.06, 0.06, 0.06);
  part(cyl(0.055, 0.07, 0.24), shell, el, 0, 0, 0);
  const claw = new THREE.Group(); claw.position.z = 0.24; el.add(claw);
  part(ball, shell, claw, 0, 0, 0.2, 0.19, 0.15, 0.28);                         // the big palm
  part(ball, pale, claw, 0, -0.08, 0.18, 0.13, 0.07, 0.21);
  part(ball, shell, claw, 0, -0.05, 0.52, 0.08, 0.06, 0.19);                    // bottom pincer
  const top = new THREE.Group(); top.position.set(0, 0.05, 0.4); claw.add(top);
  part(ball, shell, top, 0, 0, 0.14, 0.08, 0.06, 0.19);                         // top pincer
  arms.push({ sh, el, top, s });
}
function setArm(arm, lift, swing, open) { arm.sh.rotation.set(-lift, 0.85 * arm.s + swing * arm.s, 0); arm.top.rotation.x = -open; }

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 35% 35%, ${swatchHex(c2)} 0 24%, ${swatchHex(c1)} 26%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Red");
  b.onclick = () => { shell.color.setHex(c1); pale.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(s => s.setAttribute("aria-pressed", s === b)); start("shake", LINES[label] || label + " lobster! Snip snap!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { snip: 2.2, dance: 3.2, flip: 2.6, wave: 2.4, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-snip").onclick = () => start("snip", "Snip snap! Snip snap!");
document.getElementById("b-dance").onclick = () => start("dance", "Lobster boogie!");
document.getElementById("b-flip").onclick = () => start("flip", "Zoom! Lobsters swim backwards!");
document.getElementById("b-wave").onclick = () => start("wave", "Hi there, friend!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("lobster-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Clawdia", "Snippy", "Snapper", "Ruby", "Clacky", "Captain Claws", "Larry", "Pebbles", "Sir Snips"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("lobster-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "snip", ["Hee hee!", "Pinch hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, body.localToWorld(V(0, 0.6, 0.3)));
}); });

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: sit on the sand facing the viewer, feelers swishing, claws slowly opening and closing
  heading = camAngle() + 0.2 + Math.sin(t * 0.35) * 0.15 * m;
  let x = 0, z = 0, y = 0.02 + Math.sin(t * 1.5) * 0.01 * m, pitch = 0, roll = 0, curl = 0.12 + Math.sin(t * 0.8) * 0.04 * m, legT = 0.06 * m;
  const idleOpen = 0.2 + Math.sin(t * 1.3) * 0.18 * m;
  let L = [0.35, 0, idleOpen], R = [0.35, 0, 0.2 + Math.sin(t * 1.3 + 1) * 0.18 * m], legSp = 2;
  if (act === "snip") {            // claws up, snapping fast in turn
    L = [0.5, 0.1, Math.max(0, Math.sin(a * 14)) * 0.7]; R = [0.5, 0.1, Math.max(0, Math.sin(a * 14 + Math.PI)) * 0.7]; heading = heading0;
  } else if (act === "dance") {    // shuffle side to side, claws up and swaying, tail wiggling
    const beat = Math.sin(a * 6); heading = heading0; roll = beat * 0.15; y += Math.abs(Math.sin(a * 6)) * 0.08;
    x = Math.cos(heading0) * beat * 0.3; z = -Math.sin(heading0) * beat * 0.3;
    L = [0.9 + beat * 0.3, 0.2, 0.4]; R = [0.9 - beat * 0.3, 0.2, 0.4]; curl = 0.12 + Math.sin(a * 12) * 0.15; legSp = 14; legT = 0.25;
  } else if (act === "flip") {     // a tail flip shoots it backwards, then it walks back home
    heading = heading0; const back = a < 0.7 ? ease.out(a / 0.7) : 1 - ease.inOut(clamp01((a - 0.9) / 1.6));
    x = -Math.sin(heading0) * back * 1.2; z = -Math.cos(heading0) * back * 1.2;
    if (a < 0.7) { y += Math.sin(a / 0.7 * Math.PI) * 0.4; curl = 0.6 * Math.sin(a / 0.7 * Math.PI); pitch = -0.2; }
    else { legSp = 16; legT = 0.3; }
    L = R = [0.3, -0.2, 0.1];
  } else if (act === "wave") {     // one claw up high, waving and snapping hello
    heading = camAngle() + 0.1; R = [1.4 + Math.sin(a * 9) * 0.25, 0.3 + Math.sin(a * 9) * 0.2, Math.max(0, Math.sin(a * 9)) * 0.6];
  } else if (act === "hop") {
    y += Math.sin(p * Math.PI) * 0.5; heading = heading0 + ease.inOut(p) * Math.PI * 2; L = R = [0.9, 0.2, 0.5];
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.12 * (1 - p); heading = heading0; L = R = [0.4, 0, 0.5];
  }

  root.position.set(x, y, z); root.rotation.set(pitch, heading, roll);
  setArm(arms[0], ...L); setArm(arms[1], ...R);
  tail.forEach((g, j) => g.rotation.x = j ? curl : curl * 0.3);
  feelers.forEach((segs, s) => segs.forEach((g, j) => { if (j) { g.rotation.x = 0.17 + Math.sin(t * 1.5 + j * 0.5 + s) * 0.05 * m; g.rotation.y = Math.sin(t * 1.1 + j * 0.4 + s * 2) * 0.08 * m; } }));
  legs.forEach((lg, i) => lg.rotation.x = Math.sin(t * legSp + i * 1.3) * legT);
  stalks.forEach((st, i) => st.rotation.y = Math.sin(t * 0.7 + i) * 0.25 * m);
  const blink = blinkAmount(t);
  eyes.forEach(e => e.scale.y = Math.max(0.08, 1 - blink));

  reefTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
