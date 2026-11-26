
// ---- the crab: a round shell, eyes on stalks, two big claws and six legs that scuttle sideways
const COLORS = { Red: [0xe8452f, 0xffc7ae], Orange: [0xf28c28, 0xffe0b8], Blue: [0x3b7dd8, 0xc9e2ff], Bubblegum: [0xf07fb0, 0xffd8ea], Purple: [0x8a5cc7, 0xe7dbff] };
const shell = new THREE.MeshStandardMaterial({ color: COLORS.Red[0], roughness: 0.5 });
const pale = new THREE.MeshStandardMaterial({ color: COLORS.Red[1], roughness: 0.6 });
const sandMat = new THREE.MeshStandardMaterial({ color: 0xd2b77c, roughness: 1 });
const along = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r1, r0, len, 10); g.rotateZ(-Math.PI / 2); g.translate(len / 2, 0, 0); return g; };   // runs along +x
const cyl = (r0, r1, len) => { const g = new THREE.CylinderGeometry(r1, r0, len, 10); g.rotateX(Math.PI / 2); g.translate(0, 0, len / 2); return g; };    // runs along +z

const root = new THREE.Group(); root.rotation.order = "YXZ"; scene.add(root);
const body = new THREE.Group(); body.position.y = 0.05; root.add(body);
part(ball, shell, body, 0, 0.36, 0, 0.58, 0.27, 0.44);                    // the round shell
part(ball, pale, body, 0, 0.25, 0.03, 0.5, 0.16, 0.38);                   // pale underside
for (const s of [-1, 1]) part(ball, shell, body, 0.4 * s, 0.42, -0.05, 0.16, 0.12, 0.2);   // shell shoulders
const smile = part(smileGeo, dark, body, 0, 0.3, 0.44, 1.2, 1.2, 1); smile.rotation.z = Math.PI;
const eyes = [], stalks = [];
for (const s of [-1, 1]) {
  const st = new THREE.Group(); st.position.set(0.15 * s, 0.5, 0.28); st.rotation.z = -0.2 * s; body.add(st);
  part(new THREE.CylinderGeometry(0.03, 0.035, 0.22, 8), shell, st, 0, 0.11, 0);
  eyes.push(cartoonEye(st, 0, 0.25, 0.02, s, 0.9)); stalks.push(st);
  part(ball, blush, body, 0.3 * s, 0.33, 0.38, 0.06, 0.035, 0.03);
}
// six walking legs: up and out to a knee, then down to the sand
const legs = [];
for (let i = 0; i < 3; i++) for (const s of [-1, 1]) {
  const lg = new THREE.Group(); lg.position.set(0.42 * s, 0.3, 0.12 - i * 0.18); lg.rotation.order = "YXZ"; lg.rotation.y = (s > 0 ? 0 : Math.PI) + (i - 1) * 0.35 * s; body.add(lg);
  const thigh = new THREE.Group(); thigh.rotation.z = 0.45; lg.add(thigh);
  part(along(0.045, 0.04, 0.3), shell, thigh, 0, 0, 0);
  const knee = new THREE.Group(); knee.position.x = 0.3; knee.rotation.z = -1.45; thigh.add(knee);
  part(ball, shell, knee, 0, 0, 0, 0.045, 0.045, 0.045);
  part(along(0.04, 0.022, 0.34), shell, knee, 0, 0, 0);
  legs.push({ thigh, knee, i, s });
}
// two big claws on arms, held up in front; the top pincer opens
const arms = [];
for (const s of [-1, 1]) {
  const sh = new THREE.Group(); sh.position.set(0.42 * s, 0.34, 0.3); sh.rotation.order = "YXZ"; body.add(sh);
  part(cyl(0.06, 0.055, 0.26), shell, sh, 0, 0, 0);
  const el = new THREE.Group(); el.position.z = 0.26; el.rotation.y = -0.9 * s; sh.add(el);
  part(ball, shell, el, 0, 0, 0, 0.065, 0.065, 0.065);
  const claw = new THREE.Group(); claw.position.z = 0.05; el.add(claw);
  part(ball, shell, claw, 0, 0, 0.16, 0.17, 0.14, 0.22);
  part(ball, pale, claw, 0, -0.07, 0.14, 0.12, 0.07, 0.16);
  part(ball, shell, claw, 0, -0.05, 0.42, 0.075, 0.055, 0.15);           // bottom pincer
  const top = new THREE.Group(); top.position.set(0, 0.05, 0.32); claw.add(top);
  part(ball, shell, top, 0, 0, 0.11, 0.075, 0.055, 0.15);                 // top pincer
  arms.push({ sh, top, s });
}
const setArm = (arm, lift, swing, open) => { arm.sh.rotation.set(-lift, 0.75 * arm.s + swing * arm.s, 0); arm.top.rotation.x = -open; };
// sand puffs for digging
const puffs = [];
function sandPuff(n = 8) {
  if (calm) return;
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(ball, new THREE.MeshStandardMaterial({ color: 0xd9c08a, roughness: 1, transparent: true }));
    m.scale.setScalar(0.06 + Math.random() * 0.05); m.position.set(root.position.x + (Math.random() - .5) * 0.8, 0.1, root.position.z + (Math.random() - .5) * 0.6);
    m.userData = { born: performance.now(), v: PV((Math.random() - .5) * 0.03, 0.02 + Math.random() * 0.02, (Math.random() - .5) * 0.03) }; scene.add(m); puffs.push(m);
  }
}

const colorRow = document.getElementById("colors");
for (const [label, [c1, c2]] of Object.entries(COLORS)) {
  const b = document.createElement("button");
  b.className = "swatch"; b.style.background = `radial-gradient(circle at 35% 35%, ${swatchHex(c2)} 0 24%, ${swatchHex(c1)} 26%)`;
  b.setAttribute("aria-label", label); b.setAttribute("aria-pressed", label === "Red");
  b.onclick = () => { shell.color.setHex(c1); pale.color.setHex(c2); colorRow.querySelectorAll(".swatch").forEach(x => x.setAttribute("aria-pressed", x === b)); start("shake", label + " crab! Click clack!"); };
  colorRow.append(b);
}
let act = null, actStart = 0, heading = 0, heading0 = 0, lastBubble = 0, dug = false;
const DUR = { side: 3.2, snip: 2.2, dig: 3.4, bubbles: 2.8, hop: 1.1, shake: 0.9 };
function start(name, line) { sfx(name); act = name; actStart = performance.now(); heading0 = heading; dug = false; if (line) say(line); controls.autoRotate = false; }
document.getElementById("b-side").onclick = () => start("side", "Crabs walk sideways! Scuttle scuttle!");
document.getElementById("b-snip").onclick = () => start("snip", "Click clack! Click clack!");
document.getElementById("b-dig").onclick = () => start("dig", "Dig dig dig... peekaboo!");
document.getElementById("b-bubbles").onclick = () => start("bubbles", "Look at my bubbles!");
const nameEl = document.getElementById("name");
try { const n = localStorage.getItem("crab-name"); if (n) nameEl.textContent = n; } catch (e) {}
document.getElementById("b-name").onclick = () => {
  const names = ["Sandy", "Snappy", "Shelly", "Scuttle", "Coral", "Clicky", "Pebble", "Sir Sideways", "Bubbles"];
  const n = names[Math.floor(Math.random() * names.length)];
  nameEl.textContent = n; try { localStorage.setItem("crab-name", n); } catch (e) {}
  start("hop", "My name is " + n + "!");
};
canvas.addEventListener("pointerup", e => { if (isTap(e)) tapped(e, root, () => {
  start(Math.random() < 0.5 ? "hop" : "snip", ["Hee hee!", "Claw hug!", "That tickles!", "Best friends!"][Math.floor(Math.random() * 4)]);
  popHearts(4, body.localToWorld(PV(0, 0.6, 0.2)));
}); });

// plush makeover: seamless soft shell, short velvety pile; the eyes stay on their stalks like the lobster's
const plush = plushAll(root, { mats: [[shell, 0.01], [pale, 0.01]] });
plush.resurface([smile]);
const clock = new THREE.Clock();
function frame() {
  plush.recolor();
  const t = clock.getElapsedTime(), now = performance.now(), m = calm ? 0 : 1;
  const a = act ? (now - actStart) / 1000 : 0, d = act ? DUR[act] : 1, p = clamp01(a / d);
  if (act && a > d) act = null;

  // idle: sit on the sand facing the viewer, eyes swaying, claws gently opening, legs fidgeting
  heading = camAngle() + Math.sin(t * 0.35) * 0.2 * m;
  let x = 0, y = Math.sin(t * 1.6) * 0.01 * m, roll = 0, pitch = 0, legSp = 2, legAmp = 0.05 * m;
  let L = [0.35, 0, 0.2 + Math.sin(t * 1.2) * 0.18 * m], R = [0.35, 0, 0.2 + Math.sin(t * 1.2 + 1) * 0.18 * m];
  if (act === "side") {            // scuttle sideways one way, then back
    heading = heading0; x = Math.sin(p * Math.PI * 2) * 0.9; legSp = 22; legAmp = 0.35; roll = Math.sin(a * 22) * 0.04;
    L = R = [0.55, 0.1, 0.3];
  } else if (act === "snip") {
    heading = heading0; L = [0.7, 0.15, Math.max(0, Math.sin(a * 14)) * 0.7]; R = [0.7, 0.15, Math.max(0, Math.sin(a * 14 + Math.PI)) * 0.7];
  } else if (act === "dig") {      // wiggle down into the sand, peek out, pop back up
    heading = heading0; const down = a < 1.2 ? ease.inOut(a / 1.2) : a < 2.4 ? 1 : 1 - ease.out((a - 2.4) / 0.6);
    y = -down * 0.38 + (a > 2.4 && a < 3.0 ? Math.sin((a - 2.4) / 0.6 * Math.PI) * 0.25 : 0); roll = Math.sin(a * 30) * 0.08 * (a < 1.2 ? 1 : 0);
    legSp = 26; legAmp = a < 1.2 ? 0.4 : 0.05;
    if (!dug && a > 0.2) { dug = true; sandPuff(10); }
    if (a > 1.6 && a < 1.65) say("Peekaboo!");
  } else if (act === "bubbles") {  // blow a stream of bubbles, claws waving
    heading = camAngle(); const w = Math.sin(a * 6); L = [1.0 + w * 0.2, 0.2, 0.3]; R = [1.0 - w * 0.2, 0.2, 0.3];
    if (t - lastBubble > 0.12) { lastBubble = t; const mp = smile.getWorldPosition(PV()); bubble(mp.x + (Math.random() - .5) * 0.1, mp.y + 0.05, mp.z + 0.1, 0.03 + Math.random() * 0.05); }
  } else if (act === "hop") {
    y += Math.sin(p * Math.PI) * 0.5; heading = heading0 + ease.inOut(p) * Math.PI * 2; L = R = [1.0, 0.2, 0.5];
  } else if (act === "shake") {
    roll = Math.sin(a * 40) * 0.12 * (1 - p); heading = heading0; L = R = [0.5, 0, 0.5];
  }

  root.position.set(x * Math.cos(heading0), y, -x * Math.sin(heading0)); root.rotation.set(pitch, heading, roll);
  setArm(arms[0], ...L); setArm(arms[1], ...R);
  legs.forEach(l => { const w = Math.sin(t * legSp + l.i * 1.4 + (l.s > 0 ? 0 : Math.PI)); l.thigh.rotation.z = 0.45 + w * legAmp; l.thigh.rotation.y = w * legAmp * 0.6; });
  stalks.forEach((st, i) => st.rotation.y = Math.sin(t * 0.8 + i * 2) * 0.25 * m);
  const blink = blinkAmount(t);
  eyes.forEach(e => e.scale.y = Math.max(0.08, 1 - blink));
  for (let i = puffs.length - 1; i >= 0; i--) {
    const pf = puffs[i], age = (now - pf.userData.born) / 1000; pf.position.add(pf.userData.v); pf.userData.v.y -= 0.0012; pf.material.opacity = 1 - age / 1.2;
    if (age > 1.2) { scene.remove(pf); pf.material.dispose(); puffs.splice(i, 1); }
  }

  reefTick(t, m); tickPops(now);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
