(function () {
  "use strict";
  const { Game, STEP } = window.PalaceEngine, game = new Game();
  const canvas = document.getElementById("game"), ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay"), heading = document.getElementById("overlay-title");
  const description = document.getElementById("overlay-description"), primary = document.getElementById("primary");
  const status = document.getElementById("status"), pauseButton = document.getElementById("pause");
  const held = new Set(), pressed = new Set(), pointers = new Map();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let previousState = "", previousRoom = -1, lastMessage = "", last = 0, accumulator = 0;
  let sound = false, audio = null;
  const map = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", ArrowUp: "jump", KeyW: "jump", ArrowDown: "crouch", KeyS: "crouch", Space: "attack", KeyJ: "attack", KeyK: "parry", ShiftLeft: "walk", ShiftRight: "walk" };
  function clearInput() { held.clear(); pressed.clear(); pointers.clear(); }
  function down(code) { if (!held.has(code)) pressed.add(code); held.add(code); }
  function input(edges = true) {
    const result = {};
    for (const code of held) if (map[code] && !["jump", "attack", "parry"].includes(map[code])) result[map[code]] = true;
    if (edges) { for (const code of pressed) if (map[code]) result[map[code]] = true; pressed.clear(); }
    return result;
  }
  function activate() {
    clearInput(); if (game.state === "paused") game.resume(); else if (game.state === "dead") game.retry(); else game.start();
    canvas.focus(); syncUI();
  }
  function togglePause() { if (game.state === "playing") game.pause(); else if (game.state === "paused") game.resume(); clearInput(); syncUI(); }
  function soundEvent(type) {
    if (!sound || !audio || audio.state !== "running") return;
    const notes = { jump: [160, .08], land: [75, .06], blade: [280, .06], parry: [850, .18], hit: [95, .15], key: [620, .22], potion: [470, .25], gate: [120, .35], room: [380, .22], win: [740, .6], death: [70, .4], grab: [185, .08], climb: [210, .08] };
    if (!notes[type]) return;
    const [frequency, duration] = notes[type], oscillator = audio.createOscillator(), gain = audio.createGain();
    oscillator.type = ["parry", "key", "win", "potion"].includes(type) ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime); oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * .6), audio.currentTime + duration);
    gain.gain.setValueAtTime(.0001, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.07, audio.currentTime + .008); gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
    oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
  }
  function syncUI() {
    if (previousState !== game.state) {
      previousState = game.state; overlay.hidden = game.state === "playing";
      pauseButton.textContent = game.state === "paused" ? "Resume" : "Pause"; pauseButton.disabled = !["playing", "paused"].includes(game.state);
      const content = {
        title: ["Palace Run", "The palace sleeps. Its gates do not. Cross three chambers, outwit the watcher and reach the night.", "Begin escape"],
        paused: ["A moment's rest", "Your escape will wait. Return when you are ready.", "Continue escape"],
        dead: ["Rise again", `${game.message} Retry from this room's checkpoint.`, "Retry this room"],
        won: ["Beyond the palace", `You reached the night in ${Math.floor(game.elapsed / 60)}:${String(Math.floor(game.elapsed % 60)).padStart(2, "0")} · ${game.deaths} ${game.deaths === 1 ? "retry" : "retries"}. The first adventure is complete.`, "Play again"]
      }[game.state];
      if (content) { heading.textContent = content[0]; description.textContent = content[1]; primary.textContent = content[2]; status.textContent = `${content[0]}. ${content[1]}`; }
      document.getElementById("overlay-kicker").textContent = game.state === "won" ? "THE MIDNIGHT ESCAPE · COMPLETE" : "A CINEMATIC PLATFORM ADVENTURE";
    }
    if (game.roomIndex !== previousRoom) { previousRoom = game.roomIndex; document.getElementById("room-label").textContent = `CHAMBER ${game.roomIndex + 1} OF 3`; status.textContent = `${game.room.name}. ${game.room.hint}`; }
    if (game.message !== lastMessage && game.state === "playing") { lastMessage = game.message; status.textContent = game.message; }
  }
  window.addEventListener("keydown", event => {
    if (event.target instanceof HTMLElement && ["BUTTON", "A", "INPUT", "SELECT"].includes(event.target.tagName)) return;
    if (map[event.code] || ["Escape", "Enter", "KeyP", "KeyR"].includes(event.code)) event.preventDefault();
    if (event.repeat) return;
    if (["Escape", "KeyP"].includes(event.code)) { togglePause(); return; }
    if (event.code === "KeyR" && ["playing", "dead"].includes(game.state)) { game.retry(); clearInput(); syncUI(); return; }
    if (game.state !== "playing" && ["Enter", "Space"].includes(event.code)) { activate(); return; }
    if (game.state === "playing") down(event.code);
  });
  window.addEventListener("keyup", event => held.delete(event.code));
  window.addEventListener("blur", () => { clearInput(); game.pause(); syncUI(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { clearInput(); game.pause(); syncUI(); } });
  canvas.addEventListener("pointerdown", () => canvas.focus()); primary.addEventListener("click", activate);
  pauseButton.addEventListener("click", () => { togglePause(); canvas.focus(); });
  document.getElementById("quit").addEventListener("click", () => { clearInput(); game.quit(); syncUI(); });
  document.getElementById("sound").addEventListener("click", async event => {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext; if (!Audio) throw new Error("Audio unavailable");
      if (!audio) audio = new Audio(); await audio.resume(); sound = !sound;
      event.target.textContent = sound ? "Sound on" : "Sound off"; event.target.setAttribute("aria-pressed", String(sound)); if (sound) soundEvent("key");
    } catch (_) { status.textContent = "Sound is unavailable in this browser. You can still play."; }
    canvas.focus();
  });
  document.getElementById("fullscreen").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.getElementById("stage").requestFullscreen) await document.getElementById("stage").requestFullscreen();
      else status.textContent = "Use your browser's full-screen command.";
    } catch (_) { status.textContent = "Full screen is unavailable. You can still play in this window."; }
    canvas.focus();
  });
  for (const button of document.querySelectorAll("[data-key]")) {
    const key = button.dataset.key;
    button.addEventListener("pointerdown", event => { event.preventDefault(); if (game.state !== "playing") return; pointers.set(event.pointerId, key); down(key); button.setPointerCapture(event.pointerId); });
    const release = event => { pointers.delete(event.pointerId); if (![...pointers.values()].includes(key)) held.delete(key); };
    button.addEventListener("pointerup", release); button.addEventListener("pointercancel", release); button.addEventListener("lostpointercapture", release);
  }
  function frame(now) {
    const delta = last ? Math.min(.1, (now - last) / 1000) : 0; last = now;
    if (game.state === "playing") { accumulator += delta; let edges = true; while (accumulator >= STEP) { game.update(STEP, input(edges)); accumulator -= STEP; edges = false; } }
    else accumulator = 0;
    for (const event of game.events.splice(0)) soundEvent(event.type);
    window.PalaceRenderer.render(ctx, game, { reducedMotion: reducedMotion.matches }); syncUI(); requestAnimationFrame(frame);
  }
  syncUI(); requestAnimationFrame(frame);
})();
