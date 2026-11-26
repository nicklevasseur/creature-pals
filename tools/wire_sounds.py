"""Wire the recorded clips into src: the shared loader (src/clips.js), a habitat loop per friend, and clips per trick."""
from pathlib import Path
p = Path("src/creature-pals.html"); C = p.read_text(encoding="utf-8")
assert "function clipBuffer" not in C
def rep(a, b):
    global C
    assert C.count(a) == 1, a[:80]; C = C.replace(a, b)
clips = Path("src/clips.js").read_text(encoding="utf-8") + '''
// which loop plays behind each friend, and which recordings join each trick: [clip, delay s, volume, speed]
const AMBIENCE = { possum: "amb-night", giraffe: "amb-savanna", gorilla: "amb-jungle", otter: "amb-river", sloth: "amb-rainforest",
  monkey: "amb-jungle", octopus: "amb-underwater", lobster: "amb-underwater", manta: "amb-underwater" };
const SAMPLES = {
  "gorilla:pound": [["gorilla", 0.1, 0.9]], "gorilla:banana": [["munch", 0.9, 0.7], ["gorilla", 2.7, 0.5, 1.15]], "gorilla:crazy": [["gorilla", 0, 0.8, 1.2], ["gorilla", 1.4, 0.7, 1.3]],
  "gorilla:hop": [["gorilla", 0, 0.5, 1.3]],
  "giraffe:snack": [["rustle", 0.3, 0.7], ["munch", 1.1, 0.8]],
  "otter:swim": [["splash", 0, 0.8], ["splash2", 3.0, 0.9]], "otter:roll": [["splash2", 0, 0.8]], "otter:hop": [["splash2", 0, 0.7], ["splash", 0.9, 0.6]],
  "otter:shake": [["splash2", 0.05, 0.5, 1.2]],
  "sloth:climb": [["leaves", 0.3, 0.7], ["leaves", 3.3, 0.6, 0.9]], "sloth:nap": [["rustle", 0.6, 0.4, 0.8]],
  "monkey:ooh": [["chimp", 0, 0.8], ["chimp", 1.4, 0.7, 1.1]], "monkey:hop": [["chimp", 0, 0.6, 1.2]], "monkey:swing": [["leaves", 0.3, 0.5, 1.2]],
  "monkey:peek": [["chimp", 0.8, 0.5, 1.25]],
  "octopus:wave": [["bubble", 0.1, 0.7], ["bubble", 0.6, 0.6, 1.2]], "octopus:ink": [["swirl", 0.45, 0.8]], "octopus:jet": [["swirl", 0.35, 0.9, 1.2], ["bubble", 1.4, 0.7], ["bubble", 1.8, 0.6, 1.3]],
  "octopus:hop": [["bubble", 0, 0.7]],
  "lobster:flip": [["swirl", 0, 0.7, 1.3]], "lobster:hop": [["bubble", 0.3, 0.5]],
  "manta:swoop": [["swirl", 0.2, 0.6, 0.8], ["swirl", 2.4, 0.5, 0.9]], "manta:backflip": [["swirl", 0.1, 0.7]], "manta:flap": [["swirl", 0, 0.5, 1.3]], "manta:roll": [["swirl", 0.1, 0.5]],
};
const SEA = ["octopus", "lobster", "manta"];
startAmbience(AMBIENCE[who]);
'''
rep("\nconst PV = (x, y, z) => new THREE.Vector3(x, y, z);", "\n" + clips + "\nconst PV = (x, y, z) => new THREE.Vector3(x, y, z);")
rep('function sfx(name) {\n  if (name === "pop") { sparkle(); return; }',
    'function sfx(name) {\n  (SAMPLES[who + ":" + name] || []).forEach(a => clip(...a));\n  if (name === "pop" && SEA.includes(who)) clip("bubble", 0.05, 0.6);\n  if (name === "pop") { sparkle(); return; }')
rep('if (soundOn) { audio(); sfx("pop"); } };', 'if (soundOn) { audio(); sfx("pop"); } ambienceFollowsSound(); };')
p.write_text(C, encoding="utf-8"); print("wired")
