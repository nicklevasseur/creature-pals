
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
function farmTick(t, m) { flowers.forEach((f, i) => f.rotation.z = Math.sin(t * 0.8 + i) * 0.08 * m); }

