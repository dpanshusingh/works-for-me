# Quire — a deep-reading system for macOS + Android

> *Working codename. `quire` = a gathering of folded pages. Rename freely; it appears as the Dart package name, the Android application ID (`dev.quire.app`), and the sync-folder marker file.*

## Context

`dpanshusingh/works-for-me` is empty (README only). We are building, from scratch, a personal reading application that implements the architecture described in the source essay: a system that **decouples content discovery from content consumption**, and renders long-form text in a way that matches human reading cognition rather than engagement metrics.

The essay names four operational tiers. This plan builds all four as one app:

| Tier | Essay's claim | What we build |
|---|---|---|
| Source syndication | Pull-based feeds neutralise algorithmic ranking | RSS/Atom/JSON Feed, Substack `/feed`, Reddit `.rss`, RSS-Bridge |
| Triage | Ephemeral feed must be separate from the permanent queue | Two-tier `Feed` → `Inbox / Later / Archive` |
| Media sanitisation | Strip retention loops from the source | Readability extraction, podcast transcripts, no recommendations anywhere |
| Physical rendering | **Bounded pagination preserves the spatial cognitive map; scrolling destroys it** | A real pagination engine + an e-ink build for Onyx Boox |

The last row is the load-bearing one. The essay's central empirical claim is that the comprehension deficit comes from *layout, not light* — continuous scrolling destabilises the spatial coordinates the brain uses to encode text. **An app that ships a scrolling `ListView` has not implemented this design.** Pagination is therefore treated as core engine work (M2), not as a display preference.

### Decisions locked with the user

- **Client:** Flutter, single codebase, macOS + Android.
- **Backend:** none. Local SQLite per device, synchronised through a user-controlled file-sync folder.
- **v1 scope:** all four pillars — syndication + reader core, e-ink/Boox tuning, PKM export, podcast + AI assistant.

### The one tension in those choices, and how it is resolved

"No server" and "podcast transcription" conflict: Whisper needs compute that a phone should not spend. Resolution — **the Mac is the worker node, the phone is the reading surface.** Transcription, heavy extraction, and log compaction run on macOS and land in the sync folder as immutable blobs; Android consumes the results. Android can still transcribe via a cloud API key if the user wants it, but never by default. Similarly, feed freshness depends on some device being awake — the Mac holds a menu-bar agent that polls continuously; Android polls opportunistically. This is stated in the UI, not hidden.

---

## Architecture

Melos monorepo. Pure-Dart packages hold everything testable; the Flutter app holds only UI and platform channels.

```
apps/quire/                 Flutter app (macos/ + android/ runners)
packages/core_model/        Entities, HLC clock, op types — no I/O
packages/core_db/           drift (SQLite) schema, DAOs, migrations
packages/sync_engine/       Op-log fold, transports, compaction, blob store
packages/ingest/            Feed parsing, URL canonicalisation, extraction, EPUB/PDF
packages/reader_engine/     Pagination, typography, highlight anchoring
packages/audio/             Podcast playback, transcript cue sync, transcription providers
packages/ai/                Anthropic client, prompts, caching
packages/pkm_export/        Markdown/Obsidian writer
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
- Compaction (macOS, holding the lock): fold everything into a snapshot, then truncate ops the snapshot subsumes. A device that has been offline for months reads the snapshot plus the remaining tail.

**Transport is an interface (`SyncTransport`), not a hardcoded path**, with two implementations in v1:

- `LocalDirTransport` — a plain filesystem path. On macOS this is any folder; on Android it is a real directory. **Recommend Syncthing** as the mover: it is the only common option that gives Android a genuine local folder, handles many small files well, and works on a Boox.
- `SafTransport` — Android Storage Access Framework tree URI, for folders backed by a DocumentsProvider. Works, but slow with many small files, which is exactly why ops are batched into rotated files rather than one file per op.

Dropbox / Google Drive / WebDAV adapters drop in behind the same interface later. Google Drive on Android does not expose a real folder — do not plan around it.

### Data model (drift)

`feeds` (url, kind, folder, etag, last_modified, last_polled_at, failure_count) · `documents` (canonical_url, title, author, published_at, kind `article|epub|pdf|podcast`, state `feed|inbox|later|archive`, word_count, progress, furthest_read, content_blob) · `highlights` (document_id, quote, prefix, suffix, char_start, char_end, note, colour) · `tags` + `document_tags` · `podcast_episodes` (audio_blob, duration_ms, transcript_blob) · `transcript_cues` (start_ms, end_ms, char_start, char_end) · `outbox` (unsynced ops) · `sync_peers` (device_id, last_applied_seq).

---

## Milestones

### M0 — Foundations, and the two spikes that de-risk everything

Scaffold melos, drift schema, HLC, `SyncTransport`, blob store, and CI (`flutter analyze`, `dart test`, both platform builds).

**Before building further, run two spikes.** Both target assumptions that would invalidate large parts of the plan if wrong:

1. **E-ink spike (highest risk).** ~200 lines: a Flutter page of static text, instant page swap on volume key, no animations. Sideload to the Boox. Measure ghosting and page-turn latency against the device's native reader. Flutter repaints its whole surface per frame, which is the classic e-ink failure mode. If mitigations (static frames, `RepaintBoundary`, forced full refresh every N turns, per-app Boox refresh settings) do not get it to acceptable, the fallback is a thin native-Android reader activity over the same shared core — decide this in M0, not in M3.
2. **Extraction spike.** Run Readability.js inside a headless `flutter_inappwebview` on both platforms against ~20 real URLs (Substack, a news site, a JS-heavy SPA, a PDF link). Confirms the no-server extraction path works before M1 depends on it.

### M1 — Syndication and triage

- Feed fetching with conditional GET (ETag / `If-Modified-Since`), exponential backoff on failure, per-feed folders.
- Add-feed UX that does the essay's URL tricks for the user: paste a Substack URL → offer `/feed`; paste a subreddit → offer `old.reddit.com/r/x/.rss`; plus a configurable RSS-Bridge base URL. Autodiscovery via `<link rel=alternate>` first.
- Extraction: prefer `content:encoded` when the feed carries full text (free, instant); otherwise headless-WebView Readability; pure-Dart heuristic fallback. Output normalised to a **block list** (paragraph, heading, image, quote, code, list, rule) — *not* HTML. Every downstream consumer (reader, export, AI, EPUB digest) reads blocks.
- Save-from-elsewhere: Android share-sheet intent filter; macOS URL scheme (`quire://save?url=`) + a bookmarklet; clipboard watcher; drag-drop of EPUB/PDF/Markdown onto the Mac window.
- Triage UI: the `Feed` tier is explicitly ephemeral and swipe-dismissible; promoting an item is a deliberate act that moves it to `Inbox`. Keyboard-driven on macOS.
- Background refresh: macOS menu-bar agent with a poll timer (optional LaunchAgent for login start); Android `workmanager` periodic (15-min floor) plus refresh-on-open.

### M2 — The reader (the core engineering)

**Pagination engine** in `reader_engine`, pure Dart, no Flutter widget dependency in the layout math:

1. Blocks → per-block `TextPainter` layout at a fixed content width → line boxes with exact heights.
2. Greedy packing of line boxes into fixed-height pages, with widow/orphan control and atomic blocks (an image or code block that cannot split moves whole).
3. Page-break cache keyed by `(docId, width, height, fontSize, family, lineHeight)`. Repagination on a font change is a background isolate job, not a UI stall.
4. Page turn is an **instant frame swap** — no slide, no curl, no fade. Stable page numbers and a "page N of M" affordance, because the fixed topography *is* the feature.

**Highlight anchoring must survive repagination.** Anchor to `(char_start, char_end)` in the normalised plain text plus a `quote/prefix/suffix` fingerprint (W3C Annotation style). Never anchor to page number or DOM node — font-size changes would silently move every highlight. Re-anchoring on content re-extraction falls back to fuzzy quote match.

Typography: a small set of well-chosen serif/sans faces, measured line-length control (~66ch target), user-set margins and leading. Progress and highlights sync as ops.

### M3 — E-ink / Boox build

A `--dart-define=EINK=true` flavour plus runtime auto-detect (`Build.MANUFACTURER` = ONYX), so one APK serves both.

- Pure `#000`/`#FFF` theme, no greys in chrome, no shadows, heavier stroke weights, oversized tap targets.
- All animation suppressed: no-op `PageTransitionsBuilder`, implicit animation durations forced to zero, scroll physics replaced with page-snap everywhere including lists.
- Volume-key page turns via `dispatchKeyEvent` in the Android Activity forwarded over a MethodChannel; also hardware page buttons where present.
- Onyx SDK integration **behind reflection guards** (`EpdController` refresh mode, force full refresh every N turns to clear ghosting) so the same build runs unchanged on a Pixel.
- Per-app DPI guidance and a "full refresh every N pages" setting, matching what the essay describes doing manually — the app does it itself.

### M4 — PKM export

- `pkm_export` writes one Markdown file per document into a target folder (an Obsidian vault, or a git repo) with YAML front-matter (title, author, url, tags, dates) and highlights as blockquotes with notes and stable IDs.
- **Incremental and non-destructive**: an export ledger tracks the last-exported highlight per document; re-export updates the block in place and never clobbers text the user added in the vault.
- Optional: commit + push when the target is a git repo. macOS gets a "export on change" toggle; Android exports on demand.

### M5 — Podcast + synced transcript

- Podcast RSS (`enclosure`, iTunes namespace), episode download to blob store, `just_audio` playback with speed control, sleep timer, and position synced as an op.
- `TranscriptionProvider` interface, three implementations:
  - `LocalWhisperProvider` — **macOS only**. whisper.cpp built as a dylib, called over `dart:ffi` from a background isolate, Metal-accelerated, `small.en` default. Emits word-level cues.
  - `CloudProvider` — user-supplied key (Deepgram / AssemblyAI / OpenAI Whisper). Available on both platforms; off by default; cost shown before use.
  - `NoneProvider` — audio only.
- Transcript + cues become a blob, so the phone gets the Mac's work for free.
- Reader-grade transcript view: text scrolls in **paginated** form with the active cue marked, tap a paragraph to seek, and highlighting a passage saves a timestamped quote that exports through M4 like any other highlight.

### M6 — AI reading assistant

- Anthropic Messages API called directly from the client; key stored in macOS Keychain / Android Keystore, never in the sync folder.
- In-reader panel over the *current document only*: ask a question, define a selected term, generate the strongest counter-argument, or produce a Shortform-style critical breakdown (thesis, evidence quality, what the author omits). The essay's own distinction between summarisation and synthesis is the product spec here — do not ship a "summarise this" button alone.
- **Prompt caching is essential**: documents are long and users ask several questions of the same one. Cache the document block; only the question varies. This is the difference between usable and expensive.
- Streaming responses; every answer is anchored to the passage that prompted it and is savable as a note.
- **When implementing this milestone, load the `claude-api` skill first** for current model IDs, pricing, caching semantics, and SDK usage — do not hardcode model identifiers or costs from memory.

### M7 — Hardening and packaging

Compaction + blob GC; a two-device conflict test suite; pagination performance profiling on the Boox (the slowest target sets the budget); macOS `.app` (signed + notarised if it leaves this machine) and a release APK. `README.md` documents the Syncthing setup, since sync is the one part the user must configure outside the app.

---

## Deliberately out of scope for v1

Named here so they are decisions rather than omissions: video sanitisation (the Unhook / Nebula tier — a browser extension, not this app), Kindle `@kindle.com` digest delivery (a small M5-adjacent add-on: the Mac compiles an EPUB and sends via SMTP), multi-user anything, iOS, and any recommendation, trending, streak, or XP mechanic. The last one is a permanent constraint, not a v1 cut — gamification is the failure mode the essay is diagnosing.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Flutter's full-surface repaint ghosts badly on e-ink** | M0 spike on real hardware before committing; fallback is a native Android reader activity over the shared core |
| Android has no real folder for Drive/Dropbox | Syncthing is the recommended and documented path; SAF as fallback; transport is an interface |
| SAF is slow with many small files | Ops batched into rotated ~1 MB files; peers read only past the watermark |
| Extraction breaks on paywalled / JS-heavy sites | Prefer feed full-text; headless WebView second; per-site overrides; explicit failure state rather than a silently empty article |
| Feed freshness depends on a device being awake | Mac menu-bar agent polls continuously; stated plainly in the UI |
| Local Whisper is slow / large models | macOS-only, background isolate, `small.en` default, opt-in cloud provider |
| Repagination on font change stalls the UI | Background isolate + cached break tables keyed by layout params |

---

## Verification

**Automated**
- `reader_engine`: unit tests that page breaks are deterministic and total line boxes are conserved across pagination; property test that highlight anchors resolve to identical text after a font-size change forces repagination.
- `sync_engine`: two in-memory DBs over one temp dir — assert convergence under interleaved ops, offline-then-rejoin, tombstone-vs-edit races, OR-Set tag add/remove races, and that fold is idempotent when a log is replayed twice.
- `ingest`: fixture-based parser tests (Substack, Reddit `.rss`, Atom, JSON Feed, malformed XML) and canonicalisation tests (tracking params stripped, AMP resolved).
- `pkm_export`: golden-file Markdown, plus a test that re-export preserves user-added vault text.
- CI runs `flutter analyze`, `dart test`, and both platform builds on every push.

**Manual, end-to-end** — the acceptance run before calling v1 done:
1. `flutter run -d macos` — add a Substack URL, confirm `/feed` is offered, poll, extract, promote from Feed to Inbox, read paginated, highlight.
2. Confirm the ops and blobs appear in the sync folder; `flutter run -d <android>` on a second device pointed at the same folder; confirm the document, its position, and the highlight arrive.
3. Highlight on Android, confirm it lands back on the Mac and then in the Obsidian vault as Markdown.
4. Subscribe to a podcast, transcribe on the Mac, confirm the phone plays with the synced transcript and that a transcript highlight exports with its timestamp.
5. Ask the AI panel a question, then a second question on the same document — confirm the second is served from cache (check usage in the response).
6. **On the physical Boox**: page-turn latency and ghosting acceptable over a 30-page continuous read; volume keys turn pages; no animation artefacts; full refresh fires on schedule.
7. Kill sync mid-write (force-quit during a fold) and reopen — confirm no corruption and that replay is clean.

---

## Working agreement

Branch `not-yet`, per the session's branch requirement. Each milestone is a commit series with its tests green before moving on; M0's two spikes are throwaway code and are reported back before M1 begins, since a bad e-ink result changes M2 and M3 substantially.
