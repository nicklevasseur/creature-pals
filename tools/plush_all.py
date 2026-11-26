"""Add plushAll (automatic plush makeover for any friend) next to the otter's plush helpers in src."""
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
assert "function plushAll" not in C
assert C.count("  return { items, sdf, attrs, grad };") == 1
C = C.replace("  return { items, sdf, attrs, grad };", "  return { items, sdf, attrs, grad, one };")
code = r'''
// ---- plush makeover for any friend (2026-11-26): every group under `root` that directly holds body shapes becomes one
// seamless soft shape; each material has its own pile length (0 = smooth felt); `felt(mesh)` marks faces with no pile.
function plushAll(root, { mats, felt = () => false }) {
  const lens = new Map(mats), matList = mats.map(m => m[0]);
  const fullSphere = g => g.type === "SphereGeometry" && Math.abs((g.parameters.phiLength ?? Math.PI * 2) - Math.PI * 2) < 1e-3 && Math.abs((g.parameters.thetaLength ?? Math.PI) - Math.PI) < 1e-3;
  const fatTube = g => g.type === "CylinderGeometry" && Math.min(g.parameters.radiusTop, g.parameters.radiusBottom) > 0.015 && Math.max(g.parameters.radiusTop, g.parameters.radiusBottom) > 0.03;
  const absorb = o => o.isMesh && o.visible && lens.has(o.material) && (fullSphere(o.geometry) || fatTube(o.geometry));
  const groups = new Set(); root.traverse(o => { if (absorb(o)) groups.add(o.parent); });
  root.updateMatrixWorld(true);
  const parts = [];
  for (const g of groups) {
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), items = [];
    for (const o of g.children.filter(absorb)) {
      const rel = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), P = PV(), Q = new THREE.Quaternion(), S = PV();
      rel.decompose(P, Q, S);
      const mi = matList.indexOf(o.material), len = felt(o) ? 0 : lens.get(o.material), gp = o.geometry.parameters;
      if (o.geometry.type === "CylinderGeometry") {      // a tube becomes a capsule along its long axis
        o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox, sz = bb.getSize(PV()), c = bb.getCenter(PV());
        const ax = sz.x >= sz.y && sz.x >= sz.z ? "x" : sz.z >= sz.y ? "z" : "y", sc = { x: S.x, y: S.y, z: S.z };
        const perp = ["x", "y", "z"].filter(k => k !== ax), r = (gp.radiusTop + gp.radiusBottom) / 2 * Math.max(sc[perp[0]], sc[perp[1]]);
        const half = Math.max(0, sz[ax] / 2 - r / Math.max(sc[ax], 1e-6)), a = c.clone(), b = c.clone(); a[ax] -= half; b[ax] += half;
        items.push({ cap: 1, a: a.applyMatrix4(rel), b: b.applyMatrix4(rel), r, mi, len, w: 0, f: 0 });
      } else items.push({ cap: 0, c: P, m: new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(Q.invert())).elements, r: S.multiplyScalar(gp.radius || 1), mi, len, w: 0, f: 0 });
      g.remove(o);
    }
    const S = plushSdf(items), geo = plushGeometry(S), pos = geo.attributes.position.array, n = pos.length / 3, M = matList.length;
    const wts = new Float32Array(n * M), flen = new Float32Array(n);
    for (let v = 0; v < n; v++) {
      const ds = items.map(s => S.one(s, pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2])), lo = Math.min(...ds); let sw = 0;
      items.forEach((s, i) => { const e = Math.exp(-(ds[i] - lo) / 0.02); sw += e; wts[v * M + s.mi] += e; flen[v] += e * s.len; });
      for (let k = 0; k < M; k++) wts[v * M + k] /= sw; flen[v] /= sw;
    }
    geo.setAttribute("furLen", new THREE.Float32BufferAttribute(flen, 1));
    const base = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); base.castShadow = base.receiveShadow = true; g.add(base);
    const longest = flen.reduce((a, b) => Math.max(a, b), 0), layers = longest > 0.025 ? PLUSH.layers : longest > 0.002 ? 4 : 0;
    for (let k = 1; k <= layers; k++) g.add(new THREE.Mesh(geo, plushFurMatV(k / layers)));
    parts.push({ g, geo, S, wts, M });
  }
  let key = "";
  const recolor = () => {
    const now = matList.map(m => m.color.getHex()).join(); if (now === key) return; key = now;
    for (const { geo, wts, M } of parts) {
      const col = geo.attributes.color.array, n = col.length / 3;
      for (let v = 0; v < n; v++) { let r = 0, gg = 0, b = 0; for (let k = 0; k < M; k++) { const w = wts[v * M + k]; if (w > 1e-4) { const c = matList[k].color; r += c.r * w; gg += c.g * w; b += c.b * w; } } col[v * 3] = r; col[v * 3 + 1] = gg; col[v * 3 + 2] = b; }
      geo.attributes.color.needsUpdate = true;
    }
  };
  recolor();
  const partOf = o => { for (let q = o; q; q = q.parent) { const f = parts.find(pt => pt.g === q); if (f) return f; } };
  // button eyes stitched onto the new surface, in place of the old eyes
  const buttons = (eyeGroups, size = 1) => eyeGroups.forEach(e => {
    const pt = partOf(e.parent); if (!pt) return;
    const lp = pt.g.worldToLocal(e.getWorldPosition(PV())), n = PV(...pt.S.grad(lp.x, lp.y, lp.z));
    stickOn(pt, buttonEye(size), lp, n); e.visible = false;
  });
  // move a face detail (smile, mouth, nostril) back onto the new surface, keeping its own orientation
  const resurface = (objs, lift = 0.006) => objs.forEach(o => {
    const pt = partOf(o.parent); if (!pt) return;
    const lp = pt.g.worldToLocal(o.getWorldPosition(PV())), n = PV(...pt.S.grad(lp.x, lp.y, lp.z)), q = PV();
    for (let t = 0.5; t > -0.5; t -= 0.004) { q.copy(lp).addScaledVector(n, t); if (pt.S.sdf(q.x, q.y, q.z) <= 0) break; }
    o.position.copy(o.parent.worldToLocal(pt.g.localToWorld(q.addScaledVector(n, lift))));
  });
  return { parts, recolor, partOf, buttons, resurface };
}
function plushFurMatV(f) {            // a fur shell whose length comes from each vertex (furLen), so felt areas grow none
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, color: new THREE.Color().setScalar(0.72 + 0.32 * f) });
  m.onBeforeCompile = sh => {
    sh.uniforms.uF = { value: f }; sh.uniforms.uCut = { value: 0.08 + 0.85 * f };
    sh.vertexShader = "attribute float furLen;\nvarying float vLen;\nvarying vec3 vBase;\nuniform float uF;\n" +
      sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vBase = position; vLen = furLen;\n  transformed += normal * furLen * uF; transformed.y -= 0.25 * furLen * uF * uF;");
    sh.fragmentShader = "varying float vLen;\nvarying vec3 vBase;\nuniform float uCut;\n" +
      sh.fragmentShader.replace("void main() {", "void main() {\n  if (vLen < 0.002) discard;\n  float h = pow(fract(sin(dot(floor(vBase * 160.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453), 0.7);\n  if (h < uCut) discard;");
  };
  m.customProgramCacheKey = () => "plush-fur-v";
  return m;
}
'''
assert C.count("\nfunction possum() {") == 1
C = C.replace("\nfunction possum() {", code + "\nfunction possum() {")
p.write_text(C, encoding="utf-8"); print("plushAll added")
