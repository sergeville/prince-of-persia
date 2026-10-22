# Classic Prince of Persia setup

## 1. Direction and preservation

Serge stopped Palace Run development on 2026-10-22 because the prototype does not deliver the intended classic game. Do not continue its gameplay work without a new instruction.

The unfinished HTML/CSS/JavaScript remains on `feat/cinematic-palace-run`. Before the direction correction, a copy was preserved in `.git/checkpoints/palace-run-paused/worktree.tar.gz`, with tracked changes in `tracked.patch`. Archive SHA-256: `9dcf1481133939608b2a8d605734d1028115944952e8a0b985508e347329c224`. The checkpoint predates the requested commit/push; the preserved prototype is also included in the project source history. The original Apple II source archive is separate and untouched.

## 2. Version identification

The user supplied the visual reference at 2:14 PM on 2026-10-22, preserved as `evidence/user-visual-reference.png`. It shows an Ubisoft anniversary montage and related game screenshots. The target dungeon art matches **Prince of Persia for DOS/PC, VGA (1990)**: blue-gray stone blocks, black voids, torches and the white-clothed Prince. The montage includes multiple character designs; it is not a literal screenshot of one original playable room.

This visual identification is based on comparison with SDLPoP's rendered first room and Ubisoft's [anniversary article](https://news.ubisoft.com/en-gb/article/6yLrRf7b0U1MBYxmlxE225/prince-of-persia-35th-anniversary-a-look-back-at-the-original-game), which separately labels the Apple II, 1990 PC and SNES versions. The article explains that the PC port redid the graphics. **SDLPoP is the selected faithful DOS route for this visual target.** This confirms the art direction, not completion of interactive testing.

`PRINCE OF PERSIA.pdf` remains a separate 28-page scanned technical document dated October 12, 1989. It does not identify the user's visual target; Apple II source must not be assumed to produce DOS artwork.

## 3. Launch on this Mac

Double-click **Prince of Persia** on your Desktop. This shortcut points to `Prince of Persia.app` in the project folder. The app invokes the same native-game launcher without requiring a Terminal command. Keep the app in this project folder because the prepared runtime depends on this location.

Alternatively, double-click `Play Classic Prince of Persia.command` in the project folder, or run:

```sh
cd ~/Dev/prince-of-persia
./'Play Classic Prince of Persia.command'
```

This starts the native game executable, not the Palace Run browser page. The local setup is prepared but **visible launch and interactive play remain unverified** because this tool session has no display. No game is left running.

The normal package-manager route is:

```sh
/opt/homebrew/bin/brew install sdlpop
/opt/homebrew/bin/prince
```

Homebrew lists an Apple Silicon macOS 27 bottle. On this machine installation stopped because `/opt/homebrew/share/zsh` and `site-functions` belong to UID 502 and are not writable by the current UID 501. Their ownership was not changed. Unrelated tap trust warnings were not acted on.

The prepared local fallback uses the official Homebrew SDLPoP 1.23 arm64 bottle, SHA-256 verified against Homebrew's API. Its library paths were relocated and the executable ad-hoc signed. The SDL2_image bottle required a newer JPEG-XL ABI than installed, so it is retained unused; official SDL2_image 2.8.12 source was checksum-verified and built locally with Apple's ImageIO backend. No game source or gameplay logic was edited. Installed SDL2-compat 2.32.70 and SDL3 3.4.12 are reused. Download receipts, relocation record and image-library build log are under `classic-runtime/`.

This fallback is local to this exact project path and existing Homebrew libraries, not a portable standalone app or a successful Homebrew-managed install. Downloaded runtime packages, generated build files and saves are Git-ignored and remain local; the app bundle and launcher scripts are versioned. Normal Homebrew installation is the simpler long-term route once its pre-existing ownership issue is resolved.

## 4. Original game files and settings

**No user-supplied game files are required for this SDLPoP package.** Its included `libexec/data/` supplies original-level data, graphics, sound and music resources. The rendered level loaded without an external `PRINCE.EXE`, disk image, ROM or purchased archive. This claim is specific to the selected SDLPoP package.

The launcher uses `classic-runtime/session/` for configuration and working-directory saves. Upstream defaults are restored after the offscreen test: original levelset, fixes/enhancements disabled, no added lighting, normal video/audio drivers, no gameplay cheats. The screenshot command used `megahit` only to select the first level; the normal launcher does not enable it. Upstream may store screenshots alongside the executable in `libexec/screenshots/`.

## 5. Controls

Window size is set to **1280 × 800**, a sharp 4× enlargement of the original 320 × 200 image, with integer scaling enabled. Restart the game to apply. Option+Return toggles fullscreen. The previous settings are preserved in `classic-runtime/session/SDLPoP.before-larger-window.ini`. Configuration readback verified; on-screen sizing remains unverified from this tool session.

- Arrow keys: run/turn; Up: jump/climb; Down: crouch/lower yourself.
- Shift + Left/Right: careful step. Hold Shift while falling to catch a ledge.
- Shift: collect items; in combat, attack. Up: parry; Down: sheath.
- Escape: pause/menu. Ctrl+A: restart level. Ctrl+Q: quit.
- Option+Return: fullscreen toggle. F6/F9: quicksave/quickload (port additions).

## 6. Evidence and limits

Tested on arm64 macOS 27.0.1:

1. Download checksums matched the official Homebrew metadata.
2. Native Mach-O arm64 executable, command launcher and Desktop app shortcut all run `--version`, returning `SDLPoP v1.23`. App property-list structure, executable permissions, shortcut target and shell syntax were checked. Finder double-click behavior remains visually unverified.
3. Normal native launch attempted; failed with `SDL_Init: The video driver did not add any displays`. See `evidence/sdlpop-render.log`.
4. Computer Use inventory failed again after receiving the reference at 2:15 PM with `Sky Computer Use service startup request failed`; no app/browser was available.
5. Real engine rendered level 1 offscreen using `SDL_VIDEODRIVER=dummy`, `SDL_AUDIODRIVER=dummy`, software rendering and `megahit 1 --screenshot`. Inspected the resulting 320×200 PNG: stone dungeon, Prince, torches, health display and level label. See `evidence/sdlpop-level1-offscreen.png` and `sdlpop-offscreen.log`. Screenshot mode intentionally calls `quit(1)` in upstream `src/screenshot.c`; the exit code is not treated as a normal interactive launch success.

The screenshot is actual game-engine output, **not a visible desktop/window capture**. It is not evidence that keyboard input, movement, climbing, traps, sword fighting, audio, fullscreen or saves worked interactively. Those remain untested. The user's success criterion has not yet been met.

Next: the reference is now identified; launch this prepared command in an accessible Mac desktop session, then test movement, a ledge climb, a trap and sword combat and capture the visible game window. Do not resume Palace Run as a substitute.

## 7. Sources and task authority

- [SDLPoP upstream](https://github.com/NagyD/SDLPoP), [v1.23 documentation](https://github.com/NagyD/SDLPoP/blob/v1.23/README.md).
- [Homebrew formula](https://formulae.brew.sh/formula/sdlpop), [formula implementation](https://github.com/Homebrew/homebrew-core/blob/master/Formula/s/sdlpop.rb).
- [SDL_image source](https://github.com/libsdl-org/SDL_image/tree/release-2.8.12).
- Archon project: `f202e7d0-3743-48f4-955a-e5917cd403ce`; classic setup task: `dc6d48aa-203f-40d9-972a-0bed964c7394`. Archon owns live status. Palace Run task was archived with the user's reason, not marked Done.
