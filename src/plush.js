// ---- plush makeover: the fur/cream shapes of each moving part melt into one seamless soft shape (a smooth blend of
// the same spheres and tubes), fur grows from it except on the felt face, and motion is eased so nothing snaps.
const PLUSH = { layers: calm ? 8 : 14, furLen: 0.042, cell: 0.03, blend: 0.09 };
function plushify({ groups, face, fur, cream, ear, keepFace = [] }) {
  const owner = o => { for (let p = o.parent; p; p = p.parent) if (groups.includes(p)) return p; };
  const inFace = o => { for (let p = o.parent; p; p = p.parent) if (p === face) return true; return false; };
  const furry = o => o.isMesh && (o.material === fur || o.material === cream || o.material === ear) && !keepFace.includes(o) &&
    (o.geometry.type === "SphereGeometry" || (o.geometry.type === "CylinderGeometry" && o.geometry.parameters.radiusBottom > 0.03));
  const parts = [];
  for (const g of groups) {
    g.updateMatrixWorld(true);
    const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), items = [], take = [];
    g.traverse(o => { if (furry(o) && owner(o) === g) take.push(o); });
    if (!take.length) continue;
    for (const o of take) {
      const rel = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3();
      rel.decompose(P, Q, S);
      const w = o.material === cream ? 1 : o.material === ear ? 0.35 : 0, f = face && inFace(o) ? 1 : 0;
      if (o.geometry.type === "CylinderGeometry") {
        const gp = o.geometry.parameters;
        items.push({ cap: 1, a: V(0, -gp.height / 2, 0).applyMatrix4(rel), b: V(0, gp.height / 2, 0).applyMatrix4(rel), r: (gp.radiusTop + gp.radiusBottom) / 2 * S.x, w, f });
      } else items.push({ cap: 0, c: P, m: new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(Q.invert())).elements, r: S, w, f });
      o.parent.remove(o);
    }
    const S = plushSdf(items), geo = plushGeometry(S);
    const base = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 })); base.castShadow = base.receiveShadow = true; g.add(base);
    for (let k = 1; k <= PLUSH.layers; k++) { const sh = new THREE.Mesh(geo, plushFurMat(k / PLUSH.layers)); g.add(sh); }
    parts.push({ g, geo, S });
  }
  let key = "";
  const recolor = () => {
    const now = fur.color.getHex() + "/" + cream.color.getHex(); if (now === key) return; key = now;
    for (const { geo } of parts) {
      const w = geo.attributes.furW.array, col = geo.attributes.color.array;
      for (let i = 0; i < w.length; i++) { const c = fur.color.clone().lerp(cream.color, w[i]); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
      geo.attributes.color.needsUpdate = true;
    }
  };
  recolor();
  return { parts, recolor, find: g => parts.find(p => p.g === g) };
}
function plushSdf(items) {
  const k = PLUSH.blend;
  const one = (s, x, y, z) => {
    if (s.cap) {
      const px = x - s.a.x, py = y - s.a.y, pz = z - s.a.z, bx = s.b.x - s.a.x, by = s.b.y - s.a.y, bz = s.b.z - s.a.z;
      const h = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz)));
      return Math.hypot(px - bx * h, py - by * h, pz - bz * h) - s.r;
    }
    const dx = x - s.c.x, dy = y - s.c.y, dz = z - s.c.z, e = s.m;
    const qx = e[0] * dx + e[3] * dy + e[6] * dz, qy = e[1] * dx + e[4] * dy + e[7] * dz, qz = e[2] * dx + e[5] * dy + e[8] * dz;
    const k0 = Math.hypot(qx / s.r.x, qy / s.r.y, qz / s.r.z), k1 = Math.hypot(qx / (s.r.x * s.r.x), qy / (s.r.y * s.r.y), qz / (s.r.z * s.r.z));
    return k1 < 1e-9 ? -Math.min(s.r.x, s.r.y, s.r.z) : k0 * (k0 - 1) / k1;
  };
  const sdf = (x, y, z) => { let d = 1e9; for (const s of items) { const b = one(s, x, y, z), h = Math.max(k - Math.abs(d - b), 0) / k; d = Math.min(d, b) - h * h * k * 0.25; } return d; };
  const attrs = (x, y, z) => {          // colour weight and felt-face mask, blended by how close each shape is
    const ds = items.map(s => one(s, x, y, z)), lo = Math.min(...ds); let sw = 0, w = 0, f = 0;
    items.forEach((s, i) => { const e = Math.exp(-(ds[i] - lo) / 0.02); sw += e; w += e * s.w; f += e * s.f; });
    return [w / sw, f / sw];
  };
  const grad = (x, y, z) => { const e = 0.003, gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e), l = Math.hypot(gx, gy, gz) || 1; return [gx / l, gy / l, gz / l]; };
  return { items, sdf, attrs, grad };
}
function plushGeometry(S) {           // naive surface nets: one vertex per surface cell, snapped onto the surface
  const lo = V(1e9, 1e9, 1e9), hi = V(-1e9, -1e9, -1e9);
  for (const s of S.items) {
    if (s.cap) { for (const p of [s.a, s.b]) { lo.min(V(p.x - s.r, p.y - s.r, p.z - s.r)); hi.max(V(p.x + s.r, p.y + s.r, p.z + s.r)); } }
    else { const R = Math.max(s.r.x, s.r.y, s.r.z); lo.min(V(s.c.x - R, s.c.y - R, s.c.z - R)); hi.max(V(s.c.x + R, s.c.y + R, s.c.z + R)); }
  }
  lo.subScalar(0.06); hi.addScalar(0.06);
  const c = PLUSH.cell, nx = Math.ceil((hi.x - lo.x) / c) + 1, ny = Math.ceil((hi.y - lo.y) / c) + 1, nz = Math.ceil((hi.z - lo.z) / c) + 1;
  const at = (i, j, k) => i + nx * (j + ny * k), val = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) val[at(i, j, k)] = S.sdf(lo.x + i * c, lo.y + j * c, lo.z + k * c);
  const vid = new Int32Array(nx * ny * nz).fill(-1), pos = [], nor = [], fw = [], fm = [];
  const EDGES = []; for (let n = 0; n < 8; n++) for (const b of [1, 2, 4]) if (!(n & b)) EDGES.push([n, n | b]);
  const cv = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    let inside = 0;
    for (let n = 0; n < 8; n++) { cv[n] = val[at(i + (n & 1), j + ((n >> 1) & 1), k + ((n >> 2) & 1))]; if (cv[n] < 0) inside++; }
    if (inside === 0 || inside === 8) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for (const [a, b] of EDGES) {
      if ((cv[a] < 0) === (cv[b] < 0)) continue;
      const t = cv[a] / (cv[a] - cv[b]);
      sx += (a & 1) + t * ((b & 1) - (a & 1)); sy += ((a >> 1) & 1) + t * (((b >> 1) & 1) - ((a >> 1) & 1)); sz += ((a >> 2) & 1) + t * (((b >> 2) & 1) - ((a >> 2) & 1)); m++;
    }
    let x = lo.x + (i + sx / m) * c, y = lo.y + (j + sy / m) * c, z = lo.z + (k + sz / m) * c;
    for (let r = 0; r < 2; r++) { const d = S.sdf(x, y, z), g = S.grad(x, y, z); x -= d * g[0]; y -= d * g[1]; z -= d * g[2]; }
    vid[at(i, j, k)] = pos.length / 3; pos.push(x, y, z); nor.push(...S.grad(x, y, z));
    const [w, f] = S.attrs(x, y, z); fw.push(w); fm.push(f);
  }
  const idx = [];
  const quad = (a, b, cc, d, inward) => {
    if (a < 0 || b < 0 || cc < 0 || d < 0) return;
    inward ? idx.push(a, cc, b, a, d, cc) : idx.push(a, b, cc, a, cc, d);
  };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const v0 = val[at(i, j, k)] < 0;
    if (v0 !== (val[at(i + 1, j, k)] < 0)) quad(vid[at(i, j - 1, k - 1)], vid[at(i, j, k - 1)], vid[at(i, j, k)], vid[at(i, j - 1, k)], v0);
    if (v0 !== (val[at(i, j + 1, k)] < 0)) quad(vid[at(i - 1, j, k - 1)], vid[at(i - 1, j, k)], vid[at(i, j, k)], vid[at(i, j, k - 1)], v0);
    if (v0 !== (val[at(i, j, k + 1)] < 0)) quad(vid[at(i - 1, j - 1, k)], vid[at(i, j - 1, k)], vid[at(i, j, k)], vid[at(i - 1, j, k)], v0);
  }
  for (let t = 0; t < idx.length; t += 3) {   // make every triangle face outward
    const [a, b, cc] = [idx[t], idx[t + 1], idx[t + 2]].map(q => V(pos[q * 3], pos[q * 3 + 1], pos[q * 3 + 2]));
    const n = b.clone().sub(a).cross(cc.clone().sub(a)), q = idx[t];
    if (n.x * nor[q * 3] + n.y * nor[q * 3 + 1] + n.z * nor[q * 3 + 2] < 0) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3));
  geo.setAttribute("furW", new THREE.Float32BufferAttribute(fw, 1)); geo.setAttribute("furMask", new THREE.Float32BufferAttribute(fm, 1));
  geo.setIndex(idx); geo.computeBoundingSphere();
  return geo;
}
function plushFurMat(f) {             // one fur shell: pushed out along the surface, cut into strands, darker at the roots
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, color: new THREE.Color().setScalar(0.72 + 0.32 * f) });
  m.onBeforeCompile = sh => {
    sh.uniforms.uOff = { value: PLUSH.furLen * f }; sh.uniforms.uDroop = { value: 0.012 * f * f }; sh.uniforms.uCut = { value: 0.08 + 0.85 * f };
    sh.vertexShader = "attribute float furMask;\nvarying float vMask;\nvarying vec3 vBase;\nuniform float uOff;\nuniform float uDroop;\n" +
      sh.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\n  vBase = position; vMask = furMask;\n  transformed += normal * uOff; transformed.y -= uDroop;");
    sh.fragmentShader = "varying float vMask;\nvarying vec3 vBase;\nuniform float uCut;\n" +
      sh.fragmentShader.replace("void main() {", "void main() {\n  if (vMask > 0.5) discard;\n  float h = pow(fract(sin(dot(floor(vBase * 160.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453), 0.7);\n  if (h < uCut) discard;");
  };
  m.customProgramCacheKey = () => "plush-fur";
  return m;
}
// put a little thing (button eye, felt nose, stitch) onto the plush surface: from `from`, travel along -dir until the surface
function stickOn(part, obj, from, dir, lift = 0.004) {
  let t = 0.6; const p = V();
  for (; t > -0.6; t -= 0.004) { p.copy(from).addScaledVector(dir, t); if (part.S.sdf(p.x, p.y, p.z) <= 0) break; }
  const n = V(...part.S.grad(p.x, p.y, p.z)), up = V(0, 1, 0).addScaledVector(n, -n.y).normalize(), x = up.clone().cross(n);
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, n)); obj.position.copy(p).addScaledVector(n, lift); part.g.add(obj);
  return obj;
}
function buttonEye(size = 1) {
  const g = new THREE.Group(), cyl = new THREE.CylinderGeometry(0.06 * size, 0.062 * size, 0.024 * size, 28); cyl.rotateX(Math.PI / 2);
  const m = new THREE.Mesh(cyl, new THREE.MeshStandardMaterial({ color: 0x15111a, roughness: 0.12, metalness: 0.15 })); m.position.z = 0.012 * size; g.add(m);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.056 * size, 0.008 * size, 8, 28), m.material); rim.position.z = 0.024 * size; g.add(rim);
  const glint = new THREE.Mesh(new THREE.SphereGeometry(0.014 * size, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); glint.position.set(-0.022 * size, 0.024 * size, 0.026 * size); glint.scale.z = 0.4; g.add(glint);
  const thread = new THREE.MeshStandardMaterial({ color: 0xe9dcc6, roughness: 1 });
  for (const r of [0.785, -0.785]) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.04 * size, 0.008 * size, 0.006 * size), thread); t.position.z = 0.026 * size; t.rotation.z = r; g.add(t); }
  return g;
}
function stitchedSmile(color = 0x3b2a24, size = 1) {
  const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color, roughness: 1 });
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.032 * size, 0.006 * size, 6, 16, Math.PI), mat); a.rotation.z = Math.PI; a.position.x = 0.032 * s * size; g.add(a); }
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.008 * size, 0.04 * size, 0.008 * size), mat); line.position.y = 0.02 * size; g.add(line);
  return g;
}
// eased motion: every frame the trick code says where things should be; these follow softly (floppier for heads and tails)
function plushMotion(list, squishGroup, root) {
  const st = list.map(([o, k]) => ({ o, k, p: o.position.clone(), q: o.quaternion.clone() }));
  let last = -1, lastY = root.position.y, vy = 0;
  return t => {
    const dt = last < 0 ? 0.016 : Math.min(0.05, t - last); last = t;
    for (const s of st) { const a = 1 - Math.exp(-dt * s.k); s.p.lerp(s.o.position, a); s.q.slerp(s.o.quaternion, a); s.o.position.copy(s.p); s.o.quaternion.copy(s.q); }
    const v = (root.position.y - lastY) / Math.max(dt, 1e-3); lastY = root.position.y; vy += (v - vy) * Math.min(1, dt * 8);
    const sq = 1 + clamp(vy * 0.05, -0.07, 0.07); squishGroup.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
  };
}
