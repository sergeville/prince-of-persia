# palace-1 — Cinematic Palace Run first playable

Status: stopped — superseded by user direction on 2026-10-22
Owner: Serge Villeneuve
Implementation: Codex
Archon task: 36505059-6584-47a0-964a-da9e2ae96e23

## Intent

Extend the existing Palace Run prototype into a short, complete browser game with the deliberate side-on movement and palace atmosphere of classic Prince of Persia. Keep the existing name, use original code/art/layouts, preserve the reference PDF and original Apple II archive. The user selected this repository explicitly; the earlier empty PalaceOfAsh scaffold is not the project.

## Architecture

Buildless static HTML, CSS and classic scripts supporting file:// launch. Separate deterministic simulation from Canvas rendering and browser input. No runtime packages, remote assets, accounts or servers. Fixed timestep, bounded frame catch-up, cleared input on focus loss. Node's built-in test runner verifies gameplay; optional development-only Canvas renderer produces inspection images. Browser/manual feel and audio checks must be labeled unverified if computer control is unavailable.

## Acceptance criteria

1. A cohesive original palace scene and animated runner; clear title, controls, objectives and readable status.
2. Three connected rooms with achievable routes, jump, deliberate walking, crouch, ledge grab/climb/drop, spikes, one readable guard duel, a key and a timed gate puzzle.
3. Health, death, per-room checkpoint retry, pause, quit, restart and a distinct ending. No stuck inputs or simulation after terminal state.
4. Keyboard and visible accessible pointer controls; responsive aspect ratio, optional sound and reduced-motion handling.
5. Meaningful simulation tests covering combat, collision, transitions, death/retry and a complete input-driven route. Inspect actual renderer output; state browser verification limits.
6. Update README/install instructions and record evidence in the project and Vault. Archon Review remains separate from operator acceptance/Done.

## Scope

One short first-playable adventure, not a complete remake or a claim of original-game fidelity. No copied characters, branding or original art. No publishing, cloud runtime, emulator, purchases or changes to Synapse services.

## Direction correction — 2026-10-22

User stopped this prototype and requested faithful classic Prince of Persia. Preserve all unfinished work. Do not continue this story. See `docs/CLASSIC-SETUP.md` for the replacement investigation and its explicit verification limits.
