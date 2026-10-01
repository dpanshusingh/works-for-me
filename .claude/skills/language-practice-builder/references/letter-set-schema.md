# Letter-set schema

A letter set is one JSON file describing a writing system. `scripts/make_trainer.py`
validates it and fails with a list of problems rather than producing a broken page.

## Top level

| Key | Required | What it is |
|---|---|---|
| `title` | yes | Page title and gallery name. A real name, not "Bangla Trainer" — `Bornomala`, `Alphabetos`. |
| `heading` | no | Masthead in the target script. Defaults to `title`. |
| `subtitle` | no | One line next to the masthead, e.g. `Bornomala · Bangla letter trainer`. |
| `font_link` | no | Google Fonts stylesheet URL. The only font host an Artifact may load from. |
| `font_stack` | yes | CSS font stack, webfont first, then OS fonts that ship with the script, then a generic. The OS fallbacks matter: they are what makes the page work offline. |
| `speech_lang` | no | BCP-47 tag for the Hear-it button (`bn-IN`, `el-GR`). Omit when no voice is likely. |
| `storage_key` | no | localStorage key. Defaults from the title. Give two trainers different keys or they overwrite each other's progress. |
| `default_hint` | no | Writing hint used for letters with no `h` of their own. The place for a rule that applies to the whole script. |
| `letters` | yes | The cards, in teaching order. |

## Each letter

| Field | Required | What it is |
|---|---|---|
| `ch` | yes | The glyph itself. One per set — duplicates are rejected. |
| `name` | yes | The letter's name in its own script (`অ`, `βῆτα`). |
| `r` | yes | Romanisation (`ô`, `beta`). |
| `s` | no | Pronunciation note in plain words, anchored to a language the learner speaks. |
| `w` | no | A common example word in the target script. |
| `g` | no | Gloss: romanisation then meaning (`ôjôgôr · python (snake)`). |
| `h` | no | Writing hint: stroke order, or how this letter differs from the one it is confused with. |
| `grp` | yes | Section heading in the grid, in the script's own terms (`স্বরবর্ণ · Vowels`). Order of first appearance sets section order. |

## What makes a set good

**Cover what a learner meets in real text**, not the tidy classroom list. Bangla
without ড় ঢ় য় ৎ ং ঃ ঁ leaves someone unable to read a street sign. Greek without
lowercase is useless for reading anything.

**Write the pronunciation note for this learner.** "Retroflex d" means nothing to
most people and everything to someone who speaks Hindi, where you can say "the ड
sound". Aim at the languages they already have.

**Say where distinctions have collapsed.** Bangla ন and ণ are one sound in modern
speech; শ ষ স are mostly one. Teaching three separate sounds there is teaching
something false. Note it in `s` and let the hint say which spelling goes where.

**Put the confusable pairs in the hints.** গ against ণ, য against ষ, Greek Ο
against ο. The trainer's recognition pass will call these out at check time, and
a hint at the top of the card is what stops the mistake in the first place.

**Order for teaching, not for Unicode.** Traditional order is usually right since
it groups letters by articulation, which is also how handwriting groups them.

## A caveat worth knowing

The recognition pass compares shapes only. Letters that genuinely look alike at a
glance (Greek Ο and ο, Latin l and I) will sometimes be reported as each other.
That is honest feedback about the drawing rather than a bug, but if two cards in a
set are near-identical shapes, say so in their hints.
