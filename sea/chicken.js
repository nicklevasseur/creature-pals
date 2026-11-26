
// ---- the farmyard: grass, a red barn, a white fence, hay bales, sunflowers, a nest
const hm = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), hm(0x7cc24f)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const barn = new THREE.Group(); barn.position.set(-2.4, 0, -3.4); barn.rotation.y = 0.35; scene.add(barn);
part(new THREE.BoxGeometry(2.2, 1.6, 1.6), hm(0xc8402f), barn, 0, 0.8, 0);
const roofGeo = new THREE.CylinderGeometry(0.01, 1.35, 0.9, 4, 1); roofGeo.rotateY(Math.PI / 4);
const roof = part(roofGeo, hm(0x6b3a2a), barn, 0, 2.05, 0, 1.15, 1, 0.85);
part(new THREE.BoxGeometry(0.7, 0.9, 0.05), hm(0xffffff), barn, 0, 0.45, 0.81); part(new THREE.BoxGeometry(0.5, 0.75, 0.06), hm(0x8a2a20), barn, 0, 0.42, 0.82);
const white = hm(0xf6f2ea);
for (let i = -4; i <= 4; i++) part(new THREE.BoxGeometry(0.1, 0.7, 0.08), white, scene, i * 0.75 + 0.6, 0.35, -2.2);
for (const y of [0.25, 0.55]) part(new THREE.BoxGeometry(6.2, 0.08, 0.05), white, scene, 0.6, y, -2.16);
const hay = hm(0xe7c35a);
for (const [x, z] of [[2.6, -1.4], [3.1, -0.6], [2.8, -1.0]]) part(new THREE.CylinderGeometry(0.4, 0.4, 0.6, 18), hay, scene, x, x === 2.8 ? 0.9 : 0.3, z).rotation.x = Math.PI / 2;
const stem = hm(0x4f8f3a), petal = hm(0xffcf2a), seedMat = hm(0x6b4420), flowers = [];
for (const [x, z, h] of [[-3.2, -1.0, 1.5], [-3.5, -0.2, 1.2], [-2.9, 0.5, 1.35]]) {
  part(new THREE.CylinderGeometry(0.03, 0.04, h, 6), stem, scene, x, h / 2, z);
  const fl = new THREE.Group(); fl.position.set(x, h, z); fl.rotation.x = -0.3; scene.add(fl); flowers.push(fl);
  part(ball, seedMat, fl, 0, 0, 0, 0.14, 0.14, 0.05);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; part(ball, petal, fl, Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0, 0.09, 0.05, 0.02).rotation.z = a; }
}
const nest = new THREE.Group(); nest.position.set(1.6, 0, 1.1); scene.add(nest);
part(new THREE.TorusGeometry(0.3, 0.12, 10, 24), hay, nest, 0, 0.08, 0).rotation.x = Math.PI / 2;
const eggMat = new THREE.MeshStandardMaterial({ color: 0xfff4e2, roughness: 0.5 });
for (const [x, z] of [[-0.08, 0.05], [0.1, -0.06]]) part(ball, eggMat, nest, x, 0.12, z, 0.09, 0.12, 0.09);
function farmTick(t, m) { flowers.forEach((f, i) => f.rotation.z = Math.sin(t * 0.8 + i) * 0.08 * m); }

// ---- the chicken: a round plush hen with a red comb, an orange beak, flappy wings and a fluffy tail
const COLORS = { White: [0xf7f3ea, 0xffe9c2], Buff: [0xe5b46b, 0xffe2a8], Brown: [0x8a4b2a, 0xd9935a], Black: [0x2d2a30, 0x6a6470], Bubblegum: [0xf3a0c4, 0xffd8ea] };
const feather = new THREE.MeshStandardMaterial({ color: COLORS.White[0], roughness: 0.9 });
const fluff = new THREE.MeshStandardMaterial({ color: COLORS.White[1], roughness: 0.9 });
const red = new THREE.MeshStandardMaterial({ color: 0xe23b3b, roughness: 0.8 });
const beakMat = new THREE.MeshStandardMaterial({ color: 0xf6a623, roughness: 0.6 });
const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); root.add(body);
part(ball, feather, body, 0, 0.78, 0, 0.5, 0.46, 0.56);
part(ball, fluff, body, 0, 0.72, 0.3, 0.36, 0.34, 0.26);                  // fluffy chest
const head = new THREE.Group(); head.position.set(0, 1.28, 0.3); body.add(head);
part(ball, feather, head, 0, 0, 0, 0.26, 0.27, 0.25);
for (const [y, z, r] of [[0.27, 0.06, 0.08], [0.3, -0.04, 0.09], [0.26, -0.14, 0.07]]) part(ball, red, head, 0, y, z, 0.05, r, r);   // comb
const beak = new THREE.Group(); beak.position.set(0, -0.02, 0.24); head.add(beak);
const beakGeo = new THREE.ConeGeometry(0.07, 0.16, 12); beakGeo.rotateX(Math.PI / 2); beakGeo.translate(0, 0, 0.07);
part(beakGeo, beakMat, beak, 0, 0, 0, 1, 0.75, 1);
part(ball, red, head, 0, -0.14, 0.2, 0.05, 0.08, 0.05);                   // wattle
const eyes = [];
for (const s of [-1, 1]) { eyes.push(cartoonEye(head, 0.13 * s, 0.07, 0.17, s, 0.7)); part(ball, blush, head, 0.17 * s, -0.04, 0.17, 0.05, 0.03, 0.02); }
const wings = [];
for (const s of [-1, 1]) {
  const w = new THREE.Group(); w.position.set(0.44 * s, 0.86, -0.02); body.add(w);
  part(ball, feather, w, 0.04 * s, -0.08, -0.05, 0.1, 0.3, 0.38).rotation.x = 0.35; wings.push(w);
}
const tail = new THREE.Group(); tail.position.set(0, 0.95, -0.48); body.add(tail);
for (const r of [-0.35, 0, 0.35]) part(ball, feather, tail, r * 0.3, 0.18, -0.05, 0.08, 0.3, 0.14).rotation.set(-0.5, 0, r);
const legs = [];
for (const s of [-1, 1]) {
  const lg = new THREE.Group(); lg.position.set(0.17 * s, 0.38, 0.05); body.add(lg);
  part(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 8), beakMat, lg, 0, -0.17, 0);
  for (const r of [-0.5, 0, 0.5]) { const toe = part(new THREE.CylinderGeometry(0.02, 0.016, 0.16, 6), beakMat, lg, Math.sin(r) * 0.07, -0.34, Math.cos(r) * 0.07); toe.rotation.set(Math.PI / 2, 0, -r); }
  legs.push(lg);
}
const egg = part(ball, eggMat, scene, 0, 0.12, 0, 0.11, 0.14, 0.11); egg.visible = false;
const seeds = [];
for (let i = 0; i < 10; i++) { const sd = part(ball, hm(0xd9a441), scene, 0, 0.02, 0, 0.025, 0.015, 0.02); sd.visible = false; seeds.push(sd); }

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 50% 60%, ${swatchHex(c2)} 0 30%, ${swatchHex(c1)} 32%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "White");
  b.onclick = () => { feather.color.setHex(c1); fluff.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", label + " chicken! Bawk bawk!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0;
const DUR = { egg: 3.4, peck: 2.6, flap: 2.0, dance: 3.6, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; if (line) say(line); controls.autoRotate = false;
  if (name === "peck") seeds.forEach((sd, i) => { const r = 0.4 + Math.random() * 0.35, a = heading + (Math.random() - .5) * 1.4; sd.position.set(Math.sin(a) * r, 0.02, Math.cos(a) * r); sd.visible = true; }); }
document.getElementById("b-egg").onclick = () => start("egg", "Hmmm... hmmm...");
document.getElementById("b-peck").onclick = () => start("peck", "Peck peck! Yummy seeds!");
document.getElementById("b-flap").onclick = () => start("flap", "Flap flap flap!");
document.getElementById("b-dance").onclick = () => start("dance", "Chicken dance!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("chicken-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Henrietta", "Nugget", "Clucky", "Peep", "Daisy", "Pancake", "Lady Cluck", "Sunny", "Waffles"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("chicken-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "flap", ["Bawk!", "Feather hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, head.getWorldPosition(PV()));
}); });

const plush = plushAll(root, { mats: [[feather, 0.045], [fluff, 0.05], [red, 0]] });
plush.buttons(eyes, 0.75, 0.04);
const clock = new THREE.Clock();
let eggSaid = false;
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) { act = null; seeds.forEach(sd => sd.visible = false); }

  // idle: stand facing the viewer, head bobbing and tilting the way hens do, tail twitching
  heading = camAngle() + Math.sin(t * 0.35) * 0.3 * m;
  let y = 0, pitch = 0, roll = 0, sq = 1, hx = 0, hy = Math.sin(t * 0.6) * 0.4 * m, hz = Math.sin(t * 1.1) * 0.12 * m;
  let flap = Math.max(0, Math.sin(t * 0.9)) > 0.98 ? Math.sin(t * 30) * 0.3 : 0, hz2 = 0, kneeL = 0, kneeR = 0;
  const bob = Math.floor(t * 1.3) % 3 === 0 ? Math.sin(t * 8) * 0.05 : 0;
  if (act === "egg") {             // settle down, wiggle, stand up: an egg!
    heading = heading0; const sit = a < 0.5 ? ease.out(a / 0.5) : a < 2.0 ? 1 : 1 - ease.out(clamp01((a - 2.0) / 0.4));
    y = -sit * 0.3; roll = a > 0.6 && a < 2.0 ? Math.sin(a * 22) * 0.07 : 0; hz = roll;
    egg.visible = a > 2.0; if (egg.visible) { const k = clamp01((a - 2.1) / 0.8); egg.position.set(Math.sin(heading) * (-0.2 - k * 0.5), 0.14, Math.cos(heading) * (-0.2 - k * 0.5)); egg.rotation.x = -k * 6; }
    if (a > 2.1 && !eggSaid) { eggSaid = true; say("Ta-da! An egg!"); }
  } else if (act === "peck") {     // peck at scattered seeds, which vanish one by one
    heading = heading0; const pk = Math.max(0, Math.sin(a * 9)); pitch = pk * 0.45; hx = pk * 0.6;
    seeds.forEach((sd, i) => { if (a > 0.3 + i * 0.22) sd.visible = false; });
  } else if (act === "flap") {     // flap hard and hop up
    flap = Math.sin(a * 28) * 0.9; y = Math.abs(Math.sin(a * 3)) * 0.35; heading = heading0;
  } else if (act === "dance") {    // the chicken dance: beak, wings, wiggle, clap
    heading = camAngle(); const beat = Math.floor(a * 4) % 4;
    flap = beat === 1 ? Math.sin(a * 30) * 0.8 : 0; roll = beat === 2 ? Math.sin(a * 20) * 0.15 : 0; hx = beat === 0 ? Math.sin(a * 30) * 0.2 : 0;
    y = beat === 3 ? Math.abs(Math.sin(a * 12)) * 0.15 : 0; kneeL = Math.sin(a * 8) * 0.3; kneeR = -kneeL;
  } else if (act === "hop") {
    y = Math.sin(p * Math.PI) * 0.5; heading = heading0 + ease.inOut(p) * Math.PI * 2; flap = Math.sin(a * 30) * 0.6;
  } else if (act === "shake") {    // fluff up the feathers
    roll = Math.sin(a * 40) * 0.1 * (1 - p); heading = heading0; sq = 1 + Math.sin(p * Math.PI) * 0.08;
  }
  if (act !== "egg") { eggSaid = false; if (!act) egg.visible = false; }

  root.position.set(0, y, 0); root.rotation.set(pitch, heading, roll); body.scale.set(sq, sq, sq);
  head.rotation.set(hx + bob, hy, hz + hz2);
  wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.max(0, flap));
  tail.rotation.y = Math.sin(t * 2.5) * 0.12 * m; legs[0].rotation.x = kneeL; legs[1].rotation.x = kneeR;
  farmTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
