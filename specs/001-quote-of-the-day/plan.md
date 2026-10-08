# Implementation Plan: Quote of the Day

**Branch**: `001-quote-of-the-day` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-quote-of-the-day/spec.md`

## Summary

A single static page that shows one random quote from a built-in collection, a "New quote" button
that always shows a different quote, and favorites (toggle on the main quote plus an on-page list,
newest first) that persist across reloads. Per the user's direction it is built with plain
HTML/CSS/JavaScript and no backend, with favorites saved in `localStorage`. The code is split into
native ES modules: pure logic (quote picking, favorites rules), one storage module that never
throws, and a thin UI layer. Randomness and storage are injected so every acceptance scenario is
tested deterministically with Node's built-in test runner and jsdom.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2022, native ES modules); Node.js 22 LTS for
tooling only

**Primary Dependencies**: None at runtime. Dev only, pinned via `package-lock.json`: `jsdom` (UI
tests), `eslint` + `@eslint/js` + `globals` (lint), `prettier` (format). See
[research.md](./research.md) R3–R5.

**Storage**: Browser `localStorage`, one versioned JSON key — [contracts/storage.md](./contracts/storage.md)

**Testing**: `node --test` with `node:assert/strict`; jsdom loads the real `index.html` for UI
tests

**Target Platform**: Current evergreen browsers (Chrome, Firefox, Safari, Edge); any static host

**Project Type**: Static single-page web app (frontend only)

**Performance Goals**: Quote visible < 1 s after load (SC-001); "New quote" re-render < 100 ms
(SC-002); test suite < 10 s

**Constraints**: No backend, no build step, no runtime dependencies; works offline once loaded;
never throws on storage failure; usable from 360px width; keyboard accessible

**Scale/Scope**: 1 page, ~10–30 built-in quotes, favorites bounded by collection size; ~6 source
modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.1.0.

| Principle | How the plan complies | Status |
|-----------|-----------------------|--------|
| I. Readable, Self-Explaining Code | ESLint + Prettier enforce formatting and lint; small single-purpose functions (`pickRandomQuote`, `toggleFavorite`); storage key and notice text as named constants | ✅ Pass |
| II. Test-First for Behavior | Every acceptance scenario mapped to a test ([quickstart.md](./quickstart.md#automated-validation)); `random` and storage injected (R6, `createFavoritesStore(getStorage)`); tests use public exports and rendered DOM only; `npm test` single command; suite < 10 s | ✅ Pass |
| III. Simplicity & Minimal Dependencies | Zero runtime deps, no framework, no bundler. Dev deps each justified by a concrete need: jsdom (no DOM in Node; R4), ESLint + Prettier (required by Principle I; R5). Local server is a 25-line `node:http` script instead of a package (R2) | ✅ Pass |
| IV. Small, Cohesive Modules | `quote-picker.js` and `favorites.js` are pure; `favorites-store.js` is the only storage access; `app.js` only wires events, logic, and rendering ([contracts/modules.md](./contracts/modules.md)) | ✅ Pass |
| V. Graceful Degradation | All storage access in try/catch, including reading `window.localStorage`; corrupt data → empty list; failed saves → in-memory favorites + non-blocking notice (R8, FR-015) | ✅ Pass |
| VI. Maintainable by Default | README with one command each for run/test/lint/format; `npm run check` runs all checks; dev deps pinned by lockfile; decisions recorded in research.md | ✅ Pass |
| Quality Gates | `npm run check` is the merge gate; acceptance-scenario→test mapping in quickstart.md | ✅ Pass |

**Post-design re-check (after Phase 1)**: ✅ Pass. The data model, contracts, and quickstart
introduce no new dependencies or abstractions beyond those above. No violations, so Complexity
Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-quote-of-the-day/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R10
├── data-model.md        # Phase 1: Quote, Favorites, app state
├── quickstart.md        # Phase 1: run + validation guide
├── contracts/
│   ├── modules.md       # Public exports of each source module
│   ├── storage.md       # localStorage key and JSON format
│   └── ui.md            # Element ids, states, and behavior tests rely on
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
index.html                 # Page markup (ids per contracts/ui.md); loads src/main.js as a module
styles.css                 # Mobile-first layout, light/dark color schemes
src/
├── quotes.js              # QUOTES: built-in collection (data only)
├── quote-picker.js        # pickRandomQuote — pure
├── favorites.js           # toggleFavorite, removeFavorite, isFavorite, normalizeFavoriteIds — pure
├── favorites-store.js     # createFavoritesStore — the only localStorage access
├── app.js                 # startApp — event wiring and rendering
└── main.js                # Entry point: binds real document, Math.random, localStorage
scripts/
└── serve.js               # Zero-dependency static server for `npm start`
tests/
├── helpers/
│   └── load-page.js       # Builds a jsdom window from index.html; fake random and storage
├── unit/
│   ├── quotes.test.js
│   ├── quote-picker.test.js
│   ├── favorites.test.js
│   └── favorites-store.test.js
└── ui/
    ├── show-quote.test.js     # US1
    ├── new-quote.test.js      # US2
    └── favorites.test.js      # US3 + storage edge cases
package.json               # Scripts: start, test, lint, format, format:check, check
package-lock.json
eslint.config.js
.prettierrc.json
README.md
```

**Structure Decision**: A single frontend project at the repository root. The app is static
files (`index.html`, `styles.css`, `src/`) that any static host can serve directly; everything else
(`scripts/`, `tests/`, config files) is development tooling. Unit tests target the pure and
storage modules; UI tests drive the real `index.html` in jsdom to cover the acceptance scenarios.

## Complexity Tracking

No constitution violations. Nothing to justify.
