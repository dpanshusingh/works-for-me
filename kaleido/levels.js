// Hand-picked, solver-verified levels. par = shortest solution in moves.
const LEVELS = [
  { name: "Twin Steps", par: 4, hint: "Your shadow copies every move you make. Put you on the gold ring and your shadow on the violet one.", rows: ["#####","#..P#","#.GS#","#g#.#","#####"] },
  { name: "Looking Glass", par: 6, hint: "Stepping off a ◧ tile flips the shadow's left and right.", rows: ["######","#.g#.#","#.GS.#","#P..H#","######"] },
  { name: "Upside Down", par: 12, rows: ["######","#.G.P#","##V.##","#S.g.#","##...#","######"] },
  { name: "Double Trouble", par: 15, rows: ["######","#.gV.#","#GS.P#","#.#.H#","#..#.#","######"] },
  { name: "Quarter Turn", par: 13, rows: ["#######","#.G...#","#.#.P.#","#R.#.##","#..Sg##","#######"] },
  { name: "Spin Cycle", par: 13, rows: ["#######","##..P##","##R.#S#","#G#g.R#","#....##","#######"] },
  { name: "Hall of Mirrors", par: 14, rows: ["#######","#..#..#","#.#.PR#","##R.g.#","#.S.#.#","#G##..#","#######"] },
  { name: "Dizzy", par: 22, rows: ["#######","##S##R#","#R.PVG#","####..#","#.###.#","##g...#","#######"] },
  { name: "Kaleidoscope", par: 18, rows: ["########","#.#...H#","#P.#.Vg#","##H...##","#.#.#G.#","#...S#.#","########"] },
  { name: "Vertigo", par: 27, rows: ["########","#.V.#..#","#..R#..#","#P#.g..#","####S..#","##G###.#","#..R...#","########"] },
];
if (typeof module !== 'undefined') module.exports = LEVELS;
