"""Turn the downloaded recordings into the app's small sound files (app/sounds/*.mp3).

    py -3 tools/make_sounds.py <folder with the downloads>

Effects are trimmed and evened out; habitat loops get their last second blended into their first so they loop with
no gap. Sources and licences: app/sounds/CREDITS.md.
"""
import subprocess, sys, tempfile
from pathlib import Path

SRC, OUT = Path(sys.argv[1]), Path(__file__).resolve().parent.parent / "app" / "sounds"
ENC = ["-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "64k"]

def ff(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)

def effect(name, src, start=0.0, dur=None, level=-16):
    """A one-shot sound: trimmed, a tiny fade at each end, evened out."""
    t = ["-ss", str(start)] + (["-t", str(dur)] if dur else [])
    fade = f"afade=t=in:d=0.01,areverse,afade=t=in:d=0.05,areverse,loudnorm=I={level}:TP=-1.5"
    ff(*t, "-i", str(SRC / src), "-af", fade, *ENC, str(OUT / f"{name}.mp3"))

def loop(name, filtergraph_inputs, graph, length, level=-24, xf=1.0):
    """A habitat loop: build `length` seconds with `graph`, then cross-fade the tail into the head for a seamless loop."""
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / "raw.wav"
        ff(*filtergraph_inputs, "-filter_complex", graph + f",atrim=0:{length},loudnorm=I={level}:TP=-2[o]", "-map", "[o]", "-ac", "1", "-ar", "44100", str(raw))
        L = length
        seam = (f"[0]asplit=3[a][b][c];[a]atrim=0:{xf},asetpts=N/SR/TB,afade=t=in:d={xf}[head];"
                f"[b]atrim={xf}:{L - xf},asetpts=N/SR/TB[body];[c]atrim={L - xf}:{L},asetpts=N/SR/TB,afade=t=out:d={xf}[tail];"
                f"[head][tail]amix=inputs=2:normalize=0[x];[body][x]concat=n=2:v=0:a=1[o]")
        ff("-i", str(raw), "-filter_complex", seam, "-map", "[o]", *ENC, str(OUT / f"{name}.mp3"))

OUT.mkdir(parents=True, exist_ok=True)
# habitat loops
loop("amb-night", ["-i", str(SRC / "crickets.mp3"), "-i", str(SRC / "frogs.mp3")], "[0][1]amix=inputs=2:weights=1 0.55:normalize=0", 10.8)
loop("amb-savanna", ["-i", str(SRC / "sunny-day.mp3")], "[0]anull", 20.0)
loop("amb-jungle", ["-i", str(SRC / "rainforest.mp3"), "-i", str(SRC / "jungle.mp3")],
     "[0]atrim=30:60,asetpts=N/SR/TB[r];[1]adelay=6000|6000,volume=0.7[j];[r][j]amix=inputs=2:normalize=0", 28.0)
loop("amb-rainforest", ["-i", str(SRC / "rainforest.mp3")], "[0]anull", 28.0)
loop("amb-river", ["-i", str(SRC / "brook.mp3")], "[0]anull", 10.8)
loop("amb-underwater", ["-i", str(SRC / "underwater.ogg")], "[0]anull", 28.0)
# one-shot effects
effect("gorilla", "gorilla.mp3")
effect("chimp", "chimpanzee.mp3")
effect("munch", "rabbit-eating.mp3", 2.0, 3.0)
effect("rustle", "grass-rustle.ogg")
effect("leaves", "leaves.ogg", 10.0, 3.0)
effect("splash", "splash-rock.mp3")
effect("splash2", "splash-small.ogg")
effect("bubble", "bubble.wav", level=-18)
effect("swirl", "swirl.ogg", 0.0, 3.0)
# the crab, tarantula, chicken and pigeon (2026-11-26)
loop("amb-farm", ["-i", str(SRC / "henhouse.ogg")], "[0]anull", 16.0, level=-27)
loop("amb-park", ["-i", str(SRC / "urban-undergrowth.ogg")], "[0]atrim=10:40,asetpts=N/SR/TB", 28.0)
loop("amb-desert", ["-i", str(SRC / "sun-and-heat.ogg")], "[0]atrim=5:35,asetpts=N/SR/TB", 28.0, level=-28)
effect("rooster", "rooster.ogg")
effect("cluck", "hen-annoyed.ogg", 0.0, 2.0)
effect("egg-cackle", "hen-egg.ogg", 0.0, 4.0)
effect("chicks", "chicks.ogg", 2.0, 3.0, level=-20)
effect("coo", "dove-cooing.ogg", 0.0, 4.0)
effect("pigeon-flap", "pigeon-flight.ogg")
effect("pebbles", "pebble-beach.ogg", 5.0, 3.0, level=-20)
total = sum(p.stat().st_size for p in OUT.glob("*.mp3"))
for p in sorted(OUT.glob("*.mp3")): print(f"{p.name:22} {p.stat().st_size // 1024:4} KB")
print(f"total {total // 1024} KB")
