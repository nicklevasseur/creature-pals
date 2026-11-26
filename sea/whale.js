
// ---- the whale: a big round plush humpback with a grooved white belly, long flippers, a wide smile and flukes
const COLORS = { Blue: [0x4d7fc0, 0xeaf1f8], Navy: [0x2c4570, 0xdfe6ef], Grey: [0x7d8794, 0xf0f2f5], Bubblegum: [0xf08fb8, 0xffe4ef], Teal: [0x2f9a96, 0xe0f6f3] };
const skin = new THREE.MeshStandardMaterial({ color: COLORS.Blue[0], roughness: 0.55 });
const belly = new THREE.MeshStandardMaterial({ color: COLORS.Blue[1], roughness: 0.6 });
const groove = new THREE.MeshStandardMaterial({ roughness: 0.6 });
const tintGrooves = () => groove.color.copy(belly.color).lerp(skin.color, 0.35); tintGrooves();

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); body.scale.setScalar(0.85); root.add(body);
part(ball, skin, body, 0, 0, 0.1, 0.75, 0.62, 1.25);                          // the big round body
part(ball, skin, body, 0, 0.04, 0.95, 0.62, 0.55, 0.5);                       // the head
part(ball, belly, body, 0, -0.24, 0.2, 0.6, 0.42, 1.05);                      // white belly
for (let i = -2; i <= 2; i++) part(ball, groove, body, i * 0.13, -0.6, 0.35, 0.03, 0.06, 0.75);   // belly grooves (painted)
part(ball, dark, body, 0, 0.62, 0.62, 0.07, 0.03, 0.04);                       // blowhole
const smile = part(new THREE.TorusGeometry(0.07, 0.014, 8, 20, Math.PI), dark, body, 0, -0.12, 1.4, 3.2, 1.6, 1); smile.rotation.z = Math.PI;
const eyes = [];
for (const s of [-1, 1]) {
  const e = cartoonEye(body, 0.4 * s, 0.08, 1.12, s, 1.0); e.rotation.y = 0.55 * s; eyes.push(e);
  part(ball, blush, body, 0.5 * s, -0.08, 1.05, 0.08, 0.05, 0.03).rotation.y = 0.6 * s;
}
const flippers = [];
for (const s of [-1, 1]) {
  const f = new THREE.Group(); f.position.set(0.66 * s, -0.22, 0.5); f.rotation.order = "YXZ"; body.add(f);
  part(ball, skin, f, 0.2 * s, -0.08, -0.25, 0.14, 0.05, 0.5).rotation.set(0, -0.6 * s, -0.5 * s); flippers.push(f);
}
const tail1 = new THREE.Group(); tail1.position.set(0, 0.05, -1.0); body.add(tail1);
part(ball, skin, tail1, 0, 0, -0.3, 0.36, 0.32, 0.55);
const tail2 = new THREE.Group(); tail2.position.set(0, 0, -0.75); tail1.add(tail2);
part(ball, skin, tail2, 0, 0, -0.15, 0.16, 0.14, 0.28);
for (const s of [-1, 1]) part(ball, skin, tail2, 0.34 * s, 0, -0.38, 0.45, 0.06, 0.22).rotation.y = 0.45 * s;   // flukes
// water spout drops and singing notes
const drops = [], notes = [];
const dropMat = new THREE.MeshStandardMaterial({ color: 0xe6f7ff, roughness: 0.1, transparent: true, opacity: 0.85 });
function spoutBurst(n = 6) {
  if (calm) return;
  const top = body.localToWorld(PV(0, 0.66, 0.62));
  for (let i = 0; i < n; i++) {
    const dsh = new THREE.Mesh(ball, dropMat); dsh.scale.setScalar(0.05 + Math.random() * 0.04); dsh.position.copy(top);
    dsh.userData = { born: performance.now(), v: PV((Math.random() - .5) * 0.03, 0.09 + Math.random() * 0.05, (Math.random() - .5) * 0.03) }; scene.add(dsh); drops.push(dsh);
  }
}
const noteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true });
function singNote() {
  if (calm) return;
  const g = new THREE.Group(), head = body.localToWorld(PV(0, 0.4, 1.3)), nm = noteMat.clone();   // each note fades on its own
  const h = new THREE.Mesh(ball, nm); h.scale.set(0.08, 0.06, 0.06); g.add(h);
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), nm); st.position.set(0.07, 0.11, 0); g.add(st);
  const fl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.02), nm); fl.position.set(0.11, 0.21, 0); fl.rotation.z = -0.5; g.add(fl);
  g.position.copy(head); g.userData = { born: performance.now(), dx: (Math.random() - .5) * 0.6 }; scene.add(g); notes.push(g);
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `linear-gradient(180deg, ${swatchHex(c1)} 55%, ${swatchHex(c2)} 55%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Blue");
  b.onclick = () => { skin.color.setHex(c1); belly.color.setHex(c2); tintGrooves(); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", label + " whale! Splish!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0, lastFx = 0;
const DUR = { spout: 2.6, sing: 3.6, breach: 3.0, wave: 2.4, hop: 1.4, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-spout").onclick = () => start("spout", "Pfffoosh!");
document.getElementById("b-sing").onclick = () => start("sing", "Whale song... ooooo...");
document.getElementById("b-breach").onclick = () => start("breach", "Up, up and SPLASH!");
document.getElementById("b-wave").onclick = () => start("wave", "Hello, little friend!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("whale-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Big Blue", "Humphrey", "Melody", "Splash", "Captain Spout", "Bubbles", "Gentle", "Wally", "Moby"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("whale-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "spout", ["Hee hee!", "Big whale hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, body.localToWorld(PV(0, 0.8, 0.6)));
}); });

const plush = plushAll(root, { mats: [[skin, 0.012], [belly, 0.012], [groove, 0.012]], paint: [groove] });
plush.buttons(eyes, 1.1, 0.012);
plush.resurface([smile]);
const clock = new THREE.Clock();
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: float side-on to the viewer, flukes sweeping up and down, flippers paddling
  heading = camAngle() + 1.0 + Math.sin(t * 0.3) * 0.2 * m;
  let y = 1.45 + Math.sin(t * 0.8) * 0.08 * m, pitch = Math.sin(t * 0.8 + 1) * 0.04 * m, roll = 0, sp = 1.6, amp = 0.25 * m, flapL = 0, flapR = 0;
  if (act === "spout") {           // a fountain from the blowhole
    heading = heading0; pitch = -0.1;
    if (a > 0.3 && a < 1.6 && t - lastFx > 0.05) { lastFx = t; spoutBurst(4); }
  } else if (act === "sing") {     // head up, notes floating away
    heading = camAngle() + 0.6; pitch = -0.25 * Math.sin(Math.min(1, a / 0.5) * Math.PI / 2); roll = Math.sin(a * 2) * 0.08; sp = 1.0;
    if (t - lastFx > 0.45 && a < d - 0.5) { lastFx = t; singNote(); }
  } else if (act === "breach") {   // a great leap up, a roll, and a splash back down in bubbles
    heading = heading0; const k = clamp01((a - 0.3) / 2.0);
    y += Math.sin(k * Math.PI) * 1.3; pitch = -Math.cos(k * Math.PI) * 0.6 * (k > 0 && k < 1 ? 1 : 0); roll = ease.inOut(k) * Math.PI * 2; amp = 0.5; sp = 6;
    if (a > 2.25 && a < 2.4 && t - lastFx > 0.05) { lastFx = t; const w = root.position; for (let i = 0; i < 8; i++) bubble(w.x + (Math.random() - .5) * 1.4, w.y - 0.3, w.z + (Math.random() - .5) * 1.4, 0.05 + Math.random() * 0.06); }
  } else if (act === "wave") {     // a flipper up and waving
    heading = camAngle() + 0.7; flapR = 1.1 + Math.sin(a * 9) * 0.4; roll = -0.15;
  } else if (act === "hop") {
    y += Math.sin(p * Math.PI) * 0.5; heading = heading0 + ease.inOut(p) * Math.PI * 2; amp = 0.4; sp = 4;
  } else if (act === "shake") {
    roll = Math.sin(a * 30) * 0.15 * (1 - p); heading = heading0; amp = 0.4; sp = 8;
  }

  root.position.set(0, y, 0); root.rotation.set(pitch, heading, roll);
  tail1.rotation.x = Math.sin(t * sp) * amp; tail2.rotation.x = Math.sin(t * sp - 0.8) * amp * 1.4;
  flippers[0].rotation.z = Math.sin(t * sp * 0.8) * 0.15 * m + flapL; flippers[1].rotation.z = -Math.sin(t * sp * 0.8) * 0.15 * m + flapR;
  for (let i = drops.length - 1; i >= 0; i--) {
    const dr = drops[i], age = (now - dr.userData.born) / 1000; dr.position.add(dr.userData.v); dr.userData.v.y -= 0.004;
    if (age > 1.6) { scene.remove(dr); drops.splice(i, 1); }
  }
  for (let i = notes.length - 1; i >= 0; i--) {
    const n = notes[i], age = (now - n.userData.born) / 1000; n.position.y += 0.012; n.position.x += n.userData.dx * 0.01; n.lookAt(camera.position);
    n.children[0].material.opacity = 1 - age / 2.2; if (age > 2.2) { scene.remove(n); notes.splice(i, 1); }
  }
  reefTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  if (myGen === GEN) requestAnimationFrame(frame);
}
frame();
