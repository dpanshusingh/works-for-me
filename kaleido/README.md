# Kaleido

A puzzle where you control two bodies with one set of keys.

Move your gold dot onto the gold ring while your violet shadow lands on the violet ring.
The shadow copies every move you make, until it steps on a tile that rewires its controls:
◧ flips left/right, ◨ flips up/down, ↻ rotates its controls 90°. The rewiring stacks, and a wall that blocks the shadow just leaves it in place.

Open `index.html`. Arrow keys / WASD to move, Z undo, R reset, swipe on touch.
All 10 levels are verified solvable by `engine.js`'s BFS solver (`par` = shortest solution).
