// Crease engine: folding a strip of coloured cells. Cells that land on each
// other mix: same colour stays, two different colours make the third one.
// (a, b) -> -(a + b) mod 3. This is not associative, so fold order matters.
(function (root) {
  const mix = (a, b) => (6 - a - b) % 3;

  // Fold at gap g (1..n-1; the crease sits between cells g-1 and g).
  // The longer side stays put and the shorter side folds onto it.
  // Returns { seq, moving: 'left'|'right', len } where `moving` is the side that
  // travels, so the UI can animate it.
  function fold(seq, g) {
    const n = seq.length, l = g, r = n - g;
    if (l <= r) {
      const out = seq.slice(g);
      for (let i = 0; i < l; i++) out[i] = mix(out[i], seq[g - 1 - i]);
      return { seq: out, moving: 'left', len: l };
    }
    const out = seq.slice(0, g);
    for (let i = 0; i < r; i++) out[g - 1 - i] = mix(out[g - 1 - i], seq[g + i]);
    return { seq: out, moving: 'right', len: r };
  }

  const key = s => s.join('');

  // Shortest list of gaps that folds `seq` down to one cell of colour `target`.
  function solve(seq, target) {
    if (seq.length === 1) return seq[0] === target ? [] : null;
    const seen = new Map([[key(seq), null]]);
    let frontier = [seq];
    while (frontier.length) {
      const next = [];
      for (const s of frontier) {
        for (let g = 1; g < s.length; g++) {
          const n = fold(s, g).seq, k = key(n);
          if (seen.has(k)) continue;
          seen.set(k, { from: key(s), g });
          if (n.length === 1) {
            if (n[0] !== target) continue;
            const path = [];
            for (let c = k; seen.get(c); c = seen.get(c).from) path.unshift(seen.get(c).g);
            return path;
          }
          next.push(n);
        }
      }
      frontier = next;
    }
    return null;
  }

  // How many complete fold orders end on each colour (used to rate difficulty).
  function outcomes(seq, memo = new Map()) {
    if (seq.length === 1) { const o = [0, 0, 0]; o[seq[0]] = 1; return o; }
    const k = key(seq);
    if (memo.has(k)) return memo.get(k);
    const tot = [0, 0, 0];
    for (let g = 1; g < seq.length; g++) outcomes(fold(seq, g).seq, memo).forEach((v, c) => (tot[c] += v));
    memo.set(k, tot);
    return tot;
  }

  const api = { mix, fold, solve, outcomes };
  if (typeof module !== 'undefined') module.exports = api; else root.Crease = api;
})(this);
