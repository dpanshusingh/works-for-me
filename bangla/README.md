# Bangla practice

`index.html` — the Bornomala letter trainer. Open it in a browser; no build step.

It is generated, not hand-maintained. Edit the letter data in
`../.claude/skills/language-practice-builder/references/letter-sets/bangla.json`
and rebuild:

```bash
python3 ../.claude/skills/language-practice-builder/scripts/make_trainer.py \
  ../.claude/skills/language-practice-builder/references/letter-sets/bangla.json \
  -o index.html
```

Add `--artifact` to produce a copy for publishing with the Artifact tool.
The learning plan it belongs to is in `../docs/BANGLA_PLAN.md`.
