
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

