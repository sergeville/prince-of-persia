> **Direction corrected, 2026-10-22:** Palace Run development is stopped and preserved. The current goal is faithful classic Prince of Persia. See [classic setup, launcher and actual verification limits](docs/CLASSIC-SETUP.md). The native candidate rendered offscreen; visible gameplay is not yet verified. The prototype instructions below are historical.

# Play Classic Prince of Persia

**Double-click `Prince of Persia` on your Desktop** to start the classic game. The shortcut points to `Prince of Persia.app` in this project and uses the same prepared runtime.

You can also start it from Terminal:

```sh
"$HOME/Dev/prince-of-persia/Play Classic Prince of Persia.command"
```

The window is configured for 1280 × 800 with sharp pixel scaling. Press **Option + Return** to toggle fullscreen.

This command uses the local runtime prepared on this Mac; a fresh clone needs setup first. See [classic setup and verification notes](docs/CLASSIC-SETUP.md).


## Classic game keyboard controls

On Mac, **Ctrl means Control**, not Command. Depending on your keyboard settings, use **Fn + F6/F9/F12** for the function keys.

| Action | Keys |
| --- | --- |
| Run or turn | Left / Right arrows |
| Jump or climb up | Up arrow |
| Crouch or climb down | Down arrow |
| Careful step near an edge | Shift + Left / Right |
| Jump left or right | Up + Left / Right |
| Catch a ledge while falling | Hold Shift |
| Climb onto a ledge after catching it | Up arrow |
| Pick up the sword or drink a potion | Shift, while close to it |
| Attack with the sword | Shift |
| Parry an enemy attack | Up arrow, while sword fighting |
| Advance or retreat during combat | Left / Right arrows |
| Put the sword away | Down arrow |
| Pause / menu | Esc |
| Show time remaining | Space |
| Restart current level | Ctrl + A |
| Return to title screen | Ctrl + R |
| Toggle sound | Ctrl + S |
| Toggle fullscreen | Option + Return |
| Quicksave exact position | F6 |
| Quickload | F9 |
| Original level-based save (levels 3–13) | Ctrl + G |
| Load original save from the intro | Ctrl + L |
| Save a screenshot | F12 |
| Quit | Ctrl + Q |

The sword must first be collected before you can fight. Quicksave/quickload are SDLPoP additions. These mappings were checked against the [SDLPoP documentation](https://github.com/NagyD/SDLPoP/blob/v1.23/README.md) and combat source; interactive keyboard testing remains unverified in this tool session.

---

# Palace Run — preserved prototype

A small local browser platformer inspired by the Apple II `Prince of Persia` source archive in `Prince-of-Persia-Apple-II/`.

This project does not copy the original game code, sprites, levels, branding, or assets. The upstream archive is kept as historical reference material. Its README notes that Ubisoft controls rights to distribute Prince of Persia games, so this prototype is intentionally a separate local toy.

## Quick Start

Clone the repository:

```sh
git clone https://github.com/sergeville/prince-of-persia.git
cd prince-of-persia
```

Run a local static server:

```sh
python3 -m http.server 4173
```

Open the game:

```text
http://127.0.0.1:4173/
```

Open the installation page:

```text
http://127.0.0.1:4173/install.html
```

There are no package dependencies or build steps. The game runs from static HTML, CSS, and JavaScript.

## Install Options

For the fastest local run, open `index.html` directly in a browser.

For the most reliable browser behavior, serve the folder locally:

```sh
python3 -m http.server 4173
```

Then visit:

```text
http://127.0.0.1:4173/
```

## Controls

- `Enter` / `Space`: start or restart
- `Left` / `Right`: move
- `Up`: jump
- `Space`: strike while playing
- `Esc` / `Quit`: exit the current run back to title
- Touch buttons appear on small or coarse-pointer screens.
