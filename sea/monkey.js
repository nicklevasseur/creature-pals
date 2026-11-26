
// ---- the monkey: big ears, a heart-shaped face, long arms and a curly tail
const COLORS = { Brown: [0x7a4b2a, 0xf1d3b0], Golden: [0xc98a3a, 0xfbe6c4], Chocolate: [0x4b2e1c, 0xe0bf9c], Bubblegum: [0xe58ab0, 0xffe2ee], Silver: [0x8e8a94, 0xf1eef4] };
const fur = new THREE.MeshStandardMaterial({ color: COLORS.Brown[0], roughness: 0.85 });
const face = new THREE.MeshStandardMaterial({ color: COLORS.Brown[1], roughness: 0.8 });
const limb = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r0, r1, len, 10); g.translate(0, -len / 2, 0); return g; };   // hangs down from 0

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); root.add(body);
part(ball, fur, body, 0, 0.95, 0, 0.4, 0.48, 0.34);
part(ball, face, body, 0, 0.9, 0.2, 0.28, 0.34, 0.16);                 // tummy
const head = new THREE.Group(); head.position.set(0, 1.62, 0.03); body.add(head);
part(ball, fur, head, 0, 0, 0, 0.38, 0.35, 0.34);
part(ball, face, head, -0.09, 0.07, 0.2, 0.17, 0.17, 0.15); part(ball, face, head, 0.09, 0.07, 0.2, 0.17, 0.17, 0.15);   // heart-shaped face
part(ball, face, head, 0, -0.08, 0.24, 0.22, 0.16, 0.14);                // muzzle
for (const s of [-1, 1]) part(ball, dark, head, 0.035 * s, -0.04, 0.37, 0.018, 0.014, 0.01);   // nostrils
const smile = part(smileGeo, dark, head, 0, -0.12, 0.36, 1.2, 1.2, 1); smile.rotation.set(-0.3, 0, Math.PI);
const eyes = [];
for (const s of [-1, 1]) {
  eyes.push(cartoonEye(head, 0.1 * s, 0.08, 0.31, s, 0.75));
  part(ball, fur, head, 0.38 * s, 0.03, -0.02, 0.14, 0.14, 0.06);       // ears
  part(ball, face, head, 0.4 * s, 0.03, 0.01, 0.09, 0.09, 0.04);
  part(ball, blush, head, 0.2 * s, -0.06, 0.28, 0.06, 0.035, 0.03);
}
for (const [x, r] of [[0, 0.33], [-0.06, 0.6], [0.06, -0.6]]) part(ball, fur, head, x, 0.34, -0.03, 0.06, 0.11, 0.06).rotation.z = r;   // hair tuft
const arms = [], legs = [];
for (const s of [-1, 1]) {
  const sh = new THREE.Group(); sh.position.set(0.36 * s, 1.25, 0); body.add(sh);
  part(limb(0.07, 0.065, 0.42), fur, sh, 0, 0, 0);
  const el = new THREE.Group(); el.position.y = -0.42; sh.add(el);
  part(limb(0.065, 0.06, 0.36), fur, el, 0, 0, 0); part(ball, face, el, 0, -0.42, 0, 0.08, 0.09, 0.07);
  arms.push({ sh, el, s });
  const hip = new THREE.Group(); hip.position.set(0.17 * s, 0.58, 0); body.add(hip);
  part(limb(0.085, 0.075, 0.3), fur, hip, 0, 0, 0);
  const knee = new THREE.Group(); knee.position.y = -0.3; hip.add(knee);
  part(limb(0.075, 0.07, 0.22), fur, knee, 0, 0, 0); part(ball, face, knee, 0, -0.25, 0.07, 0.1, 0.06, 0.15);
  legs.push({ hip, knee, s });
}
const tail = []; let tp = new THREE.Group(); tp.position.set(0, 0.62, -0.28); tp.rotation.x = -1.9; body.add(tp);
for (let j = 0; j < 12; j++) {
  const g = new THREE.Group(); g.position.y = j ? 0.12 : 0; tp.add(g);
  const geo = new THREE.CylinderGeometry(0.042 - j * 0.0016, 0.045 - j * 0.0016, 0.13, 8); geo.translate(0, 0.06, 0);
  part(geo, fur, g, 0, 0, 0); tail.push(g); tp = g;
}
// arm: [forward lift, outward lift, elbow bend]; leg: [forward lift, knee bend, spread]
function pose(L, R, LL = [0, 0, 0], LR = [0, 0, 0]) {
  [L, R].forEach((v, i) => { const a = arms[i]; a.sh.rotation.set(v[0], 0, v[1] * a.s); a.el.rotation.x = v[2]; });
  [LL, LR].forEach((v, i) => { const l = legs[i]; l.hip.rotation.set(-v[0], 0, v[2] * l.s); l.knee.rotation.x = v[1]; });
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 50% 58%, ${swatchHex(c2)} 0 34%, ${swatchHex(c1)} 36%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Brown");
  b.onclick = () => { fur.color.setHex(c1); face.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(s => s.setAttribute("aria-pressed", s === b)); start("shake", label + " monkey! Ooh ooh!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { swing: 4.2, peek: 2.8, ooh: 2.8, cart: 2.6, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-swing").onclick = () => start("swing", "Wheee! Vine swing!");
document.getElementById("b-peek").onclick = () => start("peek", "Where did I go?");
document.getElementById("b-ooh").onclick = () => start("ooh", "Ooh ooh ah ah!");
document.getElementById("b-cart").onclick = () => start("cart", "Cartwheel time!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("monkey-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Coco", "Bongo", "Mango", "Peanut", "Kiki", "Banjo", "Zuzu", "Cheeky", "Noodle"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("monkey-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "ooh", ["Hee hee!", "Monkey hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, head.getWorldPosition(V()));
}); });

const clock = new THREE.Clock();
let peekSaid = 0;
function frame() {
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: stand facing the viewer, breathe, sway the arms, look around, tail curling
  heading = camAngle() + Math.sin(t * 0.4) * 0.25 * m;
  let pos = V(0, 0, 0), pitch = 0, roll = 0, swing = Math.sin(t * 0.8) * 0.03 * m, sy = 1 + Math.sin(t * 2) * 0.012 * m;
  let L = [Math.sin(t * 1.2) * 0.12 * m, 0.22, -0.3], R = [-Math.sin(t * 1.2) * 0.12 * m, 0.22, -0.3], LL = [0, 0, 0], LR = [0, 0, 0];
  let hx = Math.sin(t * 0.7) * 0.06 * m, hy = Math.sin(t * 0.5) * 0.3 * m, hz = Math.sin(t * 0.9) * 0.08 * m, eyeBig = 1;
  const local = (x, y) => V(x * Math.cos(heading0), y, -x * Math.sin(heading0));   // sideways from where it faced at the start
  if (act === "swing") {           // jump up, grab the vine, swing back and forth, drop down
    heading = heading0; L = R = [0, 2.95, 0]; LL = LR = [0.7, 1.1, 0.1];
    const up = a < 0.4 ? ease.out(a / 0.4) : a > d - 0.45 ? 1 - ease.inOut((a - (d - 0.45)) / 0.45) : 1;
    const env = Math.sin(clamp01((a - 0.4) / (d - 0.85)) * Math.PI);
    const th = a > 0.4 && a < d - 0.45 ? Math.sin((a - 0.4) * 3.0) * 0.45 * env : 0;
    const h = pivot.y - 0.45 * up; swing = th;
    const off = local(h * Math.sin(th), 0); pos = V(off.x, pivot.y - h * Math.cos(th), off.z); roll = th;
    if (up < 1) { pos.y = 0.45 * up; L = R = [0, lerp(0.22, 2.95, up), lerp(-0.3, 0, up)]; LL = LR = [0.7 * up, 1.1 * up, 0.1 * up]; }
  } else if (act === "peek") {     // hands over the eyes... then peekaboo! Twice.
    const k = (a % 1.4) / 1.4, covered = k < 0.5;
    L = R = covered ? [-1.75, -0.55, -1.25] : [-1.0, 1.6, -0.2]; eyeBig = covered ? 1 : 1.25; hx = covered ? 0.2 : -0.2;
    pos.y = covered ? 0 : Math.sin(clamp01((k - 0.5) / 0.25) * Math.PI) * 0.15;
    if (!covered && now - peekSaid > 1000) { peekSaid = now; say("Peekaboo!"); }
  } else if (act === "ooh") {      // bounce, scratch head and tummy, swap sides halfway
    heading = heading0; const b = Math.abs(Math.sin(a * 7)); pos.y = b * 0.22; LL = LR = [0.3 * b, 0.6 * b, 0.25];
    const swap = a > d / 2, jig = Math.sin(a * 34) * 0.25;
    const onHead = [-0.4, 2.5, -1.4 + jig], onTum = [-0.6, 0.6, -1.6 + jig];
    L = swap ? onTum : onHead; R = swap ? onHead : onTum; hz = Math.sin(a * 7) * 0.2; hx = -0.15;
  } else if (act === "cart") {     // a cartwheel to one side and back again
    heading = heading0; L = R = [0, 1.7, 0]; LL = LR = [0, 0, 0.55];
    const half = a < d / 2, e = ease.inOut(clamp01((half ? a : a - d / 2) / (d / 2)));
    const phi = (half ? e : 1 - e) * Math.PI * 2 * (half ? 1 : -1), x = (half ? e : 1 - e) * 1.4;
    roll = -phi; const o = local(x - Math.sin(phi), 0); pos = V(o.x, 1 - Math.cos(phi), o.z);
  } else if (act === "hop") {
    pos.y = Math.sin(p * Math.PI) * 0.6; L = R = [0, 2.6, 0]; LL = LR = [0.5 * Math.sin(p * Math.PI), 0.9 * Math.sin(p * Math.PI), 0.2];
    heading = heading0 + ease.inOut(p) * Math.PI * 2;
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.12 * (1 - p); heading = heading0; hy = Math.sin(a * 40) * 0.4 * (1 - p);
  }

  root.position.copy(pos); root.rotation.set(pitch, heading, roll);
  body.scale.set(1, sy, 1);
  vine.rotation.set(0, act === "swing" ? heading0 : 0, swing);
  pose(L, R, LL, LR);
  head.rotation.set(hx, hy, hz);
  tail.forEach((g, j) => { if (j) g.rotation.x = 0.3 + Math.sin(t * 1.5 - j * 0.4) * 0.06 * m; });
  tail[0].rotation.z = Math.sin(t * 1.1) * 0.2 * m;
  const blink = blinkAmount(t);
  eyes.forEach(e => e.scale.set(eyeBig, Math.max(0.08, 1 - blink) * eyeBig, eyeBig));

  jungleTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
