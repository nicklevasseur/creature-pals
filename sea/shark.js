
// ---- the shark: a friendly cartoon shark with a big grin and little rounded teeth
const COLORS = { Ocean: [0x7f97a8, 0xf4f6f8], Blue: [0x4f8fd0, 0xeaf4ff], Bubblegum: [0xf08fb8, 0xffe4ef], Mint: [0x6cc3a8, 0xeefaf5], Tangerine: [0xf2a65a, 0xfff2e0] };
const skin = new THREE.MeshStandardMaterial({ color: COLORS.Ocean[0], roughness: 0.45 });
const belly = new THREE.MeshStandardMaterial({ color: COLORS.Ocean[1], roughness: 0.6 });
const gillMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
const tintGills = () => gillMat.color.copy(skin.color).multiplyScalar(0.7); tintGills();
const mouthMat = new THREE.MeshStandardMaterial({ color: 0x7a2335, roughness: 0.7 });
const toothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
function finGeo(w, h, sweep) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(w, 0); s.quadraticCurveTo(w * 0.45 + sweep * 0.5, h * 0.35, sweep, h); s.quadraticCurveTo(-0.03, h * 0.5, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.025, bevelSegments: 3 }); g.translate(0, 0, -0.025); return g;
}

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); root.add(body);
part(ball, skin, body, 0, 0, 0.1, 0.45, 0.42, 0.9);                     // torso and snout
part(ball, belly, body, 0, -0.14, 0.18, 0.37, 0.3, 0.8);                // white tummy
const dorsal = part(finGeo(0.5, 0.5, 0.38), skin, body, 0, 0.3, 0.3); dorsal.rotation.y = Math.PI / 2;
const tail1 = new THREE.Group(); tail1.position.set(0, 0, -0.62); body.add(tail1);
part(ball, skin, tail1, 0, 0.02, -0.28, 0.27, 0.26, 0.5);
part(ball, belly, tail1, 0, -0.08, -0.24, 0.2, 0.17, 0.42);
const tail2 = new THREE.Group(); tail2.position.set(0, 0.02, -0.68); tail1.add(tail2);
part(ball, skin, tail2, 0, 0, -0.12, 0.12, 0.13, 0.26);
part(ball, skin, tail2, 0, 0.26, -0.32, 0.05, 0.36, 0.13).rotation.x = -0.7;   // tail fin, top
part(ball, skin, tail2, 0, -0.17, -0.28, 0.05, 0.24, 0.1).rotation.x = 0.7;    // tail fin, bottom
const pecs = [], eyes = [];
for (const s of [-1, 1]) {
  const pec = new THREE.Group(); pec.position.set(0.36 * s, -0.17, 0.25); body.add(pec);
  part(ball, skin, pec, 0.22 * s, -0.06, -0.1, 0.3, 0.04, 0.15).rotation.z = -0.4 * s; pecs.push(pec);
  const eye = cartoonEye(body, 0.24 * s, 0.17, 0.74, s, 1.05); eye.rotation.y = 0.45 * s; eyes.push(eye);
  part(ball, blush, body, 0.31 * s, -0.04, 0.7, 0.07, 0.04, 0.03).rotation.y = 0.5 * s;
  for (let i = 0; i < 3; i++) part(new THREE.BoxGeometry(1, 1, 1), gillMat, body, 0.43 * s, 0.02, 0.4 - i * 0.09, 0.012, 0.17, 0.018);
}
// the mouth: a smile when closed; opens to a rosy mouth with a row of rounded teeth
const mouth = new THREE.Group(); mouth.position.set(0, -0.13, 0.86); mouth.rotation.x = 0.35; body.add(mouth);
const smile = part(new THREE.TorusGeometry(0.13, 0.018, 8, 24, Math.PI), dark, mouth, 0, 0.05, 0); smile.rotation.z = Math.PI;
const gape = part(ball, mouthMat, mouth, 0, 0, 0, 0.18, 0.01, 0.05);
const teeth = new THREE.Group(); mouth.add(teeth);
for (let i = -2; i <= 2; i++) { const c = part(new THREE.SphereGeometry(0.03, 10, 8), toothMat, teeth, i * 0.06, 0, 0.035, 1, 1.4, 0.8); }
function setMouth(k) {
  gape.scale.y = 0.01 + 0.13 * k; teeth.position.y = 0.12 * k - 0.025; teeth.visible = k > 0.12; smile.visible = k < 0.25;
}
const glint = part(new THREE.OctahedronGeometry(0.06, 0), shine, mouth, 0.08, 0.16, 0.08); glint.visible = false;

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `linear-gradient(180deg, ${swatchHex(c1)} 55%, ${swatchHex(c2)} 55%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Ocean");
  b.onclick = () => { skin.color.setHex(c1); belly.color.setHex(c2); tintGills(); colorRow.querySelectorAll(".swatch").forEach(s => s.setAttribute("aria-pressed", s === b)); start("shake", label + " shark! Chomp chomp!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { chomp: 2.4, smile: 2.4, zoom: 4.2, roll: 1.6, hop: 1.2, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-chomp").onclick = () => start("chomp", "Chomp chomp chomp! Yum, bubbles!");
document.getElementById("b-smile").onclick = () => start("smile", "Look at my shiny teeth!");
document.getElementById("b-zoom").onclick = () => start("zoom", "Zoom zoom!");
document.getElementById("b-roll").onclick = () => start("roll", "Wheee!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("shark-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Finn", "Chompy", "Gilly", "Toothy", "Captain Fin", "Marina", "Bubba", "Sharkle", "Smiley"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("shark-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "smile", ["Hee hee!", "I'm a friendly shark!", "Fin-tastic!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, body.localToWorld(V(0, 0.6, 0.3)));
}); });

let lastBubble = 0;
const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: hover over the reef side-on to the viewer, swish the tail, flap the side fins
  let x = 0, z = 0, y = 1.35 + Math.sin(t * 1.2) * 0.07 * m;
  heading = camAngle() + 1.0 + Math.sin(t * 0.4) * 0.2 * m;
  let pitch = 0, roll = 0, sp = 3, amp = 0.22 * m, k = 0;
  if (act === "chomp") {           // three big chomps, lunging forward a little each time, bubbles burst out
    k = a < 2.1 ? Math.pow(Math.abs(Math.sin(a * Math.PI * 1.45)), 0.7) : 0;
    const lunge = Math.sin(a * Math.PI * 1.45 * 2) * 0.08; x = Math.sin(heading0) * lunge; z = Math.cos(heading0) * lunge; heading = heading0;
    if (k < 0.1 && a < 2.1 && t - lastBubble > 0.3) { lastBubble = t; const w = mouth.getWorldPosition(V()); for (let i = 0; i < 3; i++) bubble(w.x + (Math.random() - .5) * 0.2, w.y, w.z + (Math.random() - .5) * 0.2, 0.03 + Math.random() * 0.03); }
  } else if (act === "smile") {    // a big toothy grin with a sparkle
    k = a < 0.3 ? ease.out(a / 0.3) * 0.75 : a > 1.9 ? 0.75 * (1 - clamp01((a - 1.9) / 0.3)) : 0.75;
    glint.visible = a > 0.5 && a < 1.3; glint.scale.setScalar(Math.sin(clamp01((a - 0.5) / 0.8) * Math.PI) * 1.4 + 0.01); glint.rotation.y = a * 6;
    heading = camAngle() + 0.5; pitch = -0.1;
  } else if (act === "zoom") {     // a fast lap around the reef
    const [lx, lz, h] = lap(ease.inOut(p) * Math.PI * 2, 1.9, heading0); x = lx; z = lz; heading = h; roll = -Math.sin(p * Math.PI) * 0.5; sp = 9; amp = 0.4;
  } else if (act === "roll") {
    roll = ease.inOut(p) * Math.PI * 2; heading = heading0; sp = 6;
  } else if (act === "hop") {      // a happy porpoise leap
    y += Math.sin(p * Math.PI) * 0.55; pitch = -Math.sin(p * Math.PI * 2) * 0.45; heading = heading0; sp = 6;
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.2 * (1 - p); heading = heading0; sp = 12; amp = 0.35;
  }
  if (act !== "smile") glint.visible = false;

  root.position.set(x, y, z); root.rotation.set(pitch, heading, roll);
  setMouth(k);
  const w = Math.sin(t * sp) * amp;
  tail1.rotation.y = w; tail2.rotation.y = Math.sin(t * sp - 0.9) * amp * 1.5; body.rotation.y = -w * 0.25;
  pecs.forEach((pc, i) => pc.rotation.z = Math.sin(t * 2) * 0.12 * (i ? 1 : -1) * (m || 0));
  const blink = blinkAmount(t);
  eyes.forEach(e => e.scale.y = Math.max(0.08, 1 - blink));

  reefTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
