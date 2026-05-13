(function () {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;
  const TILE = 36;
  const HUD = 72;
  const ROWS = 13;
  const COLS = 26;
  const GRAVITY = 2100;
  const RUN = 255;
  const AIR = 175;
  const JUMP = 690;
  const FRICTION = 0.84;
  const EXIT_CONTROL = { x: 218, y: 21, w: 54, h: 30 };

  const levels = [
    [
      "..........................",
      "..........................",
      "......................E...",
      ".....................###..",
      "...............K..........",
      "..............###.........",
      ".........G................",
      "........####.......S......",
      "..P..............#####....",
      "######.....###............",
      ".....#....................",
      ".....#..............O.....",
      "##########################",
    ],
    [
      "..........................",
      ".................K........",
      "................###.......",
      "..........................",
      "....G.................E...",
      "...####.............D###..",
      "...........S..............",
      "..P......########.........",
      "#####.....................",
      "..............G...........",
      "..........########........",
      "......................O...",
      "##########################",
    ],
    [
      "..........................",
      ".....................E....",
      "....................###...",
      "............K.............",
      "...........###.....G......",
      ".....S....................",
      "...######.......#######...",
      "..P.......................",
      "#####......S..............",
      ".........######.......O...",
      "....................###...",
      "......G...................",
      "##########################",
    ],
  ];

  const keys = new Set();
  const pressed = new Set();
  const touchButtons = document.querySelectorAll("[data-key]");
  const quitButtons = document.querySelectorAll("[data-action='quit']");
  const solids = new Set(["#", "D"]);
  let state = "title";
  let levelIndex = 0;
  let map = [];
  let player;
  let guards = [];
  let pickups = [];
  let spikes = [];
  let exit = null;
  let shake = 0;
  let message = "";
  let messageTime = 0;
  let timeLeft = 60;
  let last = performance.now();

  function makeActor(x, y, kind) {
    return {
      x,
      y,
      w: kind === "guard" ? 24 : 22,
      h: 32,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: false,
      hp: kind === "guard" ? 2 : 3,
      strike: 0,
      invuln: 0,
      kind,
    };
  }

  function loadLevel(index) {
    levelIndex = index;
    map = levels[index].map((row) => row.split(""));
    guards = [];
    pickups = [];
    spikes = [];
    exit = null;
    timeLeft = 64 + index * 8;
    message = "";
    messageTime = 0;

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) {
        const c = map[y][x];
        const px = x * TILE + 7;
        const py = HUD + y * TILE + 2;
        if (c === "P") {
          player = makeActor(px, py, "player");
          map[y][x] = ".";
        } else if (c === "G") {
          guards.push(makeActor(px + 1, py, "guard"));
          map[y][x] = ".";
        } else if (c === "K" || c === "O") {
          pickups.push({ x: x * TILE + 10, y: HUD + y * TILE + 10, w: 16, h: 16, type: c, taken: false });
          map[y][x] = ".";
        } else if (c === "S") {
          spikes.push({ x: x * TILE, y: HUD + y * TILE + 20, w: TILE, h: 16 });
          map[y][x] = ".";
        } else if (c === "E") {
          exit = { x: x * TILE + 4, y: HUD + y * TILE - 2, w: 28, h: 38 };
          map[y][x] = ".";
        }
      }
    }

    player.hasKey = false;
    state = "playing";
  }

  function rects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function tileAt(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return "#";
    return map[ty][tx];
  }

  function isSolid(tx, ty) {
    const c = tileAt(tx, ty);
    if (c === "D" && player && player.hasKey) return false;
    return solids.has(c);
  }

  function moveActor(actor, dt) {
    actor.vy += GRAVITY * dt;
    const maxFall = 980;
    if (actor.vy > maxFall) actor.vy = maxFall;

    actor.x += actor.vx * dt;
    collideAxis(actor, "x");
    actor.y += actor.vy * dt;
    actor.grounded = false;
    collideAxis(actor, "y");

    actor.x = Math.max(0, Math.min(W - actor.w, actor.x));
    if (actor.y > H + 120) hurt(actor, 99);
  }

  function collideAxis(actor, axis) {
    const left = Math.floor(actor.x / TILE);
    const right = Math.floor((actor.x + actor.w - 1) / TILE);
    const top = Math.floor((actor.y - HUD) / TILE);
    const bottom = Math.floor((actor.y + actor.h - 1 - HUD) / TILE);

    for (let ty = top; ty <= bottom; ty += 1) {
      for (let tx = left; tx <= right; tx += 1) {
        if (!isSolid(tx, ty)) continue;
        const tile = { x: tx * TILE, y: HUD + ty * TILE, w: TILE, h: TILE };
        if (!rects(actor, tile)) continue;
        if (axis === "x") {
          if (actor.vx > 0) actor.x = tile.x - actor.w;
          if (actor.vx < 0) actor.x = tile.x + tile.w;
          actor.vx = 0;
        } else {
          if (actor.vy > 0) {
            actor.y = tile.y - actor.h;
            actor.grounded = true;
          }
          if (actor.vy < 0) actor.y = tile.y + tile.h;
          actor.vy = 0;
        }
      }
    }
  }

  function hurt(actor, amount) {
    if (actor.invuln > 0 || actor.hp <= 0) return;
    actor.hp -= amount;
    actor.invuln = 0.9;
    actor.vx = -actor.facing * 210;
    actor.vy = -280;
    shake = 0.18;
    if (actor === player && actor.hp <= 0) {
      state = "lost";
      message = "THE HOURGLASS IS EMPTY";
    }
  }

  function strike(attacker, targets) {
    attacker.strike = 0.18;
    const blade = {
      x: attacker.facing > 0 ? attacker.x + attacker.w : attacker.x - 26,
      y: attacker.y + 9,
      w: 26,
      h: 16,
    };
    for (const target of targets) {
      if (target.hp > 0 && rects(blade, target)) {
        target.facing = -attacker.facing;
        hurt(target, 1);
      }
    }
  }

  function updatePlayer(dt) {
    const left = keys.has("ArrowLeft") || keys.has("KeyA");
    const right = keys.has("ArrowRight") || keys.has("KeyD");
    const jump = pressed.has("ArrowUp") || pressed.has("KeyW");
    const attack = pressed.has("Space") || pressed.has("KeyJ");
    const speed = player.grounded ? RUN : AIR;

    if (left) {
      player.vx = Math.max(player.vx - speed * 5 * dt, -RUN);
      player.facing = -1;
    } else if (right) {
      player.vx = Math.min(player.vx + speed * 5 * dt, RUN);
      player.facing = 1;
    } else if (player.grounded) {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 6) player.vx = 0;
    }

    if (jump && player.grounded) {
      player.vy = -JUMP;
      player.grounded = false;
    }

    if (attack && player.strike <= 0) strike(player, guards);
    moveActor(player, dt);
  }

  function updateGuards(dt) {
    for (const guard of guards) {
      if (guard.hp <= 0) continue;
      const distance = player.x - guard.x;
      const sameBand = Math.abs(player.y - guard.y) < 42;
      const chasing = sameBand && Math.abs(distance) < 230;
      guard.facing = chasing ? Math.sign(distance || guard.facing) : guard.facing;
      const probeX = guard.x + (guard.facing > 0 ? guard.w + 8 : -8);
      const footY = guard.y + guard.h + 4 - HUD;
      const frontTile = Math.floor(probeX / TILE);
      const footTile = Math.floor(footY / TILE);
      if (!chasing && (!isSolid(frontTile, footTile) || isSolid(frontTile, footTile - 1))) {
        guard.facing *= -1;
      }
      guard.vx = guard.facing * (chasing ? 100 : 58);
      if (chasing && Math.abs(distance) < 36 && guard.strike <= 0) strike(guard, [player]);
      moveActor(guard, dt);
    }
  }

  function updateWorld(dt) {
    timeLeft -= dt;
    if (timeLeft <= 0 && state === "playing") {
      state = "lost";
      message = "THE HOURGLASS IS EMPTY";
    }

    updatePlayer(dt);
    updateGuards(dt);

    player.invuln = Math.max(0, player.invuln - dt);
    player.strike = Math.max(0, player.strike - dt);
    for (const guard of guards) {
      guard.invuln = Math.max(0, guard.invuln - dt);
      guard.strike = Math.max(0, guard.strike - dt);
    }

    for (const spike of spikes) {
      if (rects(player, spike)) hurt(player, 1);
    }

    for (const item of pickups) {
      if (item.taken || !rects(player, item)) continue;
      item.taken = true;
      if (item.type === "K") {
        player.hasKey = true;
        flash("KEY TAKEN");
      } else {
        player.hp = Math.min(3, player.hp + 1);
        flash("LIFE RESTORED");
      }
    }

    if (exit && rects(player, exit) && player.hasKey) {
      if (levelIndex < levels.length - 1) {
        loadLevel(levelIndex + 1);
        flash("GATE PASSED");
      } else {
        state = "won";
        message = "PALACE CLEARED";
      }
    }

    messageTime = Math.max(0, messageTime - dt);
    shake = Math.max(0, shake - dt);
    pressed.clear();
  }

  function flash(text) {
    message = text;
    messageTime = 1.2;
  }

  function drawTile(x, y, c) {
    const px = x * TILE;
    const py = HUD + y * TILE;
    if (c === "#") {
      ctx.fillStyle = "#35434e";
      ctx.fillRect(px, py, TILE, TILE);
      ctx.fillStyle = "#5f6e78";
      ctx.fillRect(px, py, TILE, 5);
      ctx.fillStyle = "#252d35";
      ctx.fillRect(px, py + TILE - 6, TILE, 6);
      ctx.fillStyle = "rgba(0,0,0,0.22)";
      ctx.fillRect(px + 1, py + 6, 2, TILE - 9);
      if ((x + y) % 2 === 0) ctx.fillRect(px + TILE - 3, py + 8, 2, TILE - 12);
    } else if (c === "D") {
      ctx.fillStyle = player.hasKey ? "#1d252c" : "#7a5137";
      ctx.fillRect(px + 4, py, TILE - 8, TILE);
      ctx.fillStyle = player.hasKey ? "#41b883" : "#d7a746";
      ctx.fillRect(px + 10, py + 8, 4, TILE - 15);
      ctx.fillRect(px + TILE - 14, py + 8, 4, TILE - 15);
    }
  }

  function drawActor(actor) {
    if (actor.hp <= 0) {
      ctx.fillStyle = "rgba(13, 13, 15, 0.55)";
      ctx.fillRect(actor.x - 2, actor.y + actor.h - 6, actor.w + 8, 5);
      return;
    }
    const flicker = actor.invuln > 0 && Math.floor(performance.now() / 70) % 2 === 0;
    if (flicker) return;
    const isGuard = actor.kind === "guard";
    ctx.fillStyle = isGuard ? "#953f45" : "#efe5c1";
    ctx.fillRect(actor.x + 6, actor.y + 7, 12, 17);
    ctx.fillStyle = isGuard ? "#2f1719" : "#27313b";
    ctx.fillRect(actor.x + 7, actor.y, 10, 9);
    ctx.fillStyle = isGuard ? "#d7a746" : "#a7463d";
    ctx.fillRect(actor.x + 4, actor.y + 22, 16, 4);
    ctx.fillStyle = "#171717";
    ctx.fillRect(actor.x + 5, actor.y + 27, 5, 5);
    ctx.fillRect(actor.x + 15, actor.y + 27, 5, 5);
    ctx.fillStyle = "#e2d6b1";
    const armX = actor.facing > 0 ? actor.x + 18 : actor.x - 4;
    ctx.fillRect(armX, actor.y + 10, 9, 3);
    if (actor.strike > 0) {
      ctx.fillStyle = "#dfe8ee";
      const bx = actor.facing > 0 ? actor.x + 23 : actor.x - 28;
      ctx.fillRect(bx, actor.y + 10, 29, 3);
      ctx.fillStyle = "#8cb6c9";
      ctx.fillRect(bx + (actor.facing > 0 ? 25 : 0), actor.y + 8, 4, 7);
    }
  }

  function drawHud() {
    ctx.fillStyle = "#10151c";
    ctx.fillRect(0, 0, W, HUD);
    ctx.fillStyle = "#27313b";
    ctx.fillRect(0, HUD - 4, W, 4);

    ctx.fillStyle = "#f3e7c8";
    ctx.font = "20px Menlo, Consolas, monospace";
    ctx.fillText("PALACE RUN", 26, 30);
    ctx.fillStyle = "#b7a179";
    ctx.font = "14px Menlo, Consolas, monospace";
    ctx.fillText("LEVEL " + (levelIndex + 1), 28, 54);

    const time = Math.max(0, Math.ceil(timeLeft));
    ctx.fillStyle = time < 12 ? "#d35345" : "#d7a746";
    ctx.fillText(String(time).padStart(2, "0"), 840, 30);

    ctx.fillStyle = state === "playing" ? "rgba(43, 19, 18, 0.96)" : "rgba(39, 49, 59, 0.68)";
    ctx.strokeStyle = "rgba(243, 231, 200, 0.72)";
    ctx.lineWidth = 1;
    ctx.fillRect(EXIT_CONTROL.x, EXIT_CONTROL.y, EXIT_CONTROL.w, EXIT_CONTROL.h);
    ctx.strokeRect(EXIT_CONTROL.x + 0.5, EXIT_CONTROL.y + 0.5, EXIT_CONTROL.w - 1, EXIT_CONTROL.h - 1);
    ctx.fillStyle = "#f3e7c8";
    ctx.font = "13px Menlo, Consolas, monospace";
    ctx.fillText("Esc", EXIT_CONTROL.x + 13, EXIT_CONTROL.y + 20);

    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = i < player.hp ? "#d35345" : "#39434b";
      ctx.fillRect(744 + i * 24, 43, 16, 12);
    }

    ctx.fillStyle = player.hasKey ? "#d7a746" : "#39434b";
    ctx.fillRect(674, 42, 18, 10);
    ctx.fillRect(688, 46, 9, 4);

    if (messageTime > 0 || state !== "playing") {
      ctx.textAlign = "center";
      ctx.fillStyle = state === "lost" ? "#d35345" : "#f3e7c8";
      ctx.font = "18px Menlo, Consolas, monospace";
      ctx.fillText(message, W / 2, 44);
      ctx.textAlign = "left";
    }
  }

  function drawBackdrop() {
    const grad = ctx.createLinearGradient(0, HUD, 0, H);
    grad.addColorStop(0, "#151c24");
    grad.addColorStop(0.55, "#101217");
    grad.addColorStop(1, "#090a0d");
    ctx.fillStyle = grad;
    ctx.fillRect(0, HUD, W, H - HUD);

    ctx.fillStyle = "rgba(215,167,70,0.08)";
    for (let x = 54; x < W; x += 180) {
      ctx.fillRect(x, HUD + 26, 26, H - HUD - 26);
      ctx.fillRect(x - 10, HUD + 28, 46, 7);
    }
  }

  function drawWorld() {
    drawBackdrop();
    if (exit) {
      ctx.fillStyle = player.hasKey ? "#41b883" : "#2d3942";
      ctx.fillRect(exit.x - 4, exit.y + 2, exit.w + 8, exit.h);
      ctx.fillStyle = "#10151c";
      ctx.fillRect(exit.x + 4, exit.y + 10, exit.w - 8, exit.h - 10);
    }

    for (let y = 0; y < ROWS; y += 1) {
      for (let x = 0; x < COLS; x += 1) drawTile(x, y, map[y][x]);
    }

    for (const spike of spikes) {
      ctx.fillStyle = "#d35345";
      for (let i = 0; i < 4; i += 1) {
        ctx.beginPath();
        ctx.moveTo(spike.x + i * 9, spike.y + 16);
        ctx.lineTo(spike.x + i * 9 + 5, spike.y);
        ctx.lineTo(spike.x + i * 9 + 10, spike.y + 16);
        ctx.fill();
      }
    }

    for (const item of pickups) {
      if (item.taken) continue;
      ctx.fillStyle = item.type === "K" ? "#d7a746" : "#41b883";
      ctx.fillRect(item.x, item.y + Math.sin(performance.now() / 170) * 2, item.w, item.h);
      ctx.fillStyle = "#111923";
      if (item.type === "K") ctx.fillRect(item.x + 10, item.y + 6, 9, 4);
      else ctx.fillRect(item.x + 5, item.y + 4, 6, 9);
    }

    for (const guard of guards) drawActor(guard);
    drawActor(player);
  }

  function drawOverlay(title, action) {
    ctx.fillStyle = "rgba(8,9,11,0.62)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f3e7c8";
    ctx.font = "42px Menlo, Consolas, monospace";
    ctx.fillText(title, W / 2, 214);
    ctx.fillStyle = "#d7a746";
    ctx.font = "18px Menlo, Consolas, monospace";
    ctx.fillText(action, W / 2, 260);
    ctx.textAlign = "left";
  }

  function render() {
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 5);
    }
    drawWorld();
    drawHud();
    ctx.restore();

    if (state === "title") drawOverlay("PALACE RUN", "START");
    if (state === "quit") drawOverlay("EXITED", "START");
    if (state === "lost") drawOverlay("FALLEN", "RESTART");
    if (state === "won") drawOverlay("CLEARED", "RESTART");
  }

  function step(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    if (state === "playing") updateWorld(dt);
    render();
    requestAnimationFrame(step);
  }

  function beginOrRestart() {
    loadLevel(0);
  }

  function quitToTitle() {
    keys.clear();
    pressed.clear();
    state = "quit";
    message = "EXITED";
  }

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  function isExitPoint(point) {
    return (
      point.x >= EXIT_CONTROL.x &&
      point.x <= EXIT_CONTROL.x + EXIT_CONTROL.w &&
      point.y >= EXIT_CONTROL.y &&
      point.y <= EXIT_CONTROL.y + EXIT_CONTROL.h
    );
  }

  window.addEventListener("keydown", (event) => {
    const code = event.code;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "Escape"].includes(code)) event.preventDefault();
    if (code === "Escape" && state === "playing") {
      quitToTitle();
      return;
    }
    if (!keys.has(code)) pressed.add(code);
    keys.add(code);
    if ((state === "title" || state === "lost" || state === "won" || state === "quit") && (code === "Enter" || code === "Space")) {
      beginOrRestart();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.code);
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (state === "playing" && isExitPoint(canvasPoint(event))) {
      quitToTitle();
      return;
    }
    if (state !== "playing") beginOrRestart();
  });

  for (const button of touchButtons) {
    const code = button.dataset.key;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (!keys.has(code)) pressed.add(code);
      keys.add(code);
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      keys.delete(code);
    });
    button.addEventListener("pointercancel", () => keys.delete(code));
  }

  for (const button of quitButtons) {
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (state === "playing") quitToTitle();
    });
  }

  loadLevel(0);
  state = "title";
  requestAnimationFrame(step);
})();
