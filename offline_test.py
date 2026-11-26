"""Serve app/, let the service worker install, go offline, reload: every friend must still load with no errors."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(Path(__file__).parent / "app"))
H.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{srv.server_port}/index.html"
with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"]); ctx = b.new_context(viewport={"width": 390, "height": 800}); pg = ctx.new_page()
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    outside = []; pg.on("request", lambda r: not r.url.startswith(f"http://127.0.0.1:{srv.server_port}") and not r.url.startswith("data:") and outside.append(r.url))
    pg.goto(url); pg.wait_for_function("navigator.serviceWorker.controller !== null || navigator.serviceWorker.ready.then(() => true)", timeout=15000)
    pg.wait_for_timeout(1500); pg.reload(); pg.wait_for_timeout(1000)
    print("service worker in control:", pg.evaluate("!!navigator.serviceWorker.controller"))
    srv.shutdown(); ctx.set_offline(True)
    for w in ["possum", "giraffe", "gorilla", "otter", "sloth", "monkey", "chicken", "pigeon", "tarantula", "octopus", "crab", "lobster", "manta"]:
        pg.goto(url + "#" + w); pg.reload(); pg.wait_for_timeout(900)
        ok = pg.evaluate("document.fonts.check('700 20px Fredoka') && typeof THREE !== 'undefined'")
        print(f"offline {w:8} -> {pg.locator('#name').text_content():14} three.js+font loaded: {ok}")
    pg.screenshot(path="offline-manta.png")
    print("requests to the internet:", outside or "none"); print("errors:", errs); b.close()
