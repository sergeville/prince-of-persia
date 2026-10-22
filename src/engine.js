(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PalaceEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const WIDTH = 960, HEIGHT = 540, STEP = 1 / 120;
  const GRAVITY = 1350, JUMP = 535, RUN = 235, WALK = 88;
  const rect = (x, y, w, h) => ({ x, y, w, h });
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const approach = (v, target, step) => v < target ? Math.min(target, v + step) : Math.max(target, v - step);
  const ROOMS = [
    { name: "The forgotten cistern", subtitle: "A way out, somewhere above the dark.",
      hint: "Run + ↑ to clear the gap. Catch a ledge, then ↑ to climb.",
      platforms: [rect(0, 440, 280, 100), rect(392, 440, 568, 100), rect(548, 368, 160, 72)],
      spikes: [], torches: [142, 476, 822], potion: rect(621, 340, 18, 28), exit: rect(887, 364, 48, 76), spawn: { x: 76, y: 382 } },
    { name: "The watcher's hall", subtitle: "Steel has a rhythm. Wait. Deflect. Answer.",
      hint: "Space / J: strike · K: parry. Watch for the guard's raised blade.",
      platforms: [rect(0, 440, 960, 100)], spikes: [rect(290, 421, 54, 19)],
      torches: [126, 440, 826], guard: { x: 576, y: 382 }, key: rect(732, 414, 22, 22),
      potion: rect(816, 412, 18, 28), exit: rect(887, 364, 48, 76), spawn: { x: 76, y: 382 } },
    { name: "The last gate", subtitle: "One plate. One chance to outrun the iron.",
      hint: "Step on the brass plate. Cross the gap and climb before the gate closes.",
      platforms: [rect(0, 440, 328, 100), rect(436, 440, 524, 100), rect(554, 376, 112, 64)],
      spikes: [], torches: [108, 500, 724], plate: rect(192, 436, 52, 4), gate: rect(800, 302, 22, 138),
      exit: rect(890, 364, 48, 76), spawn: { x: 76, y: 382 } }
  ];

  function actor(x, y, guard = false) {
    return { x, y, w: 25, h: 58, vx: 0, vy: 0, facing: guard ? -1 : 1,
      hp: 3, grounded: true, crouching: false, hang: null, grabLock: 0,
      invulnerable: 0, attack: 0, attackHit: false, cooldown: 0, parry: 0,
      stun: 0, mode: "idle", modeTime: 0.7, anim: 0, guard };
  }

  class Game {
    constructor() {
      this.state = "title"; this.time = 0; this.elapsed = 0; this.deaths = 0;
      this.key = false; this.events = []; this.message = ""; this.messageTime = 0;
      this.loadRoom(0);
    }
    start() {
      this.elapsed = 0; this.deaths = 0; this.key = false;
      this.loadRoom(0); this.state = "playing"; this.emit("start");
    }
    loadRoom(index) {
      this.roomIndex = index; this.room = ROOMS[index];
      this.player = actor(this.room.spawn.x, this.room.spawn.y);
      this.guard = this.room.guard ? actor(this.room.guard.x, this.room.guard.y, true) : null;
      this.keyTaken = false; this.potionTaken = false; this.gateTime = 0;
      this.roomTime = 0; this.message = this.room.subtitle; this.messageTime = 4;
      this.checkpointKey = this.key;
    }
    retry() {
      this.key = this.checkpointKey;
      this.loadRoom(this.roomIndex); this.state = "playing"; this.emit("retry");
    }
    pause() { if (this.state === "playing") this.state = "paused"; }
    resume() { if (this.state === "paused") this.state = "playing"; }
    quit() { this.state = "title"; }
    emit(type, x = this.player.x, y = this.player.y + 24) {
      this.events.push({ type, x, y });
      if (this.events.length > 40) this.events.shift();
    }
    flash(text, seconds = 2.5) { this.message = text; this.messageTime = seconds; }
    get gateOpen() { return this.gateTime > 0; }
    solids() { return this.room.gate && !this.gateOpen ? [...this.room.platforms, this.room.gate] : this.room.platforms; }
    die(reason) {
      if (this.state !== "playing") return;
      this.player.hp = 0; this.state = "dead"; this.deaths++;
      this.flash(reason, 100); this.emit("death");
    }
    hurt(target, direction, amount = 1) {
      if (target.invulnerable > 0 || target.hp <= 0) return;
      target.hp = Math.max(0, target.hp - amount); target.invulnerable = 0.8;
      target.vx = direction * 130; target.stun = 0.19;
      this.emit("hit", target.x, target.y + 22);
      if (!target.guard && target.hp === 0) this.die("The palace takes its toll.");
      if (target.guard && target.hp === 0) this.flash("The way is clear. Take the brass key.");
    }
    move(a, dt, input = {}) {
      const surfaces = this.solids();
      const oldX = a.x, oldY = a.y;
      a.vy = Math.min(850, a.vy + GRAVITY * dt);
      a.x = clamp(a.x + a.vx * dt, 10, WIDTH - a.w - 10);
      for (const s of surfaces) {
        if (!overlaps(a, s)) continue;
        if (a.vx > 0) a.x = s.x - a.w;
        else if (a.vx < 0) a.x = s.x + s.w;
        a.vx = 0;
      }
      a.y += a.vy * dt; a.grounded = false;
      for (const s of surfaces) {
        if (!overlaps(a, s)) continue;
        if (a.vy > 0 && oldY + a.h <= s.y + 1) {
          if (!a.guard && a.vy > 420) this.emit("land");
          a.y = s.y - a.h; a.vy = 0; a.grounded = true;
        } else if (a.vy < 0 && oldY >= s.y + s.h - 1) {
          a.y = s.y + s.h; a.vy = 0;
        }
      }
      // A descending hand can catch an exposed platform lip; never catch the gate.
      if (!a.guard && !a.grounded && a.vy > 0 && a.grabLock <= 0 && !input.crouch) {
        for (const s of this.room.platforms) {
          const nearLeft = Math.abs(a.x + a.w - s.x) < 12 && a.facing > 0;
          const nearRight = Math.abs(a.x - (s.x + s.w)) < 12 && a.facing < 0;
          if (!(nearLeft || nearRight) || Math.abs(a.y + 9 - s.y) > 14) continue;
          const edgeX = nearLeft ? s.x - a.w : s.x + s.w;
          const body = rect(edgeX, s.y - 8, a.w, a.h);
          if (surfaces.some(other => other !== s && overlaps(body, other))) continue;
          a.hang = { x: edgeX, y: s.y - 8, top: s.y, side: nearLeft ? 1 : -1 };
          a.x = edgeX; a.y = s.y - 8; a.vx = 0; a.vy = 0; this.emit("grab"); break;
        }
      }
      a.anim += Math.abs(a.x - oldX) * 0.09;
      if (a.y > HEIGHT + 70) {
        if (a.guard) a.hp = 0;
        else this.die("Lost beneath the cistern.");
      }
    }
    updatePlayer(dt, input) {
      const p = this.player;
      if (p.hang) {
        if (input.jump) {
          const h = p.hang;
          const destination = rect(p.x + h.side * (p.w + 4), h.top - 58, p.w, 58);
          if (!this.solids().some(s => overlaps(destination, s))) {
            Object.assign(p, destination, { hang: null, grounded: true, vy: 0, vx: 0, grabLock: 0.2 });
            this.emit("climb");
          }
        } else if (input.crouch) {
          p.hang = null; p.grabLock = 0.35; p.vy = 90;
        }
        return;
      }
      const feet = p.y + p.h;
      if (input.crouch && p.grounded) { p.crouching = true; p.h = 36; p.y = feet - 36; }
      else if (p.crouching) {
        const standing = rect(p.x, feet - 58, p.w, 58);
        if (!this.solids().some(s => overlaps(standing, s))) { p.crouching = false; p.h = 58; p.y = feet - 58; }
      }
      const direction = Number(!!input.right) - Number(!!input.left);
      if (p.stun <= 0) {
        if (direction) p.facing = direction;
        const speed = p.crouching ? 55 : input.walk ? WALK : RUN;
        const target = p.parry > 0 || p.attack > 0 ? 0 : direction * speed;
        p.vx = approach(p.vx, target, (p.grounded ? 1750 : 900) * dt);
        // Careful walking stops at a drop. Running and jumping remain deliberate.
        if (input.walk && p.grounded && direction) {
          const probe = rect(p.x + (direction > 0 ? p.w + 3 : -4), feet, 2, 5);
          if (!this.room.platforms.some(s => overlaps(probe, s))) p.vx = 0;
        }
        if (input.jump && p.grounded && !p.crouching) { p.vy = -JUMP; p.grounded = false; this.emit("jump"); }
        if (input.parry && p.grounded && p.cooldown <= 0 && !p.crouching) {
          p.parry = 0.36; p.cooldown = 0.52; this.emit("blade");
        } else if (input.attack && p.grounded && p.cooldown <= 0 && !p.crouching) {
          p.attack = 0.34; p.attackHit = false; p.cooldown = 0.48; this.emit("blade");
        }
      }
      this.move(p, dt, input);
      if (p.attack > 0 && p.attack < 0.23 && !p.attackHit) {
        p.attackHit = true;
        const blade = rect(p.facing > 0 ? p.x + p.w - 3 : p.x - 49, p.y + 14, 52, 27);
        if (this.guard && this.guard.hp > 0 && overlaps(blade, this.guard)) {
          this.hurt(this.guard, p.facing); this.guard.mode = "recover"; this.guard.modeTime = 0.65;
        }
      }
    }
    updateGuard(dt) {
      const g = this.guard, p = this.player;
      if (!g || g.hp <= 0) return;
      const dx = p.x - g.x, distance = Math.abs(dx), sameFloor = Math.abs(p.y + p.h - g.y - g.h) < 35;
      g.facing = dx < 0 ? -1 : 1;
      g.modeTime -= dt;
      if (g.stun > 0) { this.move(g, dt); return; }
      if (g.mode === "windup") {
        g.vx = 0;
        if (g.modeTime <= 0) {
          g.mode = "recover"; g.modeTime = 0.95; g.attack = 0.26;
          const blade = rect(g.facing > 0 ? g.x + g.w : g.x - 47, g.y + 12, 47, 30);
          if (overlaps(blade, p)) {
            if (p.parry > 0 && p.facing === -g.facing) {
              g.modeTime = 1.2; g.stun = 0.65; this.emit("parry", p.x + p.facing * 22, p.y + 20);
              this.flash("Deflected. Strike now.", 1.3);
            } else this.hurt(p, g.facing);
          }
        }
      } else if (g.mode === "recover" && g.modeTime > 0) g.vx = 0;
      else if (sameFloor && distance < 68) {
        g.vx = 0; g.mode = "windup"; g.modeTime = 0.6; this.emit("warning", g.x, g.y - 8);
      } else {
        g.mode = "idle";
        g.vx = sameFloor && distance < 240 ? g.facing * 80 : 0;
        const probe = rect(g.x + (g.facing > 0 ? g.w + 8 : -8), g.y + g.h, 2, 5);
        if (!this.room.platforms.some(s => overlaps(probe, s))) g.vx = 0;
      }
      this.move(g, dt);
      // Combatants cannot run through one another.
      if (overlaps(g, p) && p.hp > 0) {
        const left = p.x < g.x;
        p.x = clamp(left ? g.x - p.w - 1 : g.x + g.w + 1, 10, WIDTH - p.w - 10);
      }
    }
    update(dt, input = {}) {
      if (this.state !== "playing" || !Number.isFinite(dt) || dt <= 0) return;
      dt = Math.min(STEP, dt);
      this.time += dt; this.elapsed += dt; this.roomTime += dt;
      this.messageTime = Math.max(0, this.messageTime - dt);
      for (const a of [this.player, this.guard].filter(Boolean)) {
        for (const key of ["invulnerable", "attack", "cooldown", "parry", "stun", "grabLock"]) a[key] = Math.max(0, a[key] - dt);
      }
      this.gateTime = Math.max(0, this.gateTime - dt);
      // A closing gate waits if the player occupies it, preventing clipping or crushing on a timer edge.
      if (this.room.gate && !this.gateOpen && overlaps(this.player, this.room.gate)) this.gateTime = 0.05;
      this.updatePlayer(dt, input);
      if (this.state !== "playing") return;
      this.updateGuard(dt);
      if (this.state !== "playing") return;
      const p = this.player;
      for (const spike of this.room.spikes) if (overlaps(p, spike)) this.hurt(p, -p.facing, 2);
      if (this.state !== "playing") return;
      if (this.room.plate && p.grounded && overlaps(rect(p.x, p.y + p.h - 2, p.w, 5), this.room.plate)) {
        if (!this.gateOpen) { this.emit("gate"); this.flash("The gate is rising. Seven seconds."); }
        this.gateTime = 7;
      }
      if (this.room.potion && !this.potionTaken && p.hp < 3 && overlaps(p, this.room.potion)) {
        this.potionTaken = true; p.hp = 3; this.emit("potion"); this.flash("Strength restored.");
      }
      if (this.room.key && !this.keyTaken && overlaps(p, this.room.key) && (!this.guard || this.guard.hp <= 0)) {
        this.key = true; this.keyTaken = true; this.emit("key"); this.flash("The brass key. The final gate awaits.");
      }
      if (overlaps(p, this.room.exit)) {
        if (this.roomIndex === 1 && !this.key) { this.flash("The watcher holds the way. Defeat him and take the key.", 1); return; }
        if (this.roomIndex < ROOMS.length - 1) { this.loadRoom(this.roomIndex + 1); this.emit("room"); }
        else if (this.key) { this.state = "won"; this.emit("win"); }
      }
    }
  }
  return { Game, ROOMS, WIDTH, HEIGHT, STEP, overlaps, rect };
});
