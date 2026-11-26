
// ---- the city park: grass, a paved path, a bench, a lamppost, round trees, a skyline behind
const hm = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), hm(0x86c25a)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const path = new THREE.Mesh(new THREE.RingGeometry(1.1, 2.0, 48), hm(0xc9c3b8)); path.rotation.x = -Math.PI / 2; path.position.y = 0.01; path.receiveShadow = true; scene.add(path);
const plaza = new THREE.Mesh(new THREE.CircleGeometry(1.1, 40), hm(0xd8d2c6)); plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.012; plaza.receiveShadow = true; scene.add(plaza);
const bench = new THREE.Group(); bench.position.set(-2.4, 0, -1.6); bench.rotation.y = 0.6; scene.add(bench);
const wood = hm(0x9a6a3e), iron = hm(0x3b3f45);
for (const z of [0, 0.16, 0.32]) part(new THREE.BoxGeometry(1.6, 0.06, 0.12), wood, bench, 0, 0.45, z - 0.16);
for (const y of [0.62, 0.78]) part(new THREE.BoxGeometry(1.6, 0.1, 0.05), wood, bench, 0, y, -0.25);
for (const x of [-0.7, 0.7]) { part(new THREE.BoxGeometry(0.06, 0.45, 0.4), iron, bench, x, 0.22, 0); part(new THREE.BoxGeometry(0.06, 0.6, 0.06), iron, bench, x, 0.6, -0.26); }
const lamp = new THREE.Group(); lamp.position.set(2.3, 0, -1.4); scene.add(lamp);
part(new THREE.CylinderGeometry(0.05, 0.08, 2.6, 10), iron, lamp, 0, 1.3, 0);
part(ball, new THREE.MeshStandardMaterial({ color: 0xfff1b8, emissive: 0xffe08a, emissiveIntensity: 0.5 }), lamp, 0, 2.7, 0, 0.18, 0.22, 0.18);
const leaves = hm(0x4f9a46), trunk = hm(0x7a5534);
for (const [x, z, s] of [[-3.6, -2.6, 1.0], [3.4, -3.0, 1.2], [-4.2, 0.6, 0.8], [4.0, 0.4, 0.9]]) {
  part(new THREE.CylinderGeometry(0.12 * s, 0.16 * s, 1.4 * s, 8), trunk, scene, x, 0.7 * s, z);
  part(ball, leaves, scene, x, 1.7 * s, z, 0.8 * s, 0.7 * s, 0.8 * s); part(ball, leaves, scene, x + 0.4 * s, 1.5 * s, z + 0.2, 0.5 * s, 0.45 * s, 0.5 * s);
}
const city = [0xa7b4c9, 0x93a3bd, 0xb9c3d4, 0x8d9bb4];
for (let i = 0; i < 12; i++) { const h = 1.5 + ((i * 7) % 5) * 0.7, x = -7 + i * 1.25; part(new THREE.BoxGeometry(1.0, h, 0.8), hm(city[i % 4]), scene, x, h / 2, -7.5 - (i % 3) * 0.6); }
const crumbs = [];
for (let i = 0; i < 9; i++) { const c = part(new THREE.DodecahedronGeometry(0.035, 0), hm(0xe0b871), scene, 0, 0.03, 0); c.visible = false; crumbs.push(c); }
function parkTick(t, m) { lamp.children[1].material.emissiveIntensity = 0.45 + Math.sin(t * 2) * 0.05 * m; }

// ---- the pigeon: a round grey plush bird with a shimmery neck, wing bars, a little beak and pink feet
const COLORS = { City: [0x8f96a3, 0x5f9a86], Dove: [0xf4f4f0, 0xe2dfe8], Brown: [0x8a6a55, 0x7d9a6a], Bubblegum: [0xf0a0c8, 0xc77fd0], Blue: [0x6f8fd0, 0x4fb0a0] };
const feather = new THREE.MeshStandardMaterial({ color: COLORS.City[0], roughness: 0.9 });
const neckMat = new THREE.MeshStandardMaterial({ color: COLORS.City[1], roughness: 0.5, metalness: 0.25 });
const barMat = new THREE.MeshStandardMaterial({ color: 0x4a4f58, roughness: 0.9 });
const pinkFeet = new THREE.MeshStandardMaterial({ color: 0xf08a9a, roughness: 0.7 });
const beakMat = new THREE.MeshStandardMaterial({ color: 0x3a3438, roughness: 0.5 }), cere = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.8 });
const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); root.add(body);
part(ball, feather, body, 0, 0.62, -0.05, 0.42, 0.4, 0.58);
part(ball, neckMat, body, 0, 0.88, 0.22, 0.3, 0.3, 0.28);                  // shimmery puffy neck
const head = new THREE.Group(); head.position.set(0, 1.14, 0.34); body.add(head);
part(ball, feather, head, 0, 0, 0, 0.21, 0.21, 0.22);
const beakGeo = new THREE.ConeGeometry(0.04, 0.14, 10); beakGeo.rotateX(Math.PI / 2); beakGeo.translate(0, 0, 0.06);
part(beakGeo, beakMat, head, 0, -0.04, 0.2); part(ball, cere, head, 0, -0.01, 0.21, 0.035, 0.025, 0.03);
const eyes = [];
for (const s of [-1, 1]) { eyes.push(cartoonEye(head, 0.11 * s, 0.05, 0.14, s, 0.6)); part(ball, blush, head, 0.14 * s, -0.05, 0.13, 0.04, 0.025, 0.02); }
const wings = [];
for (const s of [-1, 1]) {
  const w = new THREE.Group(); w.position.set(0.38 * s, 0.72, 0.0); body.add(w);
  part(ball, feather, w, 0.03 * s, -0.04, -0.12, 0.1, 0.24, 0.46).rotation.x = 0.25;
  for (const z of [-0.2, -0.32]) part(ball, barMat, w, 0.1 * s, -0.02, z, 0.035, 0.12, 0.05);   // wing bars
  wings.push(w);
}
const tail = new THREE.Group(); tail.position.set(0, 0.6, -0.6); body.add(tail);
part(ball, feather, tail, 0, 0.02, -0.18, 0.2, 0.05, 0.28); part(ball, barMat, tail, 0, 0.05, -0.38, 0.17, 0.04, 0.08);
const legs = [];
for (const s of [-1, 1]) {
  const lg = new THREE.Group(); lg.position.set(0.14 * s, 0.26, 0.05); body.add(lg);
  part(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 8), pinkFeet, lg, 0, -0.12, 0);
  for (const r of [-0.5, 0, 0.5]) { const toe = part(new THREE.CylinderGeometry(0.018, 0.014, 0.13, 6), pinkFeet, lg, Math.sin(r) * 0.06, -0.24, Math.cos(r) * 0.06); toe.rotation.set(Math.PI / 2, 0, -r); }
  legs.push(lg);
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `linear-gradient(160deg, ${swatchHex(c2)} 35%, ${swatchHex(c1)} 36%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "City");
  b.onclick = () => { feather.color.setHex(c1); neckMat.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", label + " pigeon! Coo coo!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { coo: 2.6, strut: 3.6, fly: 5.0, snack: 2.8, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false;
  if (name === "snack") crumbs.forEach(c => { const r = 0.4 + Math.random() * 0.3, a = heading + (Math.random() - .5) * 1.2; c.position.set(Math.sin(a) * r, 0.03, Math.cos(a) * r); c.visible = true; }); }
document.getElementById("b-coo").onclick = () => start("coo", "Coo-roo-coo!");
document.getElementById("b-strut").onclick = () => start("strut", "Strutting my stuff!");
document.getElementById("b-fly").onclick = () => start("fly", "Up, up and away!");
document.getElementById("b-snack").onclick = () => start("snack", "Crumbs! My favorite!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("pigeon-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Coco", "Gus", "Pidge", "Dusty", "Bagel", "Skyler", "Sir Coos-a-lot", "Pebbles", "Breadcrumb"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("pigeon-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "coo", ["Coo!", "Wing hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, head.getWorldPosition(PV()));
}); });

const plush = plushAll(root, { mats: [[feather, 0.035], [neckMat, 0.03], [barMat, 0.03], [cere, 0]] });
plush.buttons(eyes, 0.65, 0.035);
const clock = new THREE.Clock();
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) { act = null; crumbs.forEach(c => c.visible = false); }

  // idle: stand on the plaza, the pigeon head-bob, a glance this way and that
  heading = camAngle() + Math.sin(t * 0.4) * 0.35 * m;
  let x = 0, z = 0, y = 0, pitch = 0, roll = 0, puff = 1, hz = Math.sin(t * 0.9) * 0.1 * m, hy = Math.sin(t * 0.5) * 0.4 * m;
  let headFwd = (Math.floor(t * 1.5) % 4 === 0 ? Math.sin(t * 9.4) : 0) * 0.05 * m, flap = 0, step = 0, peck = 0;
  if (act === "coo") {             // puff up the chest, bob and bow while cooing
    heading = camAngle(); puff = 1 + Math.sin(Math.min(1, a / 0.4) * Math.PI / 2) * 0.14 * (a < d - 0.3 ? 1 : 1 - (a - (d - 0.3)) / 0.3);
    pitch = Math.max(0, Math.sin(a * 5)) * 0.25; headFwd = Math.sin(a * 10) * 0.04;
  } else if (act === "strut") {    // walk a little circle, head bobbing with each step
    const [lx, lz, h] = lap(ease.inOut(p) * Math.PI * 2, 0.6, heading0); x = lx; z = lz; heading = h; step = Math.sin(a * 12); headFwd = Math.sin(a * 12) * 0.08;
  } else if (act === "fly") {      // take off, fly a lap above the park, glide down and land
    const up = a < 0.6 ? ease.out(a / 0.6) : a > d - 0.9 ? 1 - ease.inOut((a - (d - 0.9)) / 0.9) : 1;
    const [lx, lz, h] = lap(ease.inOut(clamp01((a - 0.4) / (d - 1.2))) * Math.PI * 2, 1.6, heading0); x = lx * up; z = lz * up; heading = h;
    y = up * 1.6; flap = Math.sin(a * (up < 1 ? 30 : 16)) * 1.1; pitch = -0.15 * up; roll = -0.3 * up * Math.sin(p * Math.PI);
  } else if (act === "snack") {    // peck up the crumbs one by one
    heading = heading0; peck = Math.max(0, Math.sin(a * 9)); pitch = peck * 0.5;
    crumbs.forEach((c, i) => { if (a > 0.3 + i * 0.25) c.visible = false; });
  } else if (act === "hop") {
    y = Math.sin(p * Math.PI) * 0.5; heading = heading0 + ease.inOut(p) * Math.PI * 2; flap = Math.sin(a * 28) * 0.7;
  } else if (act === "shake") {    // fluff the feathers
    roll = Math.sin(a * 40) * 0.1 * (1 - p); heading = heading0; puff = 1 + Math.sin(p * Math.PI) * 0.08;
  }

  root.position.set(x, y, z); root.rotation.set(pitch, heading, roll); body.scale.set(puff, puff, puff);
  head.position.z = 0.34 + headFwd; head.rotation.set(peck * 0.4, hy * (act ? 0.3 : 1), hz);
  wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.max(0, flap));
  legs[0].rotation.x = step * 0.4; legs[1].rotation.x = -step * 0.4; tail.rotation.x = Math.sin(t * 2) * 0.05 * m;
  parkTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
