"""Screenshot every friend (idle) into one contact sheet; print any page errors."""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
f = (Path(__file__).resolve().parent.parent / "app" / "index.html").as_uri()
W = sys.argv[1:] or ["possum", "giraffe", "gorilla", "otter", "sloth", "monkey", "octopus", "lobster", "manta"]
with sync_playwright() as pw:
    b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"]); pg = b.new_page(viewport={"width": 700, "height": 620})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    for w in W:
        pg.goto(f + "#" + w); pg.reload(); pg.add_style_tag(content=".panel, #switch, #splash { display: none !important; }"); pg.wait_for_timeout(3500)
        pg.screenshot(path=f"shot-{w}.png")
        print(w, "errors so far:", len(errs))
    b.close()
cols = 3; ims = [Image.open(f"shot-{w}.png").resize((467, 413)) for w in W]
s = Image.new("RGB", (467 * cols, 413 * ((len(ims) + cols - 1) // cols)), "white")
for i, im in enumerate(ims): s.paste(im, ((i % cols) * 467, (i // cols) * 413))
s.save("shot-sheet.png"); print("errors:", errs or "none")
