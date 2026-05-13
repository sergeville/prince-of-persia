# Palace Run

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
