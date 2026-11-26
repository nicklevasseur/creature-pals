
// ---- the cow: plush, with patches dyed into the fur, a pink felt muzzle, little horns, floppy ears and a cowbell
const COLORS = { Holstein: [0xf6f3ee, 0x2a2622], Jersey: [0xc98a52, 0x7a4a26], Highland: [0xc6662a, 0x8a3f18], Bubblegum: [0xffd6e6, 0xe07aa8], Chocolate: [0x6a4630, 0x3a2418] };
const coat = new THREE.MeshStandardMaterial({ color: COLORS.Holstein[0], roughness: 0.9 });
const patch = new THREE.MeshStandardMaterial({ color: COLORS.Holstein[1], roughness: 0.9 });
const muzzleMat = new THREE.MeshStandardMaterial({ color: 0xf5b3bf, roughness: 0.8 });
const hornMat = new THREE.MeshStandardMaterial({ color: 0xf3e6c8, roughness: 0.6 });
const hoofMat = new THREE.MeshStandardMaterial({ color: 0x3a2e2a, roughness: 0.6 });
const gold = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.3, metalness: 0.6 });
const collarMat = new THREE.MeshStandardMaterial({ color: 0xd8402f, roughness: 0.7 });
const tuftMat = new THREE.MeshStandardMaterial({ color: COLORS.Holstein[1], roughness: 0.9 });   // the tail tuft follows the patch colour

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); root.add(body);
part(ball, coat, body, 0, 1.05, 0, 0.62, 0.55, 0.95);
part(ball, coat, body, 0, 1.25, 0.72, 0.3, 0.32, 0.35);                       // neck
for (const [th, ph, r] of [[0.6, 1.1, 0.3], [-0.9, 1.0, 0.26], [2.4, 1.3, 0.3], [-2.2, 1.4, 0.24], [1.6, 0.6, 0.22], [-1.5, 1.8, 0.25], [3.1, 0.8, 0.2]]) {
  const dx = Math.sin(ph) * Math.sin(th), dy = Math.cos(ph), dz = Math.sin(ph) * Math.cos(th);   // patches spread over the body
  part(ball, patch, body, dx * 0.62, 1.05 + dy * 0.55, dz * 0.95, r, r, r);
}
const head = new THREE.Group(); head.position.set(0, 1.38, 0.98); body.add(head);
part(ball, coat, head, 0, 0, 0, 0.33, 0.35, 0.36);
const muzzle = new THREE.Group(); muzzle.position.set(0, -0.16, 0.28); head.add(muzzle);
part(ball, muzzleMat, muzzle, 0, 0, 0, 0.3, 0.21, 0.2);
for (const s of [-1, 1]) part(ball, dark, muzzle, 0.1 * s, 0.03, 0.19, 0.035, 0.045, 0.02);     // nostrils
const smile = part(smileGeo, dark, muzzle, 0, -0.08, 0.19, 1.3, 1.1, 1); smile.rotation.z = Math.PI;
part(ball, patch, head, 0.16, 0.16, 0.24, 0.12, 0.12, 0.12);                  // a patch over one eye
const eyes = [], ears = [];
for (const s of [-1, 1]) {
  eyes.push(cartoonEye(head, 0.15 * s, 0.12, 0.29, s, 0.8));
  const ear = new THREE.Group(); ear.position.set(0.33 * s, 0.1, -0.04); head.add(ear);
  part(ball, coat, ear, 0.12 * s, 0, 0, 0.17, 0.05, 0.09); part(ball, muzzleMat, ear, 0.13 * s, 0.02, 0.02, 0.12, 0.03, 0.06); ears.push(ear);
  part(new THREE.CylinderGeometry(0.035, 0.05, 0.18, 10), hornMat, head, 0.16 * s, 0.34, -0.04).rotation.z = -0.35 * s;   // horns
  part(ball, hornMat, head, 0.2 * s, 0.43, -0.04, 0.045, 0.045, 0.045);
  part(ball, blush, head, 0.25 * s, -0.08, 0.24, 0.06, 0.035, 0.03);
}
// the collar and cowbell
part(new THREE.TorusGeometry(0.31, 0.04, 8, 28), collarMat, body, 0, 1.2, 0.8).rotation.x = Math.PI / 2 - 0.5;
const bell = new THREE.Group(); bell.position.set(0, 0.97, 1.0); body.add(bell);
part(new THREE.ConeGeometry(0.1, 0.16, 16, 1, true), gold, bell, 0, -0.1, 0); part(ball, gold, bell, 0, -0.18, 0, 0.03, 0.03, 0.03);
part(new THREE.TorusGeometry(0.03, 0.01, 6, 12), gold, bell, 0, 0, 0);
const legs = [];
for (const [x, z] of [[-0.33, 0.55], [0.33, 0.55], [-0.33, -0.55], [0.33, -0.55]]) {
  const hip = new THREE.Group(); hip.position.set(x, 0.78, z); body.add(hip);
  part(new THREE.CylinderGeometry(0.13, 0.11, 0.62, 12), coat, hip, 0, -0.31, 0);
  part(new THREE.CylinderGeometry(0.115, 0.125, 0.14, 12), hoofMat, hip, 0, -0.7, 0);
  legs.push(hip);
}
const tail = new THREE.Group(); tail.position.set(0, 1.3, -0.92); body.add(tail);
part(new THREE.CylinderGeometry(0.022, 0.022, 0.55, 6), coat, tail, 0, -0.27, -0.04).rotation.x = 0.15;
part(ball, tuftMat, tail, 0, -0.58, -0.08, 0.07, 0.12, 0.07);                    // the tuft
// a tuft of grass to munch, and a moon to jump over
const grassMat = new THREE.MeshStandardMaterial({ color: 0x4f9a3c, roughness: 0.9 });
const tuft = new THREE.Group(); scene.add(tuft); tuft.visible = false;
for (let i = 0; i < 7; i++) part(new THREE.ConeGeometry(0.04, 0.3, 5), grassMat, tuft, Math.cos(i * 0.9) * 0.08, 0.15, Math.sin(i * 0.9) * 0.08).rotation.z = Math.sin(i) * 0.3;
const moon = part(new THREE.TorusGeometry(0.45, 0.16, 10, 28, Math.PI * 1.15), new THREE.MeshBasicMaterial({ color: 0xfff1a8 }), scene, 0, 0, 0);
moon.visible = false;

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 30% 35%, ${swatchHex(c2)} 0 22%, transparent 24%), radial-gradient(circle at 70% 70%, ${swatchHex(c2)} 0 18%, ${swatchHex(c1)} 20%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Holstein");
  b.onclick = () => { coat.color.setHex(c1); patch.color.setHex(c2); tuftMat.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", label + " cow! Moo!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { moo: 2.4, munch: 3.2, jump: 2.6, bell: 1.8, hop: 1.2, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false;
  if (name === "munch") { tuft.position.set(Math.sin(heading) * 1.25, 0, Math.cos(heading) * 1.25); tuft.scale.setScalar(1); tuft.visible = true; } }
document.getElementById("b-moo").onclick = () => start("moo", "Moooooo!");
document.getElementById("b-munch").onclick = () => start("munch", "Munch munch. Yummy grass!");
document.getElementById("b-jump").onclick = () => start("jump", "I jumped over the moon!");
document.getElementById("b-bell").onclick = () => start("bell", "Ding ding ding!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("cow-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Buttercup", "Clover", "Moo-Moo", "Milkshake", "Bessie", "Moonbeam", "Patches", "Daisy", "Sir Moo-a-lot"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("cow-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "moo", ["Moo!", "Cow hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, head.getWorldPosition(PV()));
}); });

const plush = plushAll(root, { mats: [[coat, 0.04], [patch, 0.04], [tuftMat, 0.05], [muzzleMat, 0], [hornMat, 0], [hoofMat, 0]], paint: [patch] });
plush.buttons(eyes, 0.8, 0.035);
const clock = new THREE.Clock();
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) { act = null; tuft.visible = false; moon.visible = false; }

  // idle: stand facing the viewer, chewing, ears flicking, tail swishing, looking around
  heading = camAngle() + Math.sin(t * 0.3) * 0.3 * m;
  let y = 0, pitch = 0, roll = 0, hx = Math.sin(t * 0.7) * 0.05 * m, hy = Math.sin(t * 0.45) * 0.35 * m, chew = Math.sin(t * 5) * 0.03 * m, bellSwing = Math.sin(t * 2) * 0.08 * m;
  let tailSw = Math.sin(t * 2.2) * 0.4 * m, earFlick = Math.max(0, Math.sin(t * 0.9)) > 0.97 ? Math.sin(t * 40) * 0.4 : 0, step = 0;
  if (act === "moo") {             // head up for a big moo
    heading = camAngle(); const k = Math.sin(Math.min(1, a / 0.4) * Math.PI / 2) * (a < d - 0.3 ? 1 : (d - a) / 0.3);
    hx = -0.45 * k; hy = 0; chew = 0.06 * k * Math.sin(a * 6);
  } else if (act === "munch") {    // walk up to the grass, head down, munch it away
    heading = heading0; const reach = Math.min(1, a / 0.5);
    hx = 0.75 * reach; chew = Math.sin(a * 12) * 0.05; tuft.scale.setScalar(Math.max(0.05, 1 - clamp01((a - 0.8) / 2.0)));
    pitch = 0.08 * reach;
  } else if (act === "jump") {     // a crescent moon appears; the cow leaps high over it
    heading = heading0; const k = clamp01((a - 0.4) / 1.6);
    moon.visible = true; moon.position.set(Math.sin(heading) * 0.6, 3.4 + Math.sin(a * 2) * 0.05, Math.cos(heading) * 0.6 - 0.8); moon.lookAt(camera.position); moon.rotateZ(Math.PI * 0.95);
    y = Math.sin(k * Math.PI) * 2.0; pitch = -Math.sin(k * Math.PI * 2) * 0.25; step = k > 0 && k < 1 ? 0.6 : 0;
  } else if (act === "bell") {     // shake the head to ring the bell
    heading = camAngle(); hy = Math.sin(a * 18) * 0.35 * (1 - p); bellSwing = Math.sin(a * 18) * 0.9 * (1 - p);
  } else if (act === "hop") {
    y = Math.sin(p * Math.PI) * 0.6; heading = heading0 + ease.inOut(p) * Math.PI * 2; step = 0.5;
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.08 * (1 - p); heading = heading0; tailSw = Math.sin(a * 30) * 0.8;
  }

  root.position.set(0, y, 0); root.rotation.set(pitch, heading, roll);
  head.rotation.set(hx, hy, 0); muzzle.rotation.y = chew; bell.rotation.z = bellSwing;
  ears.forEach((e, i) => e.rotation.z = (i ? -1 : 1) * (0.15 + earFlick));
  tail.rotation.z = tailSw;
  legs.forEach((l, i) => l.rotation.x = (i < 2 ? -1 : 1) * step);
  farmTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  if (myGen === GEN) requestAnimationFrame(frame);
}
frame();
