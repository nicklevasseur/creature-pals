// ---- recorded sounds: short clips in sounds/ (see sounds/CREDITS.md), loaded on first use, played through Web Audio so
// they mix with the made-up sounds and follow the Sound button. A quiet habitat loop plays behind each friend.
const CLIPS = {}, clipLoad = {};
function clipBuffer(name) {
  const c = audio(); if (!c) return Promise.resolve(null);
  if (!clipLoad[name]) clipLoad[name] = fetch("sounds/" + name + ".mp3").then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(b => new Promise((ok, no) => c.decodeAudioData(b, ok, no))).then(buf => CLIPS[name] = buf).catch(() => null);
  return clipLoad[name];
}
function clip(name, at = 0, vol = 0.8, rate = 1) {
  const c = audio(); if (!c || !soundOn) return;
  clipBuffer(name).then(buf => {
    if (!buf || !soundOn) return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; s.playbackRate.value = rate; g.gain.value = vol;
    s.connect(g).connect(c.destination); s.start(c.currentTime + at);
  });
}
let ambience = null;
function startAmbience(name, vol = 0.18) {
  const c = audio(); if (!c || !name) return;
  clipBuffer(name).then(buf => {
    if (!buf || ambience) return;
    const s = c.createBufferSource(), g = c.createGain(); s.buffer = buf; s.loop = true; g.gain.value = soundOn ? vol : 0;
    s.connect(g).connect(c.destination); s.start(); ambience = { g, vol };
  });
}
function ambienceFollowsSound() { if (ambience) ambience.g.gain.setTargetAtTime(soundOn ? ambience.vol : 0, audio().currentTime, 0.2); }
