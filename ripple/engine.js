// Ripple engine: pure logic shared by the browser and the level generator.
// Each tap toggles a shape of cells around the tapped cell. The shape changes
// with every tap, cycling through the level's list, so tap order matters.
(function (root) {
  // Offsets are tested per cell, so shapes clip naturally at the board edge.
  const SHAPES = {
    dot: (dx, dy) => dx === 0 && dy === 0,
    plus: (dx, dy) => Math.abs(dx) + Math.abs(dy) <= 1,
    diamond: (dx, dy) => Math.abs(dx) + Math.abs(dy) === 2,
    cross: (dx, dy) => dx === 0 || dy === 0,
    x: (dx, dy) => Math.abs(dx) === Math.abs(dy),
  };

  const maskOf = (L, kind, c) => {
    const cx = c % L.w, cy = (c / L.w) | 0;
    let m = 0;
    for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++)
      if (SHAPES[kind](x - cx, y - cy)) m |= 1 << (y * L.w + x);
    return m;
  };

  function parse(def) {
    const L = { ...def };
    L.board = [...def.rows.join('')].reduce((b, ch, i) => (ch === '#' ? b | (1 << i) : b), 0);
    L.cells = L.w * L.h;
    L.masks = {};
    for (const k of new Set(L.cycle)) L.masks[k] = Array.from({ length: L.cells }, (_, c) => maskOf(L, k, c));
    return L;
  }

  const kindAt = (L, tapNo) => L.cycle[tapNo % L.cycle.length];
  const tap = (L, board, tapNo, cell) => board ^ L.masks[kindAt(L, tapNo)][cell];

  // Fewest taps (<= max) that clear `board` when the next tap is number `tapNo`.
  // Meet in the middle: enumerate the first half of the taps, then the second.
  // Returns an array of cells, or null.
  function solve(L, board, tapNo, max) {
    if (board === 0) return [];
    for (let r = 1; r <= max; r++) {
      const h = r >> 1, first = new Map();
      const walk = (from, to, acc, path, visit) => {
        if (from === to) return visit(acc, path);
        const m = L.masks[kindAt(L, from)];
        for (let c = 0; c < L.cells; c++) {
          path.push(c);
          const res = walk(from + 1, to, acc ^ m[c], path, visit);
          path.pop();
          if (res) return res;
        }
        return null;
      };
      walk(tapNo, tapNo + h, 0, [], (acc, path) => { if (!first.has(acc)) first.set(acc, path.slice()); });
      const hit = walk(tapNo + h, tapNo + r, 0, [], (acc, path) => {
        const f = first.get(acc ^ board);
        return f ? f.concat(path) : null;
      });
      if (hit) return hit;
    }
    return null;
  }

  const api = { SHAPES, parse, kindAt, tap, solve };
  if (typeof module !== 'undefined') module.exports = api; else root.Ripple = api;
})(this);
