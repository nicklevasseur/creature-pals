
// ---- the manta ray: wide flapping wings, a white belly, little horn fins and a long thin tail
const COLORS = { Midnight: [0x2c3b57, 0xf4f6fa], Ocean: [0x3d7fb3, 0xeef6ff], Bubblegum: [0xe982b0, 0xffe6f0], Violet: [0x7e5bb5, 0xf3ecff], Teal: [0x2f8f8a, 0xe9fbf7] };
const skin = new THREE.MeshStandardMaterial({ color: COLORS.Midnight[0], roughness: 0.5 });
const belly = new THREE.MeshStandardMaterial({ color: COLORS.Midnight[1], roughness: 0.6 });

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); body.scale.setScalar(0.85); root.add(body);
part(ball, skin, body, 0, 0.02, 0, 0.42, 0.14, 0.62);
part(ball, belly, body, 0, -0.02, 0.02, 0.4, 0.12, 0.58);
// wings: one smooth curved fin each side (dark on top, white underneath); the flap ripples out toward the tip
const wingShape = new THREE.Shape(); wingShape.moveTo(0, -0.42);
wingShape.quadraticCurveTo(0.85, -0.42, 1.35, 0.3); wingShape.quadraticCurveTo(0.7, 0.18, 0, 0.5); wingShape.lineTo(0, -0.42);
function wingGeo(lift) {
  const g = new THREE.ExtrudeGeometry(wingShape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.03, bevelSegments: 2, curveSegments: 20 });
  g.rotateX(-Math.PI / 2); g.translate(0, lift, 0); return g;
}
const wingTop = wingGeo(0.0), wingBot = wingGeo(-0.045), wingBase = [wingTop, wingBot].map(g => g.attributes.position.array.slice());
for (const s of [-1, 1]) {
  for (const [geo, mat] of [[wingTop, skin], [wingBot, belly]]) { const w = part(geo, mat, body, 0.22 * s, 0, 0); w.scale.x = s; }
  part(ball, belly, body, 0.42 * s, 0.06, 0.12, 0.13, 0.02, 0.13);                // the pale shoulder patch
}
function bendWings(t, sp, amp) {
  [wingTop, wingBot].forEach((g, k) => {
    const pos = g.attributes.position, base = wingBase[k];
    for (let i = 0; i < pos.count; i++) { const x = base[i * 3]; pos.array[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * sp - x * 1.8) * amp * x * 0.9; }
    pos.needsUpdate = true; g.computeVertexNormals();
  });
}
const eyes = [];
for (const s of [-1, 1]) {
  part(ball, skin, body, 0.15 * s, 0.0, 0.66, 0.05, 0.045, 0.16).rotation.y = -0.3 * s;   // the little horn fins
  const eye = cartoonEye(body, 0.19 * s, 0.12, 0.42, s, 0.8); eye.rotation.y = 0.35 * s; eyes.push(eye);
  part(ball, blush, body, 0.26 * s, 0.07, 0.5, 0.05, 0.02, 0.03).rotation.y = 0.4 * s;
}
const smile = part(new THREE.TorusGeometry(0.11, 0.016, 8, 24, Math.PI), dark, body, 0, 0.0, 0.6); smile.rotation.set(-0.5, 0, Math.PI);
const tail = []; let tp = new THREE.Group(); tp.position.set(0, 0.02, -0.58); body.add(tp);
for (let j = 0; j < 5; j++) {
  const g = new THREE.Group(); g.position.z = j ? -0.24 : 0; if (!j) g.rotation.x = 0.35; tp.add(g);
  const len = 0.25, r = 0.035 - j * 0.006, geo = new THREE.CylinderGeometry(r * 0.8, r, len, 8); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -len / 2);
  part(geo, skin, g, 0, 0, 0); tail.push(g); tp = g;
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `linear-gradient(180deg, ${swatchHex(c1)} 55%, ${swatchHex(c2)} 55%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Midnight");
  b.onclick = () => { skin.color.setHex(c1); belly.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(s => s.setAttribute("aria-pressed", s === b)); start("shake", label + " wings! Flap flap!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { swoop: 5.0, backflip: 2.6, flap: 2.4, roll: 1.8, hop: 1.4, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-swoop").onclick = () => start("swoop", "Wheee! I'm flying underwater!");
document.getElementById("b-backflip").onclick = () => start("backflip", "Backflip!");
document.getElementById("b-flap").onclick = () => start("flap", "Flap flap flap!");
document.getElementById("b-roll").onclick = () => start("roll", "Look at my white tummy!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("manta-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Skye", "Glider", "Flapjack", "Pancake", "Kite", "Domino", "Wings", "Manny", "Breezy"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("manta-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "flap", ["Hee hee!", "Wing hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, body.localToWorld(V(0, 0.4, 0.2)));
}); });

const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: glide in place facing the viewer, wings rippling slowly
  heading = camAngle() + 0.55 + Math.sin(t * 0.3) * 0.25 * m;
  let x = 0, z = 0, y = 1.2 + Math.sin(t * 0.9) * 0.1 * m, pitch = 0.22, roll = Math.sin(t * 0.6) * 0.06 * m, amp = 0.3 * m, sp = 1.8;
  if (act === "swoop") {           // a big slow lap around the reef, banking into the turn
    const [lx, lz, h] = lap(ease.inOut(p) * Math.PI * 2, 1.7, heading0); x = lx; z = lz; heading = h; roll = -Math.sin(p * Math.PI) * 0.45; y += Math.sin(p * Math.PI * 2) * 0.3; amp = 0.4; sp = 2.6;
  } else if (act === "backflip") { // up and over in a loop, like real mantas do
    const phi = ease.inOut(p) * Math.PI * 2, R = 0.75; heading = heading0;
    y += R * (1 - Math.cos(phi)); x = Math.sin(heading0) * R * Math.sin(phi); z = Math.cos(heading0) * R * Math.sin(phi); pitch = -phi; amp = 0.35; sp = 3;
  } else if (act === "flap") {     // big strong flaps that lift it up
    amp = 0.7; sp = 6; y += Math.sin(p * Math.PI) * 0.45; heading = heading0;
  } else if (act === "roll") {     // a slow barrel roll to show off the white belly
    roll = ease.inOut(p) * Math.PI * 2; heading = heading0; amp = 0.2;
  } else if (act === "hop") {
    y += Math.sin(p * Math.PI) * 0.4; heading = heading0 + ease.inOut(p) * Math.PI * 2; amp = 0.45; sp = 4;
  } else if (act === "shake") {
    roll = Math.sin(a * 30) * 0.2 * (1 - p); heading = heading0; amp = 0.5; sp = 10;
  }

  const flap = Math.sin(t * sp);
  root.position.set(x, y - flap * amp * 0.08, z); root.rotation.set(pitch, heading, roll);
  bendWings(t, sp, amp);
  tail.forEach((g, j) => g.rotation.y = Math.sin(t * 2 - j * 0.6) * 0.15 * (m || 0));
  const blink = blinkAmount(t);
  eyes.forEach(e => e.scale.y = Math.max(0.08, 1 - blink));

  reefTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
