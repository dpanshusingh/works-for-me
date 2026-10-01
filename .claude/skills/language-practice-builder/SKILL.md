---
name: language-practice-builder
description: Build browser-based practice tools for learning a language, and plan the learning itself. Use this whenever someone is learning or wants to learn a language or writing system and needs something to practise with - a tracing or handwriting trainer for an unfamiliar script (Bangla, Devanagari, Greek, Arabic, Hangul, kana, Cyrillic, Georgian, Thai), a drill page for grammar or survival phrases, a vocabulary deck, or a staged plan with a deadline. Trigger it even when they do not ask for a tool by name - "help me learn X", "I want to nail X by December", "how do I practise writing X", "make me something to drill X", "what order should I learn X in" - and when they ask how hard a language will be for them given the languages they already speak.
---

# Language practice builder

Two jobs, usually both in one request: build something the learner can practise
with today, and lay out the path from today to their deadline. People ask for the
second and need the first. A plan nobody can act on this evening is worth less
than one working drill page.

## Start by taking stock of what they already speak

This is the single most useful thing you can do before giving any estimate or
plan, and it is cheap: ask, or read it out of the conversation. Every language a
person already has makes a specific part of the new one free, and naming which
part is what makes a plan feel true instead of generic.

What to look for:

- **Same family, same branch.** Hindi to Bangla, Spanish to Italian, Russian to
  Ukrainian. Shared syntax and a large shared vocabulary. The new language is
  mostly re-labelling what they can already say.
- **Same family, distant branch.** Hindi to Greek or Latin, both Indo-European.
  Cognates in the core vocabulary (three, mother, father) and a familiar feel to
  the grammar - cases and conjugations are not a new concept to someone with
  Sanskrit-derived vocabulary.
- **Same script or a cousin script.** Devanagari to Bangla, both Brahmic, so the
  matra line and the vowel-sign idea carry over. Latin to Greek: a new alphabet
  but the same alphabetic principle, which is a day's work, not a month's.
- **Shared borrowings.** Sanskrit vocabulary across South Asia, Arabic across
  Persian/Urdu/Turkish/Swahili, Chinese characters across Japanese and Korean.
- **A dialect or regional variety they speak.** Count it as a full language in
  their identity and a fraction of a language in their workload, and say both
  halves. People who grew up with one often undersell it.

Say out loud what transfers and what does not. The things that do not transfer
are where their study time actually goes, and that is the honest core of a plan.

**On timelines, be useful rather than flattering.** Someone saying "native-like by
December" usually means "able to live my day in this language", which is a real
and reachable target. Say that plainly: name the milestone the deadline can hold
(hold a fifteen-minute conversation, read a newspaper front page, write a
paragraph by hand), and treat "native-like" as the label for the years after it.
That is encouragement with a number attached, which lasts better than agreement.

## Building a script trainer

For any language whose script the learner cannot yet write, this is the first
tool and usually the whole of day one. `scripts/make_trainer.py` builds a
complete one from a JSON letter set:

```bash
python3 scripts/make_trainer.py references/letter-sets/bangla.json -o trainer.html
python3 scripts/make_trainer.py my-set.json -o trainer.html --artifact   # to publish
```

One self-contained HTML file. No build step, no server, works offline once the
webfont is cached, and the pointer events work with a finger or stylus on a
tablet, which is where handwriting practice actually happens.

What the generated page does, so you can describe it accurately and know what you
are not re-building: three modes (**Trace** over a ghost glyph, **Write** from a
model shown alongside, **Recall** with the glyph hidden behind a Peek button),
accuracy scoring on every attempt, per-letter progress saved in the browser, a
grid coloured by best score, and keyboard shortcuts. The scoring compares the
learner's ink to the font glyph and also asks which letter the drawing most
resembles, so a ক drawn as a ব is told it reads as ব rather than just scored low.
`references/how-scoring-works.md` explains the method and what to tune if scores
come out harsh or generous.

**Your real work is the letter set, not the engine.** Ship a trainer only when
every card teaches something: the letter's name in its own script, a
romanisation, a pronunciation note written for someone who speaks the languages
they already speak, a common example word with a gloss, and a writing hint for
letters people get wrong. `references/letter-set-schema.md` has the field list and
the rules that keep a set honest - cover the letters a learner meets in real text
including the awkward ones, and say where two letters sound identical in modern
speech rather than inventing a distinction. The Bangla and Greek sets are worked
examples of the level of detail to aim for.

Check a generated page in a browser before handing it over: confirm the webfont
loaded (a missing font silently produces boxes and the scoring then compares
against boxes) and that tracing a letter scores near 100.

## Planning the rest

Script first, then grammar with survival phrases, then vocabulary through real
material. `references/plan-method.md` has the method and a full worked plan.
Three things make the difference between a plan someone follows and one they
abandon:

- **Phrases from their actual life.** Someone who plays football wants the Bangla
  for "man on" and "behind you", not a chapter on sports vocabulary. Someone who
  shops in a market wants the bargaining script. Ask what their week looks like
  and write the lines they will say this week.
- **A ladder, not a list.** Order films and books by difficulty and say why each
  rung is where it is - children's detective films before art cinema because the
  diction is clean, nonsense verse before poetry because the rhythm carries you.
- **A daily loop they can do on a bad day.** Twenty minutes of drills, half an
  hour of listening, twenty minutes of speaking out loud. Plus one honest test
  per milestone, so progress is something they can check rather than feel.

Mention the obvious adjacent tools only when they are the thing being asked for:
a grammar drill page and a spaced-repetition vocabulary deck are the usual
follow-ons, and both are ordinary single-file HTML pages in the same style as the
trainer.
