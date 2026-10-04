// Kaleido engine: pure game logic, shared by the browser and the level solver.
// Symbols: # wall, . floor, P player, S shadow, G player goal, g shadow goal,
// H flip left/right, V flip up/down, R rotate controls 90° clockwise.
(function (root) {
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
  const OPS = {
    H: [-1, 0, 0, 1],
    V: [1, 0, 0, -1],
    R: [0, -1, 1, 0],
  };
  const IDENT = [1, 0, 0, 1];

  const mul = (a, b) => [
    a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3],
    a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3],
  ];
  const apply = (m, [x, y]) => [m[0] * x + m[1] * y, m[2] * x + m[3] * y];

  function parse(rows) {
    const level = { w: rows[0].length, h: rows.length, walls: [], ops: {}, p: null, s: null, G: null, g: null };
    rows.forEach((row, y) => {
      level.walls.push([]);
      [...row].forEach((c, x) => {
        level.walls[y].push(c === '#');
        if (c === 'P') level.p = [x, y];
        if (c === 'S') level.s = [x, y];
        if (c === 'G') level.G = [x, y];
        if (c === 'g') level.g = [x, y];
        if (OPS[c]) level.ops[x + ',' + y] = c;
      });
    });
    return level;
  }

  const open = (L, x, y) => x >= 0 && y >= 0 && x < L.w && y < L.h && !L.walls[y][x];

  function start(L) {
    return { p: L.p.slice(), s: L.s.slice(), m: IDENT.slice() };
  }

  // Returns the next state, or null if the player is blocked.
  function step(L, st, dir) {
    const [dx, dy] = DIRS[dir];
    const px = st.p[0] + dx, py = st.p[1] + dy;
    if (!open(L, px, py)) return null;
    const [sx, sy] = apply(st.m, [dx, dy]);
    let s = st.s, m = st.m;
    if (open(L, s[0] + sx, s[1] + sy)) {
      s = [s[0] + sx, s[1] + sy];
      const op = L.ops[s[0] + ',' + s[1]];
      if (op) m = mul(OPS[op], m);
    }
    return { p: [px, py], s, m };
  }

  const won = (L, st) =>
    st.p[0] === L.G[0] && st.p[1] === L.G[1] && st.s[0] === L.g[0] && st.s[1] === L.g[1];

  const key = (st) => st.p + '|' + st.s + '|' + st.m;

  // Breadth-first search; returns shortest list of dirs, or null.
  function solve(L) {
    const s0 = start(L);
    const seen = new Map([[key(s0), null]]);
    let frontier = [s0];
    while (frontier.length) {
      const next = [];
      for (const st of frontier) {
        for (let d = 0; d < 4; d++) {
          const n = step(L, st, d);
          if (!n) continue;
          const k = key(n);
          if (seen.has(k)) continue;
          seen.set(k, { from: key(st), d });
          if (won(L, n)) {
            const path = [];
            for (let c = k; seen.get(c); c = seen.get(c).from) path.unshift(seen.get(c).d);
            return path;
          }
          next.push(n);
        }
      }
      frontier = next;
    }
    return null;
  }

  const api = { DIRS, OPS, IDENT, parse, start, step, won, solve };
  if (typeof module !== 'undefined') module.exports = api; else root.Kaleido = api;
})(this);
