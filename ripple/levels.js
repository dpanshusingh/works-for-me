// Solver-verified: `par` is the fewest taps that clear the board. `#` = lit.
const LEVELS = [
  {name:"First Drop",w:5,h:5,cycle:["plus"],par:1,rows:[".#...","###..",".#...",".....","....."]},
  {name:"Echo",w:5,h:5,cycle:["plus"],par:2,rows:[".#...","###..","##...","##...","#...."]},
  {name:"Double Ring",w:5,h:5,cycle:["dot","plus"],par:2,rows:["##...","#....",".....",".#...","....."]},
  {name:"Pebble",w:5,h:5,cycle:["plus","diamond"],par:3,rows:[".#.#.","##.##","...#.","#.#..","...#."]},
  {name:"Undertow",w:5,h:5,cycle:["plus","dot"],par:3,rows:["...#.","..###","..#..",".###.","..#.."]},
  {name:"Skipping Stone",w:5,h:5,cycle:["plus","diamond","dot"],par:3,rows:[".###.","#.#..",".#...",".##..",".#..."]},
  {name:"Crosscurrent",w:5,h:5,cycle:["cross","dot"],par:3,rows:[".#.#.",".#.#.",".#.#.",".#.#.","#...."]},
  {name:"Eddy",w:5,h:5,cycle:["plus","diamond","dot"],par:4,rows:[".....","##...","##...","#..#.",".#.#."]},
  {name:"Whirlpool",w:5,h:5,cycle:["x","plus"],par:4,rows:["#...#","..#..","#.#.#","#..#.","....#"]},
  {name:"Monsoon",w:5,h:5,cycle:["cross","plus","diamond"],par:4,rows:["#..#.","..#..","..#..","#.##.","#.##."]},
  {name:"Tidal Wave",w:5,h:5,cycle:["plus","x","diamond"],par:5,rows:["#..##",".##..","..##.",".#...","#.#.."]},
  {name:"Cascade",w:5,h:6,cycle:["plus","diamond","dot"],par:5,rows:[".###.",".#...","####.",".##..","..#.#","..##."]},
  {name:"Surge",w:5,h:5,cycle:["cross","x","plus"],par:5,rows:[".####","#.##.",".##..",".##.#","#..#."]},
  {name:"Backwash",w:5,h:6,cycle:["diamond","plus","x"],par:5,rows:["##...","##...","#....",".....",".#...","###.#"]},
  {name:"Maelstrom",w:5,h:6,cycle:["cross","plus","dot","diamond"],par:6,rows:["...##","#....",".#.##","..###","...##",".##.."]},
  {name:"Deep Current",w:5,h:6,cycle:["x","plus","cross"],par:6,rows:["##...",".#...","...##","..#..","#...#","#..##"]},
  {name:"Riptide",w:5,h:6,cycle:["diamond","cross","plus","dot"],par:6,rows:[".....","##.#.",".####",".#.##","###.#","#.#.."]},
  {name:"Squall",w:5,h:6,cycle:["x","cross","diamond"],par:7,rows:["....#","#...#",".##..","#...#","#..#.","...#."]},
  {name:"Typhoon",w:5,h:6,cycle:["plus","diamond","x","dot"],par:7,rows:["##.#.","#.#.#","..##.",".#..#","....#","....."]},
  {name:"Abyss",w:5,h:6,cycle:["cross","diamond","x","plus"],par:7,rows:["..##.",".##.#","####.","###..","...##","..#.."]},
];
if (typeof module !== 'undefined') module.exports = LEVELS;
