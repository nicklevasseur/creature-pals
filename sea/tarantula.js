
// ---- the desert at sunset: sand, red rocks, cacti, a burrow, a tumbleweed that rolls by
const hm = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), hm(0xe2a96a)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const rockRed = hm(0xb85a3a), cactus = hm(0x4f9a52), spine = hm(0xf5e6c0);
for (const [x, z, s] of [[-2.8, -1.8, 0.7], [3.1, -1.2, 0.5], [-3.4, 1.4, 0.45], [2.2, -3.0, 0.9]]) {
  const r = part(new THREE.DodecahedronGeometry(s, 1), rockRed, scene, x, s * 0.45, z, 1.2, 0.7, 1); r.rotation.y = x;
}
for (const [x, z, h] of [[-2.2, -2.6, 2.4], [2.9, -2.4, 1.8], [-3.6, -0.2, 1.4]]) {     // saguaro cacti with arms
  part(new THREE.CylinderGeometry(0.2, 0.22, h, 14), cactus, scene, x, h / 2, z); part(ball, cactus, scene, x, h, z, 0.2, 0.2, 0.2);
  for (const s of [-1, 1]) {
    const ah = h * (s > 0 ? 0.55 : 0.4);
    part(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 10), cactus, scene, x + 0.28 * s, ah, z).rotation.z = Math.PI / 2;
    part(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 10), cactus, scene, x + 0.42 * s, ah + 0.3, z); part(ball, cactus, scene, x + 0.42 * s, ah + 0.6, z, 0.12, 0.12, 0.12);
  }
  for (let i = 0; i < 8; i++) part(ball, spine, scene, x + Math.cos(i * 2.4) * 0.21, 0.3 + i * h / 9, z + Math.sin(i * 2.4) * 0.21, 0.015, 0.015, 0.015);
}
const burrow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), hm(0x2b1a12)); burrow.rotation.x = -Math.PI / 2; burrow.position.set(1.4, 0.01, 0.9); scene.add(burrow);
part(new THREE.TorusGeometry(0.46, 0.08, 10, 32), hm(0xc98d55), scene, 1.4, 0.02, 0.9).rotation.x = -Math.PI / 2;
const weed = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 1), new THREE.MeshStandardMaterial({ color: 0x9a7448, wireframe: true })); scene.add(weed);
const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 40), new THREE.MeshBasicMaterial({ color: 0xffb35c })); sunDisc.position.set(-4, 3.2, -9); scene.add(sunDisc);
function desertTick(t, m) {
  const k = ((t * 0.12) % 1.4) - 0.2;                                     // the tumbleweed rolls across now and then
  weed.position.set(-6 + k * 9, 0.3 + Math.abs(Math.sin(t * 3)) * 0.15 * m, -1.6); weed.rotation.z = -t * 3; weed.visible = k > -0.1 && k < 1.2;
}

// ---- the tarantula: fuzzy and friendly, eight legs with bright knees, a cluster of little eyes
const COLORS = { Redknee: [0x3a2a24, 0xf07a2a], Cobalt: [0x2b3f8f, 0x7fb6ff], Pinktoe: [0x3b2f38, 0xff8fc0], Bubblegum: [0xe58ab0, 0xffd1e6], Golden: [0xb08a4a, 0xffe08a] };
const LINES = { Cobalt: "Cobalt blue tarantulas are real!", Pinktoe: "Pinktoe tarantulas have pink toes!" };
const fur = new THREE.MeshStandardMaterial({ color: COLORS.Redknee[0], roughness: 0.9 });
const knee = new THREE.MeshStandardMaterial({ color: COLORS.Redknee[1], roughness: 0.85 });
const along = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r1, r0, len, 10); g.rotateZ(-Math.PI / 2); g.translate(len / 2, 0, 0); return g; };
const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); body.position.y = 0.05; root.add(body);
const front = new THREE.Group(); front.position.set(0, 0.45, 0.22); body.add(front);         // head and legs
part(ball, fur, front, 0, 0, 0, 0.34, 0.22, 0.36);
for (const s of [-1, 1]) part(ball, fur, front, 0.09 * s, -0.08, 0.36, 0.08, 0.08, 0.09);   // chubby fangs, all fuzz
const abdomen = new THREE.Group(); abdomen.position.set(0, 0.55, -0.42); body.add(abdomen);
part(ball, fur, abdomen, 0, 0, -0.08, 0.46, 0.4, 0.5);
part(ball, knee, abdomen, 0, 0.3, -0.12, 0.14, 0.05, 0.2);                                   // a bright stripe on top
const eyes = [];
for (const s of [-1, 1]) {
  eyes.push(cartoonEye(front, 0.11 * s, 0.16, 0.24, s, 0.75));
  for (const [dx, dy] of [[0.24, 0.12], [0.2, 0.2], [0.05, 0.22]]) part(ball, dark, front, dx * s, dy, 0.2, 0.025, 0.025, 0.02);   // the little extra eyes
  part(ball, blush, front, 0.24 * s, 0.03, 0.26, 0.05, 0.03, 0.02);
}
const smile = part(smileGeo, dark, front, 0, 0.02, 0.35, 0.9, 0.9, 1); smile.rotation.z = Math.PI;
// eight legs (and two short feelers): up and out to a bright knee, then down to the sand
const legs = [];
for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
  const lg = new THREE.Group(); lg.position.set(0.26 * s, -0.02, 0.18 - i * 0.14); lg.rotation.order = "YXZ";
  lg.rotation.y = (s > 0 ? 0 : Math.PI) + (0.75 - i * 0.5) * -s; front.add(lg);
  const thigh = new THREE.Group(); thigh.rotation.z = 0.7; lg.add(thigh);
  part(along(0.06, 0.05, 0.42), fur, thigh, 0, 0, 0);
  const kn = new THREE.Group(); kn.position.x = 0.42; kn.rotation.z = -1.75; thigh.add(kn);
  part(ball, knee, kn, 0, 0, 0, 0.065, 0.065, 0.065);
  part(along(0.05, 0.035, 0.5), fur, kn, 0, 0, 0);
  part(ball, knee, kn, 0.5, 0, 0, 0.04, 0.035, 0.04);                     // bright toes
  legs.push({ lg, thigh, kn, i, s });
}
const palps = [];
for (const s of [-1, 1]) {
  const pp = new THREE.Group(); pp.position.set(0.14 * s, -0.04, 0.3); pp.rotation.order = "YXZ"; pp.rotation.y = -Math.PI / 2 - 0.35 * s; front.add(pp);
  pp.rotation.z = 0.5; part(along(0.04, 0.035, 0.22), fur, pp, 0, 0, 0); part(ball, knee, pp, 0.24, 0, 0, 0.045, 0.045, 0.045); palps.push(pp);
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 50% 50%, ${swatchHex(c2)} 0 22%, ${swatchHex(c1)} 24%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Redknee");
  b.onclick = () => { fur.color.setHex(c1); knee.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", LINES[label] || label + " tarantula! So fuzzy!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { wave: 2.4, dance: 3.2, burrow: 4.0, jump: 1.6, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-wave").onclick = () => start("wave", "Hello hello! I'm soft and fuzzy!");
document.getElementById("b-dance").onclick = () => start("dance", "Eight-leg tap dance!");
document.getElementById("b-burrow").onclick = () => start("burrow", "Into my cozy burrow...");
document.getElementById("b-jump").onclick = () => start("jump", "Boing!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("tarantula-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Fuzzy", "Rosie", "Eight", "Tickles", "Velvet", "Pepper", "Sir Fuzzalot", "Twinkletoes", "Cocoa"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("tarantula-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "wave", ["Hee hee!", "Eight-leg hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, front.localToWorld(PV(0, 0.4, 0.2)));
}); });

const plush = plushAll(root, { mats: [[fur, 0.05], [knee, 0.04]] });
plush.buttons(eyes, 0.75, 0.045);
plush.resurface([smile]);
const clock = new THREE.Clock(), home = PV(), hole = burrow.position.clone();
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: sit facing the viewer, breathing, legs shifting one by one, feelers tapping
  heading = camAngle() + Math.sin(t * 0.3) * 0.2 * m;
  let pos = home.clone(), y = Math.sin(t * 1.4) * 0.012 * m, pitch = 0, roll = 0, legSp = 1.5, legAmp = 0.06 * m, waveFront = 0, sink = 0;
  if (act === "wave") {           // the two front legs lift and wave hello
    waveFront = 1; pitch = -0.12; heading = camAngle();
  } else if (act === "dance") {   // eight legs tapping in a ripple, body bouncing
    heading = heading0; legSp = 16; legAmp = 0.45; y += Math.abs(Math.sin(a * 8)) * 0.12; roll = Math.sin(a * 4) * 0.12;
  } else if (act === "burrow") {  // scurry to the burrow, sink in, peek out, come back
    const go = a < 1.0 ? ease.inOut(a) : a < 3.0 ? 1 : 1 - ease.inOut((a - 3.0) / 1.0);
    pos = home.clone().lerp(hole, go); heading = a < 1.0 || a > 3.0 ? Math.atan2(hole.x - home.x, hole.z - home.z) + (a > 3.0 ? Math.PI : 0) : camAngle();
    sink = a > 1.0 && a < 3.0 ? Math.sin(clamp01((a - 1.0) / 2.0) * Math.PI) * 0.62 : 0; legSp = go > 0 && go < 1 ? 18 : 2; legAmp = go > 0 && go < 1 ? 0.35 : 0.05;
    if (a > 1.9 && a < 1.95) say("Peekaboo!");
  } else if (act === "jump") {    // crouch, spring up and forward, land with a little bounce
    heading = heading0; const k = clamp01((a - 0.3) / 0.9);
    y += a < 0.3 ? -0.08 * ease.out(a / 0.3) : Math.sin(k * Math.PI) * 0.9; pitch = a > 0.3 && a < 1.2 ? -0.25 * Math.sin(k * Math.PI) : 0;
  } else if (act === "hop") {
    y += Math.sin(p * Math.PI) * 0.4; heading = heading0 + ease.inOut(p) * Math.PI * 2;
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.1 * (1 - p); heading = heading0; legAmp = 0.3; legSp = 20;
  }

  root.position.set(pos.x, y - sink, pos.z); root.rotation.set(pitch, heading, roll);
  legs.forEach(l => {
    const w = Math.sin(t * legSp + l.i * 1.1 + (l.s > 0 ? 0 : 1.6));
    l.thigh.rotation.z = 0.7 + w * legAmp; l.thigh.rotation.y = w * legAmp * 0.5; l.kn.rotation.z = -1.75;
    if (waveFront && l.i === 0) { l.thigh.rotation.z = 1.6 + Math.sin(a * 10 + (l.s > 0 ? 0 : 1)) * 0.25; l.kn.rotation.z = -0.6 + Math.sin(a * 10) * 0.3; }
  });
  palps.forEach((pp, i) => pp.rotation.z = 0.5 + Math.sin(t * 3 + i * 2) * 0.15 * m);
  desertTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
