# Quire — a deep-reading app for macOS + Android

> *Working codename. `quire` = a gathering of folded pages. Rename freely; it appears as the Dart package name, the Android application ID (`dev.quire.app`), and the sync-folder marker file.*

## Context

We are building, from scratch, a personal reading application that implements the architecture described in the source essay: a system that **decouples content discovery from content consumption**, and renders long-form text in a way that matches human reading cognition rather than engagement metrics.

The essay names four operational tiers. This plan builds all four as one app:

| Tier | Essay's claim | What we build |
|---|---|---|
| Source syndication | Pull-based feeds neutralise algorithmic ranking | RSS/Atom/JSON Feed, Substack `/feed`, Reddit `.rss`, RSS-Bridge |
| Triage | Ephemeral feed must be separate from the permanent queue | Two-tier `Feed` → `Inbox / Later / Archive` |
| Media sanitisation | Strip retention loops from the source | Readability extraction, podcast transcripts, no recommendations anywhere |
| Physical rendering | **Bounded pagination preserves the spatial cognitive map; scrolling destroys it** | A real pagination engine, an ink design system for ordinary screens, and delivery to Kindle |

The last row is the load-bearing one. The essay's central empirical claim is that the comprehension deficit comes from *layout, not light*: continuous scrolling destabilises the spatial coordinates the brain uses to encode text. That claim holds on an OLED exactly as it does on e-paper. **An app that ships a scrolling `ListView` has not implemented this design.** Pagination is core engine work (M2), not a display preference.

### Decisions locked with the user

- **Client:** Flutter, single codebase. **macOS is the primary reading surface**; Android (tested on a Pixel 7a) is the companion.
- **Backend:** none. Local SQLite per device, synchronised through a user-controlled file-sync folder.
- **No e-ink hardware target.** The goal is the *feel* of ink on the screens the user already owns. No Onyx SDK, no refresh-mode tuning, no jailbreaking.
- **The Kindle is a delivery target, not an app target.** Amazon's Personal Documents Service (email to `@kindle.com`) is official and needs no jailbreak.
- **v1 scope:** syndication + reader core, ink design system, PKM export, podcast + AI assistant, Kindle delivery.
- **Alignment is decided from the page proof**, not in advance. Hyphenated justification costs real engine work in Flutter; we only pay it if the proof shows it is worth it.

### The no-server tension, and how it is resolved

"No server" and "podcast transcription" conflict: Whisper needs compute that a phone should not spend. Resolution: **the Mac is the worker node; the phone is a reading surface.** Transcription, heavy extraction, log compaction, and Kindle digest delivery run on macOS and land in the sync folder (or the outbox) from there. Android can transcribe via a cloud API key if the user wants it, but never by default. Feed freshness likewise depends on some device being awake: the Mac holds a menu-bar agent that polls continuously; Android polls opportunistically. The UI says this rather than hiding it.

---

## What "feels like ink" means

An emissive screen cannot become e-paper, but it can stop behaving like a feed. The ink design system rests on four properties, each of which the page proof makes adjustable:

1. **Reflected-light palette.** Paper is a light warm grey, never white; ink is a dark warm grey, never black. The default lands near 11:1 contrast, against 21:1 for black on white: roughly what printed text on real paper measures. Front light, warmth and ink darkness are modelled as an e-reader's controls, computed in OKLCH so every setting stays hue-consistent. Night mode is dim ink on a dark ground, not white on black.
2. **Discrete page turns.** A page is a fixed topography that changes state instantly. No slide, curl or scroll. An optional e-ink turn swaps pages with no motion and, every N pages, flashes the page dark then blank the way a real panel clears ghosting. An optional ghost of the previous page can sit under the new one. Both are stylistic and both respect reduced-motion settings.
3. **Stillness.** Nothing moves unless the reader turns a page. No ripples, springs, spinners, badges or counters anywhere in the reading view. When a page is static the app renders zero frames.
4. **Nothing but the page.** Header and folio are the only chrome, and a tap on the top edge hides them. The folio shows page N of M, a hairline progress rule, and minutes left: the spatial-map affordances, nothing more.

Paper grain (a faint noise texture, multiply in day and screen at night) sells the material at 2–4% opacity and is also adjustable.

---

## Architecture

Melos monorepo. Pure-Dart packages hold everything testable; the Flutter app holds only UI and platform channels.

```
apps/quire/                 Flutter app (macos/ + android/ runners)
packages/core_model/        Entities, HLC clock, op types — no I/O
packages/core_db/           drift (SQLite) schema, DAOs, migrations
packages/sync_engine/       Op-log fold, transports, compaction, blob store
packages/ingest/            Feed parsing, URL canonicalisation, extraction, EPUB/PDF
packages/reader_engine/     Pagination, typography, hyphenation, highlight anchoring
packages/ink_theme/         Ink tokens, light model, motion policy
packages/audio/             Podcast playback, transcript cue sync, transcription providers
packages/ai/                Anthropic client, prompts, caching
packages/pkm_export/        Markdown/Obsidian writer, Kindle clippings import
packages/kindle/            EPUB digest builder, SMTP delivery
prototypes/page-proof/      HTML page proof: the source of the ink tokens
```

### Sync: append-only op logs over a shared folder

No CRDT library and no merge conflicts, because **no device ever writes a file another device writes.**

```
<syncRoot>/
  quire.json                              format version + app marker
  ops/<deviceId>/<epochMs>-<seq>.jsonl    append-only, rotated at ~1 MB
  snapshots/<hlc>.msgpack.zst             periodic compaction (macOS only)
  blobs/<sha[0:2]>/<sha256>               immutable: article HTML, EPUB, audio, transcripts
  locks/compaction.lock                   advisory, holder + heartbeat
```

- Every mutation is an op: `{hlc, deviceId, entity, id, field, value}`. Each device appends only to `ops/<its own id>/`.
- Fold = read all peers' logs past `lastAppliedSeq`, apply into local SQLite, record the new watermark. Idempotent, so a partial sync is always safe to replay.
- Conflict rules, per field type: scalars **LWW by HLC**; tags/collections **OR-Set** (add and remove both carry an HLC, remove only kills the adds it saw); deletes are **tombstones**, never row removal. Reading position is LWW *plus* a separate monotonic `furthest_read` watermark, so re-reading on the phone never destroys the Mac's progress marker.
- Blobs are content-addressed and immutable — a write is a create, so it can never conflict. Refcounted from `documents`; swept only by the compactor.
- Compaction (macOS, holding the lock): fold everything into a snapshot, then truncate ops the snapshot subsumes.

**Transport is an interface (`SyncTransport`)**, with two implementations in v1:

- `LocalDirTransport` — a plain filesystem path. **Recommend Syncthing** as the mover: it is the only common option that gives Android a genuine local folder and handles many small files well.
- `SafTransport` — Android Storage Access Framework tree URI, for folders backed by a DocumentsProvider. Works, but slow with many small files, which is why ops are batched into rotated files.

Dropbox / Google Drive / WebDAV adapters drop in behind the same interface later. Google Drive on Android does not expose a real folder — do not plan around it.

### Data model (drift)

`feeds` (url, kind, folder, etag, last_modified, last_polled_at, failure_count) · `documents` (canonical_url, title, author, published_at, kind `article|epub|pdf|podcast`, state `feed|inbox|later|archive`, word_count, progress, furthest_read, content_blob) · `highlights` (document_id, quote, prefix, suffix, char_start, char_end, note, colour, source `quire|kindle`) · `tags` + `document_tags` · `podcast_episodes` (audio_blob, duration_ms, transcript_blob) · `transcript_cues` (start_ms, end_ms, char_start, char_end) · `kindle_deliveries` (sent_at, document_ids, message_id) · `outbox` (unsynced ops) · `sync_peers` (device_id, last_applied_seq).

---

## Milestones

### M0 — Foundations and the ink proof

Scaffold melos, drift schema, HLC, `SyncTransport`, blob store, and CI (`flutter analyze`, `dart test`, Android build).

**Page proof (done).** `prototypes/page-proof/index.html` is a paginated reading surface in the browser with live controls for light, type, alignment and page turns, set in the source essay. It exports its settings as Dart and JSON tokens. Its job is to settle the look *before* any Flutter code depends on it, including the alignment decision: it shows ragged, justified, and hyphenated text side by side at the reader's own settings.

**Flutter ink spike (next).** A throwaway Flutter app that ports the exported tokens and answers four questions, each with a pass bar set in advance:

| Question | Pass |
|---|---|
| Do the tokens survive the port? Same paper, ink, face, size and leading, rendered by Flutter instead of a browser | Side by side at reading distance, the Flutter page is indistinguishable from the proof, or preferred |
| Can Flutter hyphenate cheaply? Insert soft hyphens (U+00AD) using TeX's Knuth–Liang en-US patterns in Dart, then justify with `TextPainter` | Lines break at soft hyphens **and** a visible hyphen is drawn at each break. If the glyph is missing, M2 builds its own line breaker (about a week) |
| Does `TextPainter` pagination hold? Pages end on whole lines, and a size change re-lands on the same sentence | Zero clipped lines across the whole essay at three sizes; the anchor sentence stays on screen after each change |
| Is the reading view still? | Zero frames rendered while a page is static, counted with `SchedulerBinding.addTimingsCallback` in a debug overlay |

Builds: the Android APK is built in the cloud container and sideloaded to the Pixel 7a. **The macOS build has to happen on the Mac**, because Flutter cannot build macOS apps from Linux; it needs Xcode. The spike ships with a one-page setup note for that.

The hyphenation result gates M2's scope, so the spike is reported back before M1 begins.

### M1 — Syndication and triage

- Feed fetching with conditional GET (ETag / `If-Modified-Since`), exponential backoff on failure, per-feed folders.
- Add-feed UX that does the essay's URL tricks for the user: paste a Substack URL → offer `/feed`; paste a subreddit → offer `old.reddit.com/r/x/.rss`; plus a configurable RSS-Bridge base URL. Autodiscovery via `<link rel=alternate>` first.
- Extraction: prefer `content:encoded` when the feed carries full text; otherwise headless-WebView Readability (`flutter_inappwebview` on both platforms); pure-Dart heuristic fallback. Output normalised to a **block list** (paragraph, heading, image, quote, code, list, rule), *not* HTML. Every downstream consumer (reader, export, AI, Kindle EPUB) reads blocks.
- Save-from-elsewhere: Android share-sheet intent filter; macOS URL scheme (`quire://save?url=`) + a bookmarklet; drag-drop of EPUB/PDF/Markdown onto the Mac window.
- Triage UI: the `Feed` tier is explicitly ephemeral and dismissible; promoting an item is a deliberate act that moves it to `Inbox`. Keyboard-driven on macOS. No unread counts.
- Background refresh: macOS menu-bar agent with a poll timer (optional LaunchAgent for login start); Android `workmanager` periodic (15-min floor) plus refresh-on-open.

### M2 — The reader (the core engineering)

**Pagination engine** in `reader_engine`, pure Dart in the layout math:

1. Blocks → per-block `TextPainter` layout at a fixed content width → line boxes with exact heights.
2. Greedy packing of line boxes into fixed-height pages, with widow/orphan control and atomic blocks (an image or code block that cannot split moves whole). Page height is a whole number of lines, as in the proof.
3. Page-break cache keyed by `(docId, width, height, fontSize, family, weight, lineHeight, align)`. Repagination on a font change is a background isolate job, not a UI stall.
4. Hyphenation, if the proof chose it: soft-hyphen insertion if the spike passed, otherwise a custom Knuth–Liang line breaker that emits line boxes directly.

**Highlight anchoring must survive repagination.** Anchor to `(char_start, char_end)` in the normalised plain text plus a `quote/prefix/suffix` fingerprint (W3C Annotation style). Never anchor to page number or DOM node — a font-size change would silently move every highlight. The proof already demonstrates the reading-position half of this: change the size and it stays on the same sentence.

### M3 — Ink design system

`ink_theme` turns the exported tokens into the app's look and enforces the four properties above.

- **Light model.** Port the proof's OKLCH `palette()` to Dart so front light, warmth and ink darkness are live controls, not fixed colours. Day and night both derive from it.
- **Motion policy.** A no-op `PageTransitionsBuilder`, `NoSplash`, zero implicit-animation durations, page-snap physics wherever a list would otherwise scroll. The only permitted motion is the page-turn style the reader chose. `MediaQuery.disableAnimations` (reduced motion) suppresses the flash.
- **Page turns.** Instant, e-ink (flash every N pages, optional ghost), or fade, with the timings from the proof (120 ms dark, 80 ms paper; 80 ms fade).
- **Grain.** A tiled noise texture drawn once inside a `RepaintBoundary` at token opacity, so it costs nothing per frame.
- **macOS.** Full-size content view with a hidden, transparent title bar in reading mode; native fullscreen; a trackpad swipe turns exactly one page (the proof's momentum lock); keyboard map identical to the proof.
- **Android.** Immersive sticky mode while reading (status and navigation bars hidden), screen kept on while a page is open, optional volume-key page turns.
- **Input.** Left third of the page goes back, the rest goes forward, the top edge toggles header and folio. Same on both platforms.

### M4 — PKM export

- One Markdown file per document into a target folder (an Obsidian vault, or a git repo) with YAML front-matter (title, author, url, tags, dates) and highlights as blockquotes with notes and stable IDs.
- **Incremental and non-destructive**: an export ledger tracks what has been exported; re-export updates the highlight block in place and never clobbers text the user added in the vault.
- Optional commit + push when the target is a git repo. macOS gets an "export on change" toggle; Android exports on demand.

### M5 — Podcast + synced transcript

- Podcast RSS (`enclosure`, iTunes namespace), episode download to the blob store, `just_audio` playback with speed control, position synced as an op.
- `TranscriptionProvider` interface: `LocalWhisperProvider` (**macOS only**, whisper.cpp dylib over `dart:ffi` in a background isolate, Metal-accelerated, `small.en` default), `CloudProvider` (user-supplied key, both platforms, off by default, cost shown before use), `NoneProvider`.
- Transcript + cues become a blob, so the phone gets the Mac's work for free.
- The transcript reads as **paginated ink pages**, with the active cue marked; tap a paragraph to seek; highlighting saves a timestamped quote that exports through M4.

### M6 — AI reading assistant

- Anthropic Messages API called directly from the client; key in macOS Keychain / Android Keystore, never in the sync folder.
- In-reader panel over the *current document only*: ask a question, define a selected term, generate the strongest counter-argument, or produce a critical breakdown (thesis, evidence quality, what the author omits). The essay's own distinction between summarisation and synthesis is the spec: do not ship a "summarise this" button alone.
- **Prompt caching is essential**: documents are long and readers ask several questions of the same one. Cache the document block; only the question varies.
- Streaming responses; every answer is anchored to the passage that prompted it and is savable as a note. The panel uses the ink palette and motion policy like everything else.
- **When implementing this milestone, load the `claude-api` skill first** for current model IDs, pricing, caching semantics, and SDK usage.

### M7 — Kindle delivery

The essay's Personal Documents pipeline, run from the Mac. No jailbreak, no Amazon API.

- **Setup screen** that walks through Amazon's side: add the sending address to *Manage Your Content and Devices → Preferences → Personal Document Settings → Approved Personal Document E-mail List*, then enter the Kindle's `@kindle.com` address.
- **Digest builder.** The `Later` queue (or any tag) becomes one EPUB 3 built from the block list: an article per chapter, a navigable table of contents, images downscaled and converted to greyscale. EPUB is the format Amazon's service accepts now; MOBI is retired.
- **Delivery** over SMTP with the user's own mail account (an app-specific password, stored in Keychain), on a daily or weekly schedule from the Mac's menu-bar agent, plus a one-off *Send to Kindle* per article. Digests that would exceed Amazon's per-email attachment limit are split.
- **Highlights come back.** Drag the Kindle's `My Clippings.txt` onto the app. Clippings are parsed, matched to documents by title and quote, anchored with the M2 fuzzy-quote matcher, and exported through M4 like any other highlight.

### M8 — Hardening and packaging

Compaction + blob GC; a two-device conflict test suite; pagination performance profiling on the Pixel 7a (the slower device sets the budget); macOS `.app` (signed + notarised if it leaves this machine) and a release APK. `README.md` documents the Syncthing and Kindle setup, the two parts the user configures outside the app.

---

## Deliberately out of scope for v1

E-ink hardware tuning (Onyx SDK, refresh modes, per-app DPI) and Kindle jailbreaking: the user has neither need. Video sanitisation (the Unhook / Nebula tier) is a browser extension, not this app. Also out: multi-user anything, iOS, and any recommendation, trending, streak, or XP mechanic. The last one is a permanent constraint, not a v1 cut — gamification is the failure mode the essay is diagnosing.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Flutter has no hyphenation** | Page proof decides whether it matters. If it does, the spike tests soft-hyphen insertion first; the fallback is a custom line breaker, scoped into M2 |
| Ink tokens look different in Flutter than in the browser (font rasterisation, weight rendering) | Spike compares side by side before M3 is built on them |
| Android has no real folder for Drive/Dropbox | Syncthing is the recommended and documented path; SAF as fallback; transport is an interface |
| SAF is slow with many small files | Ops batched into rotated ~1 MB files; peers read only past the watermark |
| Extraction breaks on paywalled / JS-heavy sites | Prefer feed full-text; headless WebView second; per-site overrides; an explicit failure state rather than a silently empty article |
| Feed freshness depends on a device being awake | Mac menu-bar agent polls continuously; stated plainly in the UI |
| Kindle email delivery fails silently (sender not approved, size cap) | Setup screen sends a test document first; every delivery is logged with its message ID; digests split under the cap |
| Local Whisper is slow | macOS-only, background isolate, `small.en` default, opt-in cloud provider |

---

## Verification

**Automated**
- `reader_engine`: page breaks are deterministic and line boxes are conserved across pagination; highlight anchors resolve to identical text after a font-size change forces repagination; hyphenated and non-hyphenated layouts both clip nothing.
- `ink_theme`: the Dart port of `palette()` produces the same hex values as the page proof for a grid of slider settings (golden table exported from the proof).
- `sync_engine`: two in-memory DBs over one temp dir converge under interleaved ops, offline-then-rejoin, tombstone-vs-edit races and OR-Set races; fold is idempotent when a log is replayed twice.
- `ingest`: fixture-based parser tests (Substack, Reddit `.rss`, Atom, JSON Feed, malformed XML) and canonicalisation tests.
- `pkm_export` and `kindle`: golden-file Markdown and EPUB; re-export preserves user-added vault text; a real `My Clippings.txt` fixture parses and anchors.
- CI runs `flutter analyze`, `dart test`, and the Android build on every push.

**Manual, end-to-end** — the acceptance run before calling v1 done:
1. On the Mac, add a Substack URL, confirm `/feed` is offered, poll, extract, promote from Feed to Inbox, read paginated, highlight.
2. Point the Pixel 7a at the same sync folder; confirm the document, its position, and the highlight arrive. Highlight on the phone; confirm it lands back on the Mac and then in the Obsidian vault.
3. Ink checks on both devices: debug overlay shows zero frames on a static page; with reduced motion on, the e-ink flash never fires; night mode reads as dim ink, not white on black; a 30-page read feels like turning pages, not scrolling.
4. Queue three articles in `Later`, send the digest, confirm it arrives on the Kindle with a working table of contents. Highlight a passage there, import `My Clippings.txt`, confirm it lands on the right sentence and exports.
5. Subscribe to a podcast, transcribe on the Mac, confirm the phone plays with the synced transcript.
6. Ask the AI panel two questions about one document; confirm the second is served from cache.
7. Force-quit during a sync fold and reopen; confirm no corruption and a clean replay.

---

## Working agreement

Branch `not-yet`. Each milestone is a commit series with its tests green before moving on. The Flutter ink spike is throwaway code, reported back before M1 begins, since its hyphenation result sets M2's scope.
