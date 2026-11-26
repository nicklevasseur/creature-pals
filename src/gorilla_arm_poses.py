"""Find gorilla arm angles (right arm; the left mirrors with z negated) that put the fist on a target, elbow out to the side."""
import numpy as np
def Rx(a): c, s = np.cos(a), np.sin(a); return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
def Rz(a): c, s = np.cos(a), np.sin(a); return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
S = np.array([0.9, 0.45, 0.1]); e = np.array([0.05, -0.55, 0.05]); f = np.array([0.01, -0.6, 0.05])
def chain(q):
    ax, az, ex, ez = q; Rs = Rx(ax) @ Rz(az); E = S + Rs @ e; F = E + Rs @ Rx(ex) @ Rz(ez) @ f; return E, F
def cost(q, T, ex_min):
    E, F = chain(q); c = np.sum((F - T) ** 2) * 10
    c += max(0, ex_min - E[0]) ** 2 * 20                       # elbow stays out to the side
    c += 0.0005 * np.sum(np.array(q) ** 2) + max(0, abs(q[2]) - 0.6) ** 2 * 5   # small angles, no elbow twist
    return c
def solve(T, ex_min, seed=0):
    rng = np.random.default_rng(seed); best = None
    for _ in range(4000):
        q = rng.uniform([-3, -1, -2.8, -2.8], [1, 2.5, 0.5, 2.8]); c = cost(q, T, ex_min)
        if best is None or c < best[0]: best = (c, q)
    c, q = best; step = 0.2
    while step > 1e-4:
        improved = False
        for i in range(4):
            for d in (step, -step):
                q2 = q.copy(); q2[i] += d; c2 = cost(q2, T, ex_min)
                if c2 < c: c, q, improved = c2, q2, True
        if not improved: step /= 2
    E, F = chain(q); return q, E, F
for name, T, exm in [("chest", (0.38, 0.25, 0.9), 0.95), ("out", (0.6, 0.35, 1.2), 0.95), ("mouth", (0.2, 0.6, 1.02), 0.8)]:
    q, E, F = solve(np.array(T), exm)
    print(name, "q=", np.round(q, 2).tolist(), "elbow", np.round(E, 2).tolist(), "fist", np.round(F, 2).tolist(), "miss", round(float(np.linalg.norm(F - np.array(T))), 3))
