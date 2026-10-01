# How the accuracy check works

The problem: judge a handwritten letter without stroke-order data, which does not
exist for most scripts and cannot be honestly faked. The approach is to compare
the shape the learner drew against the shape the font draws, and to report *how*
it differs rather than just how much.

## The pipeline

1. **Template.** At load, each glyph is rendered large into an offscreen canvas,
   its bounding box found, and the box scaled into a 128×128 grid with a fixed
   margin. Pixels above an alpha threshold become a 1-bit mask. This happens after
   `document.fonts.ready`, because measuring before the webfont lands silently
   compares the learner against a fallback box glyph.
2. **The learner's ink** goes through the same pipeline. In Trace mode it is read
   in place, since the whole point is staying on the guide. In Write and Recall it
   is normalised to its own bounding box first, so a small or off-centre letter is
   judged on shape rather than placement.
3. **Two numbers, not one.** Each mask is dilated by a few pixels to give an
   honest tolerance for hand wobble.
   - *Coverage*: how much of the model's mask the learner's dilated ink reaches.
     Low means part of the letter is missing.
   - *Precision*: how much of the learner's ink lands on the dilated model. Low
     means strokes wandering off the letter.
   The score is their harmonic mean, so you cannot win by scribbling over
   everything (precision collapses) or by drawing one perfect stroke of a
   many-stroke letter (coverage collapses). The two numbers are also what the
   feedback sentence is built from, which is why the page can say *what* is wrong.
4. **Recognition.** Outside Trace mode the drawing is scored against every letter
   in the set. If another letter scores higher, that is reported by name and the
   score is capped, because a confident, well-drawn wrong letter is a worse
   outcome than a shaky right one and should never read as 86%.

## Tuning

Three constants near the top of the script:

- `N` (128) — grid resolution. Higher is stricter and slower.
- `MARGIN` (12) — padding inside the normalised box.
- `DIL` (3) — dilation radius, the real tolerance knob. Raising it forgives wobble
  and makes everything score higher; lowering it is harsh on beginners. 3 was
  chosen by checking that a correct letter still scores 100 while a different
  letter drawn cleanly scores around 55.

The thresholds for the verdict colours (85 and 65) are in `check()`.

## What it does not do

It cannot see stroke order or direction, so a letter drawn backwards or in the
wrong sequence scores fine. That is a real limitation: handwriting habits form
early and bad stroke order is hard to unlearn. Hints on the cards are what carry
stroke order, which is why they are worth writing properly. Adding real stroke
checking means per-letter path data, and inventing that data rather than sourcing
it would make the feedback confidently wrong.
