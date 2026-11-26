"""Build Creature Pals as a standalone offline app.

    py -3 build.py          src/creature-pals.html  ->  app/index.html (+ manifest, service worker)
    py -3 build.py --test   self-check: the built page loads nothing from the internet

src/creature-pals.html is the one source. It is also what gets published as the Claude artifact, so it keeps
its internet links (three.js and the font); the build swaps them for the copies bundled in app/.
"""
import hashlib, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC, APP = ROOT / "src" / "creature-pals.html", ROOT / "app"
SWAPS = {
    '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"></script>': '<script src="vendor/three.min.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>': '<script src="vendor/OrbitControls.js"></script>',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700&display=swap">': "",
}
HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#2b2457">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Creature Pals">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<style>
@font-face { font-family: "Fredoka"; font-weight: 500; font-display: swap; src: url(fonts/fredoka-latin-500-normal.woff2) format("woff2"); }
@font-face { font-family: "Fredoka"; font-weight: 700; font-display: swap; src: url(fonts/fredoka-latin-700-normal.woff2) format("woff2"); }
/* a toy, not a web page: no text selection, no long-press menus, no pull-to-refresh */
html, body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
</style>
</head>
<body>
"""
TAIL = """<script>
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
</script>
</body>
</html>
"""
MANIFEST = """{
  "name": "Creature Pals",
  "short_name": "Pals",
  "start_url": "./index.html",
  "scope": "./",
  "display": "fullscreen",
  "orientation": "any",
  "background_color": "#2b2457",
  "theme_color": "#2b2457",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
"""
SW = """// Keeps every file of the app on the device, so it runs with no internet. A new build changes VERSION.
const VERSION = "%s", FILES = %s;
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))));
"""

def build():
    html = SRC.read_text(encoding="utf-8")
    for old, new in SWAPS.items():
        assert html.count(old) == 1, "source changed, update SWAPS: " + old[:60]
        html = html.replace(old, new)
    page = HEAD + html + TAIL
    (APP / "index.html").write_text(page, encoding="utf-8")
    (APP / "manifest.webmanifest").write_text(MANIFEST, encoding="utf-8")
    files = ["./", "index.html", "manifest.webmanifest"] + sorted(p.relative_to(APP).as_posix() for d in ("vendor", "fonts", "icons", "sounds") if (APP / d).exists() for p in (APP / d).rglob("*") if p.is_file())
    digest = hashlib.sha256(b"".join((APP / f).read_bytes() for f in files if f != "./")).hexdigest()[:12]
    (APP / "sw.js").write_text(SW % ("pals-" + digest, "[" + ", ".join('"%s"' % f for f in files) + "]"), encoding="utf-8")
    print(f"built app/index.html ({len(page) // 1024} KB), {len(files)} files cached, version pals-{digest}")
    return page

def test(page):
    outside = sorted(set(re.findall(r'(?:src|href)="(https?://[^"]+)"', page)) | set(re.findall(r'url\((https?://[^)]+)\)', page)))
    assert not outside, f"the app still loads from the internet: {outside}"
    for f in ["vendor/three.min.js", "vendor/OrbitControls.js", "fonts/fredoka-latin-500-normal.woff2", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"]:
        assert (APP / f).exists(), "missing " + f
    print("self-check passed: nothing loads from the internet, all bundled files present")

if __name__ == "__main__":
    page = build()
    if "--test" in sys.argv: test(page)
