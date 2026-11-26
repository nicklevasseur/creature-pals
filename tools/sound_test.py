"""Serve app/, tap each friend, run a trick, and check its habitat loop and trick clips load and decode."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent.parent / "app")); H.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
url = f"http://127.0.0.1:{srv.server_port}/index.html"
TRICK = {"possum": "Wave", "giraffe": "Snack", "gorilla": "Chest pound", "otter": "Swim", "sloth": "Climb", "monkey": "Ooh ooh ah ah",
         "octopus": "Swim", "lobster": "Tail flip", "manta": "Swoop"}
with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"])
    pg = b.new_page(viewport={"width": 900, "height": 650}); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    missing = []; pg.on("response", lambda r: r.status >= 400 and missing.append(r.url))
    for w, trick in TRICK.items():
        pg.goto(url + "#" + w); pg.reload(); pg.wait_for_timeout(800)
        pg.mouse.click(450, 120); pg.locator(f"#panel-{w}").get_by_role("button", name=trick, exact=True).click(); pg.wait_for_timeout(2500)
        got = pg.evaluate("[Object.keys(CLIPS).sort().join(' '), !!ambience, AC && AC.state]")
        print(f"{w:8} {trick:14} clips: {got[0]:40} loop playing: {got[1]}  audio: {got[2]}")
    print("missing files:", missing or "none"); print("errors:", errs or "none"); b.close()
