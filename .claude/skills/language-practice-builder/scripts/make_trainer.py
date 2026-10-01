#!/usr/bin/env python3
"""Build a standalone handwriting trainer page from a letter-set JSON file.

    python3 scripts/make_trainer.py references/letter-sets/bangla.json -o bornomala.html
    python3 scripts/make_trainer.py my-set.json -o out.html --artifact

The output is one self-contained HTML file: no build step, no server, works
offline once the webfont is cached. --artifact strips the <!doctype>/<html>/
<head>/<body> wrappers so the file can be published with the Artifact tool,
which supplies its own skeleton.

Letter-set schema: see references/letter-set-schema.md
"""
import argparse, json, pathlib, re, sys

REQUIRED = ("title", "font_stack", "letters")
FIELDS = ("ch", "name", "r", "s", "w", "g", "h", "grp")


def validate(cfg, path):
    problems = []
    for k in REQUIRED:
        if not cfg.get(k):
            problems.append(f"missing required key: {k}")
    letters = cfg.get("letters") or []
    if not isinstance(letters, list):
        problems.append("'letters' must be a list")
        letters = []
    seen = {}
    for i, L in enumerate(letters):
        where = f"letters[{i}]"
        if not isinstance(L, dict):
            problems.append(f"{where}: must be an object"); continue
        ch = L.get("ch", "")
        if not ch:
            problems.append(f"{where}: 'ch' (the glyph) is required")
        elif ch in seen:
            problems.append(f"{where}: duplicate glyph {ch!r} (also at index {seen[ch]})")
        else:
            seen[ch] = i
        for k in ("name", "r", "grp"):
            if not L.get(k):
                problems.append(f"{where} ({ch}): '{k}' is empty — the card will look unfinished")
        for k in list(L):
            if k not in FIELDS:
                problems.append(f"{where} ({ch}): unknown field {k!r}; allowed: {', '.join(FIELDS)}")
    if problems:
        print(f"{path}: {len(problems)} problem(s)", file=sys.stderr)
        for p in problems:
            print("  - " + p, file=sys.stderr)
        sys.exit(1)
    return letters


def build(cfg, template):
    cfg.setdefault("heading", cfg["title"])
    cfg.setdefault("subtitle", "")
    cfg.setdefault("font_link", "")
    cfg.setdefault("speech_lang", "")
    cfg.setdefault("default_hint", "")
    cfg.setdefault("storage_key", re.sub(r"\W+", "-", cfg["title"].lower()).strip("-") + ".v1")
    html = template
    for key, val in (
        ("__TITLE__", cfg["title"]),
        ("__HEADING__", cfg["heading"]),
        ("__SUBTITLE__", cfg["subtitle"]),
        ("__FONT_LINK__", cfg["font_link"]),
        ("__FONT_STACK__", cfg["font_stack"]),
    ):
        html = html.replace(key, val)
    # </script> inside the JSON payload would close the tag early
    payload = json.dumps(cfg, ensure_ascii=False).replace("</", "<\\/")
    return html.replace("__CFG__", payload)


def strip_wrappers(html):
    html = re.sub(r"^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset=\"utf-8\">\s*"
                  r"<meta name=\"viewport\"[^>]*>\s*", "", html, flags=re.I)
    return html.replace("</head>\n<body>\n", "").replace("</body>\n</html>\n", "")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("letter_set", help="path to the letter-set JSON file")
    ap.add_argument("-o", "--out", required=True, help="output .html path")
    ap.add_argument("--artifact", action="store_true", help="strip document wrappers for the Artifact tool")
    args = ap.parse_args()

    here = pathlib.Path(__file__).resolve().parent.parent
    template = (here / "assets" / "trainer.html.tmpl").read_text(encoding="utf-8")
    cfg = json.loads(pathlib.Path(args.letter_set).read_text(encoding="utf-8"))
    letters = validate(cfg, args.letter_set)
    html = build(cfg, template)
    if args.artifact:
        html = strip_wrappers(html)
    pathlib.Path(args.out).write_text(html, encoding="utf-8")
    groups = []
    for L in letters:
        if L.get("grp") and L["grp"] not in groups:
            groups.append(L["grp"])
    print(f"wrote {args.out} — {len(letters)} letters in {len(groups)} group(s): {', '.join(groups)}")


if __name__ == "__main__":
    main()
