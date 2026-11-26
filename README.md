# Creature Pals

A little 3D toy for kids: nine animal friends in their own habitats — a possum, giraffe, gorilla, otter, sloth,
monkey, octopus, lobster and manta ray. Tap one to say hi, press the buttons for tricks, give them names and colors.

**Play it:** https://nicklevasseur.github.io/creature-pals/

On a tablet or phone, open the link and choose **Add to Home Screen**. It then opens like an app and works with no
internet connection.

## How it's made

- `src/creature-pals.html` is the whole toy: [three.js](https://threejs.org) r128 shapes, animation and Web Audio sounds.
- `py -3 build.py --test` builds the offline app into `app/` (bundled three.js and Fredoka font, a service worker that keeps
  every file on the device, and the icons), and checks that nothing loads from the internet.
- `py -3 offline_test.py` serves the app, cuts the connection and checks every friend still loads.
- The `gh-pages` branch is a copy of `app/`.

Credits: [three.js](https://github.com/mrdoob/three.js) (MIT), [Fredoka](https://fonts.google.com/specimen/Fredoka) font
(SIL Open Font License, `app/fonts/LICENSE`). Sound credits are in `app/sounds/CREDITS.md` once recorded sounds are added.
