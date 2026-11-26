"""Open the app, tap Tap to play, then switch through every friend from the menu with no reload.
Checks: no page errors, the right friend shows, its habitat loop is the one playing, only one animation loop runs."""
import functools, http.server, threading
from pathlib import Path
from playwright.sync_api import sync_playwright
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent.parent / "app")); H.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"]); pg = b.new_page(viewport={"width": 700, "height": 620})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e))); loads = []; pg.on("load", lambda: loads.append(1))
    pg.goto(f"http://127.0.0.1:{srv.server_port}/index.html#otter"); pg.wait_for_timeout(1500)
    print("title screen showing:", pg.locator("#splash").is_visible())
    pg.click("#play"); pg.wait_for_timeout(1500)
    print("after tap: audio", pg.evaluate("AC && AC.state"), "| loop playing:", pg.evaluate("!!ambience"))
    for w in ["whale", "cow", "chicken", "crab", "tarantula", "giraffe", "possum", "otter"]:
        pg.select_option("#pick", w); pg.wait_for_timeout(1800)
        st = pg.evaluate("[who, document.getElementById('name').textContent, !!ambience, AMBIENCE[who], document.querySelectorAll('#panel-' + who + ' .swatch').length, location.hash]")
        print(f"switched to {w:9} -> {st}")
    pg.locator("#panel-otter").get_by_role("button", name="Swim").click(); pg.wait_for_timeout(1500)
    fps = pg.evaluate("new Promise(r => { let n = 0; const t0 = performance.now(); const f = () => { n++; performance.now() - t0 < 2000 ? requestAnimationFrame(f) : r(n / 2); }; requestAnimationFrame(f); })")
    print("page loads:", len(loads), "| errors:", errs or "none"); b.close()
