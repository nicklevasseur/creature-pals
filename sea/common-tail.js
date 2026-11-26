
// ---- shared by the sea friends: the reef's motion, hearts, speech, swimming laps
let nextBubble = 0;
function reefTick(t, m) {
  weeds.forEach(w => w.segs.forEach((g, j) => g.rotation.z = Math.sin(t * 1.2 + w.ph + j * 0.5) * 0.12 * m));
  const fa = t * 0.5 * (m || 0.0001);
  fish.position.set(Math.cos(fa) * 2.8, 2.9 + Math.sin(t) * 0.15 * m, Math.sin(fa) * 2.8); fish.rotation.y = -fa - Math.PI / 2;
  fishTail.rotation.y = Math.sin(t * 10) * 0.4 * m;
  beams.forEach((b, i) => b.material.opacity = 0.05 + Math.sin(t * 0.7 + i * 2) * 0.03 * m);
  if (t > nextBubble) { nextBubble = t + 0.35 + Math.random() * 0.5; bubble((Math.random() - .5) * 6, 0.05, -1 - Math.random() * 2, 0.03 + Math.random() * 0.04); }
  for (let i = bubbles.length - 1; i >= 0; i--) {
    const b = bubbles[i]; b.position.y += 0.012; b.position.x += Math.sin(t * 3 + b.userData.wob) * 0.003;
    if (b.position.y > 4.5) { scene.remove(b); bubbles.splice(i, 1); }
  }
}
const pops = [];
const heartShape = new THREE.Shape(); heartShape.moveTo(0, -0.08);
heartShape.bezierCurveTo(-0.14, 0.02, -0.07, 0.13, 0, 0.06); heartShape.bezierCurveTo(0.07, 0.13, 0.14, 0.02, 0, -0.08);
const heartGeo = new THREE.ShapeGeometry(heartShape);
function popHearts(n, top) {
  sfx("pop");
  if (calm) return;
  for (let i = 0; i < n; i++) {
    const h = new THREE.Mesh(heartGeo, new THREE.MeshBasicMaterial({ color: 0xff6f8f, transparent: true, side: THREE.DoubleSide }));
    h.position.copy(top).add(V((Math.random() - .5) * 0.8, 0.5 + Math.random() * 0.2, 0.2)); h.scale.setScalar(1.6);
    h.userData = { born: performance.now(), dx: (Math.random() - .5) * 0.6 }; scene.add(h); pops.push(h);
    bubble(top.x + (Math.random() - .5) * 0.6, top.y + 0.2, top.z + 0.3, 0.04 + Math.random() * 0.04);
  }
}
function tickPops(now) {
  for (let i = pops.length - 1; i >= 0; i--) {
    const h = pops[i], age = (now - h.userData.born) / 1000;
    h.position.y += 0.014; h.position.x += h.userData.dx * 0.01; h.lookAt(camera.position); h.material.opacity = 1 - age / 1.6;
    if (age > 1.6) { scene.remove(h); h.material.dispose(); pops.splice(i, 1); }
  }
}
const sayEl = document.getElementById("say"); let sayTimer;
function say(t) { sayEl.textContent = t; clearTimeout(sayTimer); sayTimer = setTimeout(() => sayEl.textContent = "", 2600); }
const swatchHex = n => "#" + n.toString(16).padStart(6, "0");
const camAngle = () => Math.atan2(camera.position.x, camera.position.z);
// a swimming lap that starts where the friend is, heading the way it faces, curving left: [x, z, heading]
function lap(phi, R, h0) {
  const x = R * (1 - Math.cos(phi)), z = R * Math.sin(phi);
  return [x * Math.cos(h0) + z * Math.sin(h0), -x * Math.sin(h0) + z * Math.cos(h0), h0 + phi];
}
function tapped(e, root, fn) {
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera); if (ray.intersectObject(root, true).length) fn();
}
let downAt = null;
canvas.addEventListener("pointerdown", e => downAt = [e.clientX, e.clientY]);
const isTap = e => downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) <= 6;
function resize() {
  renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
  camera.position.setLength(camera.aspect < 0.8 ? 10.5 : 7.5); camera.updateProjectionMatrix();
}
addEventListener("resize", resize); resize();
const eyeBlink = { next: 1.5, at: -1 };
function blinkAmount(t) {
  if (t > eyeBlink.next) { eyeBlink.at = t; eyeBlink.next = t + 2 + Math.random() * 3; }
  return eyeBlink.at >= 0 && t - eyeBlink.at < 0.14 ? 1 - Math.abs((t - eyeBlink.at) / 0.07 - 1) : 0;
}
function cartoonEye(parent, x, y, z, s, size = 1) {
  const eye = new THREE.Group(); eye.position.set(x, y, z); parent.add(eye);
  part(ball, eyeWhite, eye, 0, 0, 0, 0.12 * size, 0.13 * size, 0.09 * size);
  part(ball, dark, eye, 0, -0.01 * size, 0.06 * size, 0.07 * size, 0.08 * size, 0.05 * size);
  part(ball, shine, eye, 0.022 * s * size, 0.03 * size, 0.1 * size, 0.022 * size, 0.022 * size, 0.014 * size);
  return eye;
}
const dark = new THREE.MeshStandardMaterial({ color: 0x1d1622, roughness: 0.3 });
const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
const shine = new THREE.MeshBasicMaterial({ color: 0xffffff });
const blush = new THREE.MeshStandardMaterial({ color: 0xff6f8f, roughness: 1, transparent: true, opacity: 0.55 });
const smileGeo = new THREE.TorusGeometry(0.07, 0.014, 8, 20, Math.PI);
