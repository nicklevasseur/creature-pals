
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = { out: t => 1 - Math.pow(1 - t, 3), inOut: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 };
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v)), clamp01 = t => clamp(t, 0, 1), lerp = (a, b, t) => a + (b - a) * t;

const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(2.5, 2.6, 6.5);
const controls = new THREE.OrbitControls(camera, canvas);
controls.target.set(0, 1.4, 0); controls.enableDamping = true; controls.enablePan = false;
controls.minDistance = 3.5; controls.maxDistance = 14; controls.maxPolarAngle = Math.PI * 0.52;
controls.autoRotate = !calm; controls.autoRotateSpeed = 0.5;
controls.addEventListener("start", () => controls.autoRotate = false);

scene.add(new THREE.HemisphereLight(0xfff6d8, 0x4a6a2a, 0.75));
const sunLight = new THREE.DirectionalLight(0xfff0c8, 0.85);
sunLight.position.set(4, 8, 5); sunLight.castShadow = true; sunLight.shadow.mapSize.set(1024, 1024);
Object.assign(sunLight.shadow.camera, { left: -5, right: 5, top: 6, bottom: -5 });
scene.add(sunLight);

const ball = new THREE.SphereGeometry(1, 32, 24);
function part(geo, mat, parent, x, y, z, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function bubble() {}   // the shared helpers puff bubbles under the sea; there are none in the jungle

// the jungle clearing: palm trees, a big tree whose branch holds the swinging vine, leafy plants, hibiscus, butterflies
const hm = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), hm(0x6aa84f)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const ringA = hm(0x8b6b45), ringB = hm(0x7a5c3a), frond = hm(0x3f9a45), nut = hm(0x5a3b22);
for (const [x, z, h, lean] of [[-3.2, -1.6, 3.6, 0.5], [3.4, -2.2, 3.2, -0.45], [-4.3, 1.7, 2.8, 0.3], [4.1, 1.3, 3.0, -0.35]]) {
  for (let i = 0; i < 8; i++) { const f = (i + 0.5) / 8; part(new THREE.CylinderGeometry(0.13 - i * 0.008, 0.15 - i * 0.008, h / 8 + 0.02, 10), i % 2 ? ringA : ringB, scene, x + lean * f * f, h * f, z); }
  const crown = new THREE.Group(); crown.position.set(x + lean, h, z); scene.add(crown);
  for (let k = 0; k < 7; k++) { const g = new THREE.Group(); g.rotation.set(0.55, k / 7 * Math.PI * 2, 0, "YXZ"); crown.add(g); part(ball, frond, g, 0, 0, 0.6, 0.17, 0.03, 0.65); }
  for (let k = 0; k < 3; k++) part(ball, nut, crown, Math.cos(k * 2.1) * 0.13, -0.12, Math.sin(k * 2.1) * 0.13, 0.09, 0.09, 0.09);
}
const pivot = V(0, 4.5, 0), treeAt = V(-2.6, 0, -2.9);
part(new THREE.CylinderGeometry(0.28, 0.42, 5.2, 12), hm(0x6b4a30), scene, treeAt.x, 2.6, treeAt.z);
const branch = new THREE.Group(); branch.position.set(treeAt.x, 4.3, treeAt.z); scene.add(branch); branch.lookAt(pivot.clone().add(V(0.4, 0, 0.3)));
const bLen = branch.position.distanceTo(pivot) + 0.5, bGeo = new THREE.CylinderGeometry(0.1, 0.17, bLen, 10); bGeo.rotateX(Math.PI / 2); bGeo.translate(0, 0, bLen / 2);
part(bGeo, hm(0x6b4a30), branch, 0, 0, 0);
const canopy = hm(0x2f7a3a);
for (const [x, y, z, r] of [[-2.6, 5.4, -2.9, 1.3], [-1.6, 4.9, -1.9, 0.8], [-0.6, 4.9, -0.7, 0.7], [0.4, 4.85, 0.3, 0.6], [-3.4, 5.0, -2.2, 0.9]]) part(ball, canopy, scene, x, y, z, r, r * 0.75, r);
// the vine hangs from the branch, its end just above the monkey's head
const vine = new THREE.Group(); vine.position.copy(pivot); vine.rotation.order = "YXZ"; scene.add(vine);
const vineLen = 2.0, vGeo = new THREE.CylinderGeometry(0.03, 0.035, vineLen, 6); vGeo.translate(0, -vineLen / 2, 0);
const vineMat = hm(0x4d8a2e); part(vGeo, vineMat, vine, 0, 0, 0);
for (let i = 1; i < 6; i++) part(ball, frond, vine, (i % 2 ? 1 : -1) * 0.07, -i * 0.33, 0, 0.08, 0.02, 0.05).rotation.z = (i % 2 ? -1 : 1) * 0.5;
const leafMat = hm(0x2f8a40);
for (const [x, z] of [[-1.9, -1.3], [2.0, -1.5], [2.5, 1.9], [-2.4, 2.2], [0.3, -2.6]]) {
  for (let k = 0; k < 6; k++) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = k * 1.05 + x; scene.add(g); part(ball, leafMat, g, 0, 0.3, 0.38, 0.17, 0.02, 0.42).rotation.x = -0.55; }
}
const petal = hm(0xff5c8a), pollen = hm(0xffd23f);
for (const [x, y, z] of [[-1.7, 0.55, -1.0], [2.2, 0.5, -1.2], [2.3, 0.6, 2.2], [-2.1, 0.5, 2.5], [0.6, 0.45, -2.3]]) {
  const fl = new THREE.Group(); fl.position.set(x, y, z); fl.rotation.x = -0.4; scene.add(fl);
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; part(ball, petal, fl, Math.sin(a) * 0.08, 0, Math.cos(a) * 0.08, 0.075, 0.015, 0.055).rotation.y = a; }
  part(ball, pollen, fl, 0, 0.02, 0, 0.025, 0.04, 0.025);
}
const butterflies = [];
for (const [c, ph] of [[0xffa63d, 0], [0x7ec8ff, 2.5]]) {
  const bf = new THREE.Group(); scene.add(bf); const wm = new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }), wings = [];
  for (const s of [-1, 1]) { const w = new THREE.Group(); bf.add(w); part(ball, wm, w, 0.09 * s, 0, 0, 0.09, 0.01, 0.07); wings.push(w); }
  part(ball, hm(0x2a1d14), bf, 0, 0, 0, 0.015, 0.015, 0.06);
  butterflies.push({ bf, wings, ph });
}
function jungleTick(t, m) {
  butterflies.forEach(({ bf, wings, ph }) => {
    const a = t * 0.45 * (m || 0.0001) + ph;
    bf.position.set(Math.sin(a) * 2.4, 1.6 + Math.sin(a * 2.3) * 0.4, Math.sin(a * 2) * 1.2 + 0.6); bf.rotation.y = Math.cos(a) > 0 ? 0.3 : Math.PI - 0.3;
    wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.sin(t * 18) * 0.8 * (m || 0.3));
  });
}
