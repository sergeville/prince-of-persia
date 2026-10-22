(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PalaceRenderer = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const gold = "#d7ab66", cream = "#eee0bd";
  function box(c, x, y, w, h, color) { c.fillStyle = color; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function line(c, x, y, ex, ey, color, width = 2) {
    c.strokeStyle = color; c.lineWidth = width; c.beginPath(); c.moveTo(Math.round(x), Math.round(y)); c.lineTo(Math.round(ex), Math.round(ey)); c.stroke();
  }
  function poly(c, points, color) {
    c.fillStyle = color; c.beginPath(); points.forEach(([x, y], i) => i ? c.lineTo(Math.round(x), Math.round(y)) : c.moveTo(Math.round(x), Math.round(y))); c.closePath(); c.fill();
  }
  function text(c, value, x, y, size = 13, color = cream, align = "left") {
    c.font = `${size}px monospace`; c.textAlign = align; c.fillStyle = color; c.fillText(value, x, y); c.textAlign = "left";
  }
  function arch(c, x, y, w, h, color) {
    poly(c, [[x, y + h], [x, y + w / 3], [x + w * .18, y + 10], [x + w / 2, y - 14], [x + w * .82, y + 10], [x + w, y + w / 3], [x + w, y + h]], color);
  }
  function torch(c, x, y, t) {
    const flicker = Math.sin(t * 11 + x) * 3;
    const glow = c.createRadialGradient(x, y - 8, 3, x, y - 8, 94);
    glow.addColorStop(0, "rgba(239,164,67,.23)"); glow.addColorStop(1, "rgba(239,164,67,0)");
    c.fillStyle = glow; c.fillRect(x - 94, y - 102, 188, 188);
    line(c, x - 8, y + 24, x, y + 8, "#141a22", 7);
    box(c, x - 4, y, 8, 20, "#574439"); box(c, x - 8, y + 3, 16, 4, "#aa8352");
    poly(c, [[x - 8, y], [x - 6, y - 10], [x - 2, y - 23 + flicker], [x + 3, y - 11], [x + 6, y - 18 - flicker], [x + 9, y], [x, y + 4]], "#db863f");
    poly(c, [[x - 4, y], [x, y - 14 - flicker], [x + 5, y], [x, y + 3]], "#f5d89b");
  }
  function background(c, g, t) {
    const gradient = c.createLinearGradient(0, 0, 0, 540);
    gradient.addColorStop(0, "#172234"); gradient.addColorStop(1, "#0d111c"); c.fillStyle = gradient; c.fillRect(0, 0, 960, 540);
    for (let row = 0; row < 12; row++) {
      const y = 38 + row * 37; line(c, 0, y, 960, y, "#202b3a", 1);
      for (let col = 0; col < 12; col++) {
        const x = col * 88 + (row % 2) * 44; line(c, x, y, x, y + 37, "#202b3a", 1);
        if ((row * 7 + col) % 11 === 0) line(c, x + 8, y + 12, x + 22, y + 15, "#273343", 2);
      }
    }
    for (const x of [64, 362, 660]) {
      arch(c, x - 9, 114, 218, 304, "#263341"); arch(c, x, 122, 200, 296, "#101827"); arch(c, x + 10, 132, 180, 286, "#080f1b");
      c.save(); c.beginPath(); c.rect(x + 18, 167, 164, 251); c.clip();
      const mx = x + 126, my = 190 - g.roomIndex * 14;
      c.fillStyle = "#9da5a0"; c.beginPath(); c.arc(mx, my, 21, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#0d1726"; c.beginPath(); c.arc(mx - 9, my - 6, 19, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 17; i++) box(c, x + 21 + (i * 43) % 156, 164 + (i * 29) % 125, 1, 1, "#627184");
      for (let i = 0; i < 5; i++) {
        const sx = x + 5 + i * 39, sy = 300 + (i % 3) * 17;
        box(c, sx, sy, 44, 130, "#1b2636"); poly(c, [[sx - 3, sy], [sx + 22, sy - 28], [sx + 47, sy]], "#1b2636"); box(c, sx + 19, sy + 17, 5, 13, "#655e4c");
      }
      box(c, x + 18, 388, 164, 30, "#151f2c"); c.restore();
      for (let n = 0; n < 3; n++) {
        box(c, x - 16 + n * 4, 181, 6, 245, ["#334251", "#455363", "#293644"][n]);
        box(c, x + 201 + n * 4, 181, 6, 245, ["#334251", "#455363", "#293644"][n]);
      }
      box(c, x - 22, 174, 28, 9, "#59646b"); box(c, x + 195, 174, 28, 9, "#59646b");
      box(c, x - 24, 422, 32, 12, "#3c4b59"); box(c, x + 193, 422, 32, 12, "#3c4b59");
    }
    box(c, 0, 63, 960, 18, "#303c49"); box(c, 0, 80, 960, 3, "#6d716a");
    for (let x = 18; x < 960; x += 32) poly(c, [[x, 71], [x + 6, 66], [x + 12, 71], [x + 6, 76]], "#8d8064");
    for (const x of g.room.torches) torch(c, x, 277, t);
    const bx = g.roomIndex === 1 ? 574 : 308;
    line(c, bx - 23, 116, bx + 24, 116, gold, 3);
    poly(c, [[bx - 18, 118], [bx + 18, 118], [bx + 18, 230], [bx, 246], [bx - 18, 230]], g.roomIndex === 1 ? "#613d45" : "#284e56");
    line(c, bx - 12, 123, bx - 12, 226, "#997e59"); line(c, bx + 12, 123, bx + 12, 226, "#997e59");
    poly(c, [[bx, 157], [bx + 8, 174], [bx, 192], [bx - 8, 174]], "#ac9463");
  }
  function platform(c, s) {
    c.save(); c.beginPath(); c.rect(s.x, s.y, s.w, s.h); c.clip();
    box(c, s.x, s.y, s.w, s.h, "#28323e");
    for (let row = 0; row < Math.ceil(s.h / 30); row++) for (let col = -1; col < Math.ceil(s.w / 54); col++) {
      const x = s.x + col * 54 + (row % 2) * 27;
      box(c, x, s.y + 9 + row * 30, 52, 27, (row + col) % 3 === 0 ? "#3d4b58" : "#35434f");
      line(c, x + 3, s.y + 11 + row * 30, x + 50, s.y + 11 + row * 30, "#4c5a65", 1);
    }
    c.restore(); box(c, s.x - 2, s.y, s.w + 4, 6, "#9b9a87"); box(c, s.x - 2, s.y + 6, s.w + 4, 4, "#56616a");
    for (let x = s.x + 32; x < s.x + s.w; x += 54) line(c, x, s.y, x + 1, s.y + 6, "#4a565d");
  }
  function character(c, a, t) {
    const x = Math.round(a.x + a.w / 2), feet = Math.round(a.y + a.h);
    c.save(); c.translate(x, feet); c.scale(a.facing, 1);
    if (a.hp <= 0) { box(c, -24, -9, 47, 7, a.guard ? "#6d424b" : "#597d7d"); box(c, 20, -13, 10, 9, "#b99472"); c.restore(); return; }
    if (a.invulnerable > 0 && Math.floor(t * 15) % 2 === 0) c.globalAlpha = .45;
    const moving = a.grounded && Math.abs(a.vx) > 12, cycle = moving ? a.anim : 0;
    const stride = moving ? Math.sin(cycle) * 12 : 5, bob = moving ? Math.abs(Math.cos(cycle)) * 2 : Math.sin(t * 2) * .6;
    const crouch = a.crouching ? 20 : 0, hang = !!a.hang, airborne = !a.grounded && !hang;
    const hip = -25 + crouch * .25, shoulder = -44 + crouch + bob;
    const cloth = a.guard ? "#894b5c" : "#e2d8b7", shade = a.guard ? "#553247" : "#9a9f97", skin = a.guard ? "#bb9270" : "#d0a67b";
    const back = airborne ? -18 : -stride, front = airborne ? 9 : stride;
    line(c, -3, hip, back - 5, -13, shade, 8); line(c, back - 5, -13, back, -3, shade, 7);
    line(c, 4, hip, front + 2, -13 + (airborne ? -9 : 0), cloth, 8); line(c, front + 2, -13 + (airborne ? -9 : 0), front + 5, -3 - (airborne ? 12 : 0), cloth, 7);
    box(c, back - 3, -4, 11, 4, "#2b3038"); box(c, front + 1, -4 - (airborne ? 12 : 0), 13, 4, "#2b3038");
    poly(c, [[-9, shoulder], [5, shoulder - 1], [10, hip + 2], [-8, hip + 2]], a.guard ? "#754457" : "#497d80");
    line(c, -4, shoulder + 2, -10, shoulder + 14, shade, 5); box(c, -9, hip, 20, 5, a.guard ? "#c6a564" : "#b9694f");
    poly(c, [[-4, hip + 3], [-9 - Math.sin(t * 7) * 3, hip + 20], [0, hip + 15], [4, hip + 3]], a.guard ? "#ae8c55" : "#b9694f");
    const hy = shoulder - 14;
    box(c, -6, hy, 13, 13, skin); box(c, 6, hy + 5, 3, 5, skin); box(c, -8, hy - 3, 14, 6, a.guard ? "#827b6a" : "#262937");
    if (a.guard) { box(c, -9, hy + 1, 4, 12, "#827b6a"); box(c, -7, hy - 7, 13, 4, "#b49c70"); } else box(c, -8, hy + 1, 5, 11, "#262937");
    box(c, 4, hy + 5, 2, 2, "#28232a");
    let handX = 13, handY = shoulder + 17;
    if (hang) { handX = 15; handY = -a.h + 6; }
    else if (a.parry > 0) { handX = 18; handY = shoulder + 2; }
    else if (a.guard && a.mode === "windup") { handX = -3; handY = shoulder - 17; }
    else if (a.attack > 0) { handX = a.attack > .23 ? 4 : 29; handY = shoulder + 7; }
    else if (moving) { handX = 6 - stride * .5; handY = shoulder + 17; }
    line(c, 5, shoulder + 5, handX - 4, handY + 5, cloth, 6); line(c, handX - 4, handY + 5, handX, handY, skin, 5);
    if (hang) line(c, -4, shoulder + 4, 12, -a.h + 6, skin, 4);
    if (!hang && (a.guard || a.attack > 0 || a.parry > 0)) {
      const raised = a.parry > 0 || (a.guard && a.mode === "windup"), tx = raised ? handX + 12 : handX + 34, ty = raised ? handY - 33 : handY - 5;
      line(c, handX, handY, tx, ty, "#91a6af", 4); line(c, handX, handY - 1, tx, ty - 1, "#e2e5cf", 1); line(c, handX + 1, handY - 5, handX - 1, handY + 6, "#c8a66b", 3);
    } else if (!hang) line(c, -6, hip + 2, -15, hip + 23, "#333946", 4);
    c.restore();
    if (a.guard && a.hp > 0) { for (let i = 0; i < 3; i++) box(c, x - 16 + i * 12, a.y - 17, 8, 3, i < a.hp ? "#bd6054" : "#353d48"); if (a.mode === "windup") text(c, "!", x, a.y - 25, 17, "#e8ad67", "center"); }
  }
  function render(c, g, options = {}) {
    const t = options.reducedMotion ? 0 : g.time;
    c.save(); c.imageSmoothingEnabled = false; background(c, g, t);
    const e = g.room.exit;
    arch(c, e.x - 12, e.y - 13, e.w + 24, e.h + 13, "#5d665f"); arch(c, e.x, e.y - 7, e.w, e.h + 7, g.roomIndex === 2 ? "#ad9f7c" : "#111b28"); box(c, e.x - 4, e.y + e.h - 4, e.w + 8, 4, "#c4b591");
    for (const s of g.room.platforms) platform(c, s);
    for (let i = 0; i < g.room.platforms.length - 1; i++) {
      const a = g.room.platforms[i], b = g.room.platforms[i + 1]; if (a.y !== 440 || b.y !== 440 || b.x <= a.x + a.w) continue;
      const x = a.x + a.w, w = b.x - x; box(c, x + 2, 503, w - 4, 37, "#142637");
      for (let n = 0; n < 3; n++) line(c, x + 10 + Math.sin(t + n) * 4, 508 + n * 8, x + w - 15, 508 + n * 8, "#284151", 1);
    }
    for (const s of g.room.spikes) {
      box(c, s.x - 4, s.y + s.h - 3, s.w + 8, 6, "#25212a");
      for (let x = s.x; x < s.x + s.w; x += 11) { poly(c, [[x, s.y + s.h], [x + 5, s.y], [x + 10, s.y + s.h]], "#a6aaa1"); line(c, x + 5, s.y + 3, x + 8, s.y + s.h, "#555d68"); }
    }
    if (g.room.plate) { const s = g.room.plate; box(c, s.x - 3, s.y - 2, s.w + 6, 6, "#4a4641"); box(c, s.x, s.y - 3, s.w, 4, g.gateOpen ? "#ebcb7e" : "#b38d54"); text(c, "PLATE", s.x + s.w / 2, s.y + 27, 10, "#b7a179", "center"); }
    if (g.room.gate) {
      const s = g.room.gate, rise = g.gateOpen ? 114 : 0;
      box(c, s.x - 10, s.y - 12, s.w + 20, 12, "#9a8d73");
      for (let x = s.x; x < s.x + s.w; x += 8) { box(c, x, s.y - 4, 4, s.h - rise, "#a8a28a"); poly(c, [[x - 2, s.y + s.h - rise - 4], [x + 6, s.y + s.h - rise - 4], [x + 2, s.y + s.h - rise + 5]], "#c0b18a"); }
      box(c, s.x, s.y + s.h - rise - 17, s.w, 5, "#787b75"); if (g.gateOpen) text(c, `${Math.ceil(g.gateTime)}s`, s.x + 11, s.y - 25, 17, gold, "center");
    }
    if (g.room.potion && !g.potionTaken) { const p = g.room.potion; box(c, p.x + 6, p.y + 2, 7, 6, "#aa956d"); poly(c, [[p.x + 4, p.y + 9], [p.x + 14, p.y + 9], [p.x + 17, p.y + 23], [p.x, p.y + 23]], "#638e88"); box(c, p.x + 4, p.y + 13, 3, 7, "#b6cbb0"); }
    if (g.room.key && !g.keyTaken) { const k = g.room.key, y = k.y + Math.sin(t * 3) * 2; c.strokeStyle = gold; c.lineWidth = 3; c.beginPath(); c.arc(k.x + 5, y + 5, 5, 0, Math.PI * 2); c.stroke(); line(c, k.x + 10, y + 5, k.x + 24, y + 5, gold, 3); box(c, k.x + 18, y + 5, 3, 6, gold); }
    if (g.guard) character(c, g.guard, t); character(c, g.player, t);
    if (!options.reducedMotion) for (let i = 0; i < 18; i++) { c.globalAlpha = .15 + (Math.sin(t + i) + 1) * .12; box(c, (i * 137 + t * 5) % 960, 120 + (i * 63) % 300 + Math.sin(t + i) * 5, 2, 2, gold); }
    c.globalAlpha = 1; box(c, 0, 0, 960, 57, "#101622"); line(c, 0, 56, 960, 56, "#6b6557", 1);
    text(c, "PALACE RUN", 26, 29, 16); text(c, "THE MIDNIGHT ESCAPE", 26, 45, 9, "#9c9b92"); text(c, `0${g.roomIndex + 1}  /  ${g.room.name.toUpperCase()}`, 480, 31, 12, "#c5b897", "center");
    for (let i = 0; i < 3; i++) poly(c, [[819 + i * 24, 24], [825 + i * 24, 18], [831 + i * 24, 24], [825 + i * 24, 35]], i < g.player.hp ? "#c1775c" : "#3a3d43");
    if (g.key) text(c, "KEY", 927, 32, 11, gold, "right");
    box(c, 0, 491, 960, 49, "rgba(9,14,22,.91)"); line(c, 24, 491, 936, 491, "#3b454c", 1);
    text(c, g.messageTime > 0 ? g.message : g.room.hint, 480, 521, 12, g.messageTime > 0 ? cream : "#a7aaa5", "center"); c.restore();
  }
  return { render, character };
});
