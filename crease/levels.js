// Solver-verified. Colours are 0,1,2. `par` is the fewest folds to one cell of the target colour.
const LEVELS = [
  {name:"Pinch",seq:[0,2,2],target:1,par:2},
  {name:"Half Fold",seq:[2,1,0],target:2,par:2},
  {name:"Accordion",seq:[2,0,2,1,0],target:2,par:3},
  {name:"Zigzag",seq:[1,1,1,2,0],target:2,par:3},
  {name:"Dog-ear",seq:[0,0,0,2,1,0],target:2,par:3},
  {name:"Valley",seq:[0,0,1,1,2,1],target:1,par:3},
  {name:"Mountain",seq:[2,2,0,1,0,2,1],target:0,par:3},
  {name:"Gatefold",seq:[1,1,2,0,2,1,0],target:2,par:3},
  {name:"Origami",seq:[2,1,1,0,1,2,1,1],target:1,par:4},
  {name:"Pleat",seq:[0,2,0,0,1,1,1,2,2],target:1,par:4},
  {name:"Tuck",seq:[2,1,2,2,2,0,0,0,1,0],target:0,par:4},
  {name:"Reverse Fold",seq:[2,0,0,1,1,0,1,2,2,1],target:0,par:4},
  {name:"Crane",seq:[2,0,2,2,0,0,2,2,2,2,0],target:2,par:4},
  {name:"Lotus",seq:[0,0,0,2,1,0,2,1,0,1,0],target:1,par:4},
  {name:"Tessellation",seq:[0,1,2,2,2,2,0,0,1,1,0,1],target:0,par:4},
  {name:"Twist",seq:[2,2,0,0,0,1,0,2,1,0,2,2],target:1,par:4},
  {name:"Pinwheel",seq:[1,1,1,1,0,1,2,0,1,1,0,1],target:0,par:4},
  {name:"Kirigami",seq:[1,1,1,0,2,2,2,2,1,1,0,2],target:1,par:4},
  {name:"Mobius",seq:[2,2,2,2,2,0,2,2,2,0,2,0],target:2,par:4},
  {name:"Tangram",seq:[0,1,0,1,2,1,1,0,0,0,1,1],target:1,par:4},
];
if (typeof module !== 'undefined') module.exports = LEVELS;
