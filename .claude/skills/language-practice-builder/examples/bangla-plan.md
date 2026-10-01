# Bangla by December — plan for all four parts

Goal as stated: script by end of September 2026, then grammar and street/pitch talk,
then vocabulary through film and literature, and feel native-like by December 2026.

Honest calibration up front: with Hindi already native, Bangla is one of the cheapest
languages you can add. The grammar is SOV like Hindi, the script is a Brahmic cousin of
Devanagari, and a large slab of the vocabulary is shared Sanskrit-derived tatsama words.
Three and a half months of daily work gets you to comfortable conversation and reading
of ordinary prose. "Native-like" is a multi-year label, and that is fine: the December
milestone is "I can live my day in Bangla", and the years after are the polish.

---

## Part 1 — Script (today). Shipped: `bangla/index.html`

A single-file, offline-capable trainer. Open it in any browser, no build step.

- 11 vowels, 39 consonants and specials (including ড় ঢ় য় ৎ ং ঃ ঁ), 10 digits.
- Three modes: **Trace** (ghost letter under your pen), **Write** (model shown on the
  side, blank pad), **Recall** (only the name and sound are shown; the letter is hidden).
- Accuracy check: your ink is rasterised and compared to the font glyph. Two numbers are
  combined into the score: how much of the model you covered (missing parts) and how much
  of your ink lies on the model (stray strokes). In Write and Recall the drawing is
  size- and position-normalised first, and it is also matched against every other letter;
  if it reads as a different letter you are told which one and the score is capped.
- Each letter has its Bangla name, romanisation, pronunciation note, an example word,
  and a writing hint. "Hear it" uses the browser's Bangla voice if one is installed.
- Progress is saved per browser per mode; the grid at the bottom colours each letter by
  your best score.

Stretch for Part 1 (only if the day allows): vowel signs (কার: া ি ী ু ূ ৃ ে ৈ ো ৌ)
attached to a consonant, and the 20 most common conjuncts (ক্ষ জ্ঞ ন্ত স্ত ক্ত ...).
Stroke-order animation needs per-letter path data and is deliberately not faked.

Reading practice today: after tracing, read the example words aloud, then the digits
0–99, then any Bangla signage/menus you can find in photos.

## Part 2 — Grammar and survival talk (tomorrow)

Build: `bangla/grammar.html`, same single-file style, with drill cards and a
sentence-builder that checks answers.

1. Core grammar, mapped onto Hindi so nothing is learnt from scratch:
   - No grammatical gender (a relief after Hindi).
   - Case suffixes instead of postpositions: -কে (ko), -র/-এর (ka), -তে/-এ (mein).
   - Verb conjugation by person and formality only, not by gender: আমি করি, তুমি করো,
     আপনি করেন, সে করে. Three "you" levels: তুই / তুমি / আপনি.
   - Tenses: present, present continuous (-ছি), past (-লাম), perfect (-এছি),
     future (-বো). Negation with না after the verb, and the special নি for perfect.
   - Classifiers: টা / টি / খানা / জন (এক**টা** বই, দুই**জন** লোক).
2. Bargaining set: দাম কত? / এত দাম কেন? / একটু কম করুন / শেষ দাম বলুন / থাক, লাগবে না.
3. Directions: সোজা যান / বাঁ দিকে / ডান দিকে / সামনে / পিছনে / কত দূর? / কাছেই.
4. Football pitch (informal তুমি/তুই register, what you actually shout):
   পাস দে! (pass!) / থ্রু বল দে / পেছনে দে (toss it behind me) / তোর পেছনে! (behind you!)
   / ম্যান অন! / সময় আছে (you have time) / এক টাচ / ওপরে যা / নিচে নাম / শট মার / ধর!
   / অফসাইড / কর্নার / আমার (mine!) / ছেড়ে দে (leave it).

## Part 3 — Vocabulary, film, literature (from day 3, ongoing)

Build: `bangla/vocab.html`, a spaced-repetition deck (SM-2 style intervals) seeded with
the 1,000 highest-frequency words, plus a sentence-mining view where you paste a line
from a film subtitle or a book and it becomes cards.

Film ladder, easiest listening first:
- Satyajit Ray: *Sonar Kella*, *Joy Baba Felunath* (children's detective films, clean
  diction), then *Pather Panchali* and the Apu trilogy, *Charulata*, *Nayak*.
- Ritwik Ghatak: *Meghe Dhaka Tara* (harder, dense dialogue).
- Modern Dhaka Bangla for ear training: *Hawa* (2022), *Aynabaji* (2016), and web series
  for street register.

Literature ladder:
- Sukumar Ray, *Abol Tabol* (nonsense verse: rhythm and script fluency).
- Tagore short stories (*Kabuliwala*, *Postmaster*) with a parallel translation.
- Sharadindu's Byomkesh stories, Satyajit Ray's Feluda stories (page-turners).
- Bibhutibhushan *Pather Panchali*, Manik Bandyopadhyay *Padma Nadir Majhi*.
- Tagore *Gitanjali* in the original last; the vocabulary is Sanskritic and dense.

## Part 4 — Native-feel by December (the daily loop)

- 20 min script/vocab drills, 30 min listening (film, podcast, news at natural speed),
  20 min speaking: shadowing a scene, then a voice note to a Bangla-speaking friend.
- Switch inner monologue for one activity a day to Bangla (you said this has begun).
- Weekly: one page of handwriting, one film, one short story, one real conversation
  with a shopkeeper or a teammate.
- December check: hold a 15-minute conversation about your week, read a newspaper
  front page, write a paragraph by hand. That is the milestone that earns
  "বাংলাভাষী" for life.
