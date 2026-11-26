"""Shell fur for the otter: each furry part gets thin see-through copies a little bigger than it, cut into strands by a
noise map. Outer shells keep fewer strands, so the fur tapers; inner shells are darker, like real fur's roots."""
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
a, b = C.index("function otter() {"), C.index("function sloth() {")
O = C[a:b]
def rep(x, y):
    global O
    assert O.count(x) == 1, x[:80]; O = O.replace(x, y)
rep("const pops = [];", '''// ---- soft fur: shells cut into strands by a noise map (a classic game technique that runs fine on tablets)
const FUR_LAYERS = calm ? 8 : 16;
const furTex = (() => {
  const n = 64, d = new Uint8Array(n * n * 4);
  for (let i = 0; i < n * n; i++) { const v = Math.random() ** 0.7 * 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  const t = new THREE.DataTexture(d, n, n, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 5);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t;
})();
const furSync = [];
function furLayers(src) {
  const mats = [];
  for (let k = 1; k <= FUR_LAYERS; k++) {
    const f = k / FUR_LAYERS, m = new THREE.MeshStandardMaterial({ roughness: 1, alphaMap: furTex, alphaTest: 0.08 + 0.85 * f });
    furSync.push([m, src, 0.72 + 0.32 * f]); mats.push(m);
  }
  return mats;
}
const furMats = new Map([[fur, furLayers(fur)], [cream, furLayers(cream)], [earMat, furLayers(earMat)]]);
const furry = [];
root.traverse(o => { if (o.isMesh && o.geometry === ball && furMats.has(o.material) && o.parent !== face) furry.push(o); });
for (const m of furry) {
  const len = Math.min(0.055, Math.min(m.scale.x, m.scale.y, m.scale.z) * 0.22);
  furMats.get(m.material).forEach((lm, i) => {
    const f = (i + 1) / FUR_LAYERS, s = new THREE.Mesh(ball, lm);
    s.position.copy(m.position); s.position.y -= 0.012 * f * f; s.quaternion.copy(m.quaternion);
    s.scale.set(m.scale.x + len * f, m.scale.y + len * f, m.scale.z + len * f); m.parent.add(s);
  });
}
const syncFur = () => furSync.forEach(([m, src, k]) => m.color.copy(src.color).multiplyScalar(k));
// a soft light from behind outlines the fuzzy edges
const rimLight = new THREE.DirectionalLight(0xcdefff, 0.45); rimLight.position.set(-4, 3, -5); scene.add(rimLight);

const pops = [];''')
rep("  controls.update();\n  renderer.render(scene, camera);", "  syncFur();\n  controls.update();\n  renderer.render(scene, camera);")
p.write_text(C[:a] + O + C[b:], encoding="utf-8"); print("ok, furry parts code added")
