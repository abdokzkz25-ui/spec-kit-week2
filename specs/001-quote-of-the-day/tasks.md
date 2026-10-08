---

description: "Task list for the Quote of the Day feature"
---

# Tasks: Quote of the Day

**Input**: Design documents from `/specs/001-quote-of-the-day/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (modules.md, storage.md,
ui.md), quickstart.md

**Tests**: Included and written first. Constitution Principle II (Test-First, NON-NEGOTIABLE)
requires every acceptance scenario to have a test that is written and seen to fail before the code
that makes it pass.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on
its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)
- All paths are relative to the repository root (single frontend project, see plan.md)

## Conventions for every task

- JavaScript files are native ES modules (`"type": "module"`); no bundler, no runtime dependencies.
- Use `textContent`, never `innerHTML`, when rendering quote data.
- Named constants for storage keys, notice text, and other fixed values (Principle I).
- Tests use only public exports ([contracts/modules.md](./contracts/modules.md)) and the rendered
  DOM ([contracts/ui.md](./contracts/ui.md)); test names state the expected behavior.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Create `package.json` at the repository root with `"name": "quote-of-the-day"`,
  `"private": true`, `"type": "module"`, `"engines": { "node": ">=22" }`, and scripts:
  `"start": "node scripts/serve.js"`, `"test": "node --test \"tests/**/*.test.js\""`,
  `"lint": "eslint ."`, `"format": "prettier --write ."`, `"format:check": "prettier --check ."`,
  `"check": "npm run format:check && npm run lint && npm test"`
- [X] T002 Install pinned dev dependencies with
  `npm install --save-dev --save-exact eslint @eslint/js globals prettier jsdom`, producing
  `package-lock.json` (Principle VI: versions pinned)
- [X] T003 [P] Create `eslint.config.js` (flat config): `js.configs.recommended`; `globals.browser`
  for `src/**/*.js`; `globals.node` for `tests/**`, `scripts/**`, and `*.config.js`; rules
  `eqeqeq: "error"`, `prefer-const: "error"`, `max-depth: ["error", 3]`, and for `src/**` only
  `max-lines-per-function: ["warn", { max: 30, skipBlankLines: true, skipComments: true }]`;
  ignore `node_modules/`
- [X] T004 [P] Create `.prettierrc.json` (`{ "singleQuote": true, "printWidth": 100 }`) and
  `.prettierignore` (`node_modules/`, `package-lock.json`)
- [X] T005 [P] Create `.gitignore` containing `node_modules/`
- [X] T006 [P] Create `scripts/serve.js`: zero-dependency static server on `node:http` serving the
  repository root; port from `PORT` env var, default `8080`; `/` serves `index.html`; content
  types for `.html`, `.css`, `.js`, `.json`, `.svg`, `.ico`; resolves the requested path and
  returns 404 if it falls outside the root (no path traversal) or the file is missing; logs
  `Serving on http://localhost:<port>` on start (research.md R2)

**Checkpoint**: `npm run lint` and `npm run format:check` run (no source files yet).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Page markup, quote data, and test helpers that every user story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 [P] Create `index.html` with exactly the elements in
  [contracts/ui.md](./contracts/ui.md): `<html lang="en">`, viewport meta, `<title>Quote of the
  Day</title>`, `<link rel="stylesheet" href="styles.css">`,
  `<script type="module" src="src/main.js"></script>`; inside `<main>`: a `<figure>` containing
  `<blockquote><p id="quote-text"></p></blockquote>` and `<figcaption id="quote-author">`;
  `<button type="button" id="new-quote">New quote</button>`;
  `<button type="button" id="favorite-toggle" aria-pressed="false" aria-label="Favorite">☆
  Favorite</button>`; a `<section aria-labelledby="favorites-heading">` with
  `<h2 id="favorites-heading">Favorites</h2>`,
  `<p id="storage-notice" role="status" hidden>Favorites can't be saved in this browser and will
  be lost when you reload.</p>`, `<p id="favorites-empty">No favorites yet</p>`, and
  `<ul id="favorites-list"></ul>`
- [X] T008 [P] Create `tests/helpers/load-page.js` exporting:
  - `loadPage({ quotes, random, store })` — reads `index.html` from disk, builds a `JSDOM`
    **without** running scripts, calls `startApp({ document, quotes, random, store })` from
    `src/app.js`, and returns `{ window, document }`. When `store` is omitted, pass a stub
    `{ load: () => [], save: () => true, canSave: () => true }` so US1/US2 tests need no storage.
  - `sequenceRandom(values)` — returns a function that yields `values` in order, cycling.
  - `createFakeStorage({ initial = {}, blocked = false, failWrites = false })` — an object with
    `getItem`, `setItem`, `removeItem` backed by a `Map` seeded from `initial`; `setItem` throws a
    `DOMException` named `QuotaExceededError` when `failWrites` is true; exposes
    `setFailWrites(bool)` to start failing mid-test. Also export `getStorageFor(fake)` which
    returns `() => fake`, or a function that throws a `SecurityError` `DOMException` when
    `blocked` is true (simulates reading `window.localStorage` with site data blocked).
- [X] T009 [P] Write `tests/unit/quotes.test.js` (must fail before T010): `QUOTES` has at least 10
  quotes (FR-001); every id is unique; every `text` is non-empty and trimmed; every `author` is
  non-empty ("Use the literal `"Unknown"` when the author is not known"); the array is frozen
- [X] T010 Create `src/quotes.js` exporting a frozen `QUOTES` array of 12–15 quotes, ids `q01`,
  `q02`, … ("unique within the collection, stable forever once shipped"); include at least one
  quote with author `"Unknown"` and one quote longer than 200 characters (long-quote edge case);
  use public-domain or widely attributed quotes

**Checkpoint**: `npm test` passes `tests/unit/quotes.test.js`; foundation ready.

---

## Phase 3: User Story 1 - See a random quote (Priority: P1) 🎯 MVP

**Goal**: Opening the page shows exactly one random quote and its author.

**Independent Test**: Open the page several times; one quote with its author is shown each time,
and different quotes appear across visits.

### Tests for User Story 1 (write first, confirm they fail) ⚠️

- [X] T011 [P] [US1] Write `tests/unit/quote-picker.test.js` for `pickRandomQuote(quotes, random,
  excludeId)`: returns the quote at `Math.floor(random() * n)` when nothing is excluded; never
  returns `excludeId` across random values `0`, `0.5`, `0.999999` when more than one quote
  exists; with an exclusion, every other quote is reachable for some random value; returns the
  only quote when the collection has one, even if excluded; throws when `quotes` is empty
- [X] T012 [P] [US1] Write `tests/ui/show-quote.test.js` using `loadPage`: on start
  `#quote-text` and `#quote-author` show the text and author of exactly one quote (US1-1);
  different `random` values produce different displayed quotes (US1-2); a quote with author
  `"Unknown"` shows `Unknown` (US1-3); a long quote's full text is rendered unchanged

### Implementation for User Story 1

- [X] T013 [US1] Implement `pickRandomQuote` in `src/quote-picker.js` per research.md R7: with
  `excludeId` present and `n > 1`, pick index `Math.floor(random() * (n - 1))` and skip over the
  excluded quote's index; with no exclusion pick `Math.floor(random() * n)`; throw an `Error`
  on an empty collection; no DOM or storage access (Principle IV)
- [X] T014 [US1] Implement `startApp({ document, quotes, random, store })` in `src/app.js`: hold
  state `{ currentQuoteId }`, pick the initial quote with `pickRandomQuote`, and a single
  `render()` that writes `#quote-text` and `#quote-author` with `textContent` (depends on T013)
- [X] T015 [US1] Create `src/main.js` that imports `QUOTES` and `startApp` and calls
  `startApp({ document, quotes: QUOTES, random: Math.random })` (depends on T014)
- [X] T016 [P] [US1] Create `styles.css` (research.md R10): CSS custom properties for colors with
  light and `prefers-color-scheme: dark` values; mobile-first single column, content
  `max-width: 40rem`, centered, `padding-inline: 1rem`; relative font sizes; quote text
  `overflow-wrap: anywhere`; buttons at least 44px tall with a visible `:focus-visible` outline;
  no horizontal scrolling at 360px width (FR-011)

**Checkpoint**: `npm test` passes T011–T012; `npm start` shows a random quote on each reload.

---

## Phase 4: User Story 2 - Get a new quote on demand (Priority: P2)

**Goal**: The "New quote" button replaces the quote with a different one, without reloading.

**Independent Test**: Press "New quote" repeatedly; the quote changes every time and never
repeats the one currently shown.

### Tests for User Story 2 (write first, confirm they fail) ⚠️

- [X] T017 [US2] Write `tests/ui/new-quote.test.js` using `loadPage`: clicking `#new-quote` shows a
  different quote (US2-1); `window.location.href` and the `document` object are unchanged after
  the click (US2-2, no reload); 20 rapid clicks each show a quote different from the one before;
  with a one-quote collection a click keeps that quote and throws no error; `#new-quote` is a
  native `<button>` with `type="button"`, is not disabled, and has accessible name "New quote"
  (US2-3: native buttons activate on Enter and Space — jsdom does not simulate that key behavior,
  so the test asserts the native element instead)

### Implementation for User Story 2

- [X] T018 [US2] In `src/app.js`, add a click handler on `#new-quote` that sets `currentQuoteId`
  to `pickRandomQuote(quotes, random, currentQuoteId).id` and calls `render()` (FR-003, FR-004)

**Checkpoint**: `npm test` passes all US1 and US2 tests; the button works in the browser.

---

## Phase 5: User Story 3 - Favorite a quote and keep it after reload (Priority: P3)

**Goal**: Toggle a favorite on the main quote, see all favorites in an on-page list (newest
first), remove them from either place, keep them across reloads, and degrade gracefully when
storage is unavailable.

**Independent Test**: Favorite a quote, reload, and confirm it is listed and marked; unfavorite it,
reload, and confirm it is gone and unmarked.

### Tests for User Story 3 (write first, confirm they fail) ⚠️

- [X] T019 [P] [US3] Write `tests/unit/favorites.test.js`: `toggleFavorite` adds a non-favorite to
  the front ("`[x, ...ids]` (newest first)") and removes an existing favorite; unfavoriting then
  favoriting again moves the quote to the front; `removeFavorite` removes the id and is a no-op
  for unknown ids; `isFavorite` reports membership; no function mutates its input array;
  `normalizeFavoriteIds(rawIds, knownIds)` returns `[]` when `rawIds` is not an array, and
  "Drop entries that are not strings or do not match a collection id" and "Drop duplicates,
  keeping the first (most recent) occurrence"
- [X] T020 [P] [US3] Write `tests/unit/favorites-store.test.js` using `createFakeStorage` /
  `getStorageFor`: `load()` returns `[]` for a missing key, invalid JSON, a non-object, `version`
  other than `1`, and non-array `ids`; drops unknown, non-string, and duplicate ids; `save(ids)`
  writes exactly `{"version":1,"ids":[...]}` to key `quote-of-the-day:favorites` and returns
  `true`; saving `[]` writes `{"version":1,"ids":[]}`; the probe key `quote-of-the-day:probe` is
  removed after construction; when `getStorage` throws, `load()` returns `[]`, `save()` returns
  `false`, and `canSave()` is `false`, with no exception escaping; when writes fail at startup,
  `canSave()` is `false`; when writes start failing later, `save()` returns `false` and
  `canSave()` becomes and stays `false`; corrupt saved data alone leaves `canSave()` `true`
- [X] T021 [P] [US3] Write `tests/ui/favorites.test.js` using `loadPage` with a real
  `createFavoritesStore` over `createFakeStorage` (simulate a reload by calling `loadPage` again
  with the same fake storage). Cover:
  - US3-1/2: clicking `#favorite-toggle` sets `aria-pressed="true"` and label `★ Favorited`;
    clicking again sets `aria-pressed="false"` and `☆ Favorite` (label text differs, FR-006)
  - US3-3/4: favorited state survives a reload; unfavorited state survives a reload
  - US3-5: after favoriting quote A and clicking "New quote" to a non-favorite B, the toggle
    shows not-favorited; returning to A (controlled `random`) shows favorited
  - US3-6: with no favorites `#favorites-empty` is visible and `#favorites-list` is empty;
    `#favorites-empty` is hidden when the list has items
  - US3-7: favoriting the displayed non-favorite adds an `<li>` with its text and author at the
    top of `#favorites-list` without reload; with two favorites, the newest is first (FR-012)
  - US3-8: the same quotes, in the same order, are listed after a reload
  - US3-9: clicking an item's "Remove" button removes it and, if it is the main quote, sets the
    toggle to not-favorited in the same update; the button's accessible name starts with
    `Remove favorite: <author> — `
  - FR-014: clicking a list item's text does not change `#quote-text`
  - Edge cases: blocked storage → a quote is shown, "New quote" and favoriting still work, and
    `#storage-notice` is visible; corrupt saved data → no favorites and `#storage-notice` stays
    hidden; writes failing mid-visit → the change still applies in the page and the notice
    appears and stays visible; saved ids not in the collection are not listed; 10 rapid toggle
    clicks leave the toggle and list in agreement

### Implementation for User Story 3

- [X] T022 [P] [US3] Implement `toggleFavorite`, `removeFavorite`, `isFavorite`, and
  `normalizeFavoriteIds` in `src/favorites.js` per [data-model.md](./data-model.md#favorites):
  pure functions that return new arrays and never mutate inputs; no DOM or storage access
- [X] T023 [US3] Implement `createFavoritesStore(getStorage, knownIds)` in
  `src/favorites-store.js` per [contracts/storage.md](./contracts/storage.md): constants
  `FAVORITES_KEY = 'quote-of-the-day:favorites'`, `PROBE_KEY = 'quote-of-the-day:probe'`,
  `FORMAT_VERSION = 1`; call `getStorage()` inside `try/catch`; probe once at creation by
  `setItem`/`removeItem` on `PROBE_KEY`; `load()` parses JSON in `try/catch` and passes `ids`
  through `normalizeFavoriteIds`; `save(ids)` writes `JSON.stringify({ version: 1, ids })` in
  `try/catch` and sets `canSave` to `false` on failure; nothing ever throws (depends on T022)
- [X] T024 [US3] Extend `startApp` in `src/app.js`: state gains `favoriteIds` (from
  `store.load()`) and `canSave` (from `store.canSave()`); `#favorite-toggle` click calls
  `toggleFavorite`, then `store.save()`; after a failed save set `canSave` to `false`; `render()`
  additionally sets the toggle's `aria-pressed` and label (`☆ Favorite` / `★ Favorited`),
  rebuilds `#favorites-list` (one `<li>` per favorite in stored order with text, author, and a
  `<button type="button">Remove</button>` whose `aria-label` is
  `Remove favorite: <author> — <first 40 chars of text>` followed by `…` when truncated),
  toggles `#favorites-empty`, and shows `#storage-notice` when `canSave` is `false`; "Remove"
  uses `removeFavorite` and the same save path; list item text has no click behavior (FR-014)
  (depends on T022, T023)
- [X] T025 [US3] Update `src/main.js` to pass
  `store: createFavoritesStore(() => window.localStorage, QUOTES.map((quote) => quote.id))`
  (depends on T023, T024)
- [X] T026 [P] [US3] Add favorites styles to `styles.css`: toggle styling for both states
  (state also shown by the ★/☆ label, not color alone), favorites list layout that stays
  readable with every quote favorited and does not hide the main quote, and a visually distinct
  but non-blocking `#storage-notice`

**Checkpoint**: `npm test` passes all tests; all three stories work in the browser.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Constitution quality gates and documentation

- [X] T027 [P] Write `README.md`: what the app does; prerequisites (Node 22+); one command each
  for install (`npm ci`), run (`npm start`), test (`npm test`), lint (`npm run lint`), format
  check (`npm run format:check`), and all checks (`npm run check`); a short project layout; a note
  that favorites are stored in `localStorage` under `quote-of-the-day:favorites` (Principle VI)
- [X] T028 Review every `tests/**/*.test.js` against spec.md: each acceptance scenario (US1-1…3,
  US2-1…3, US3-1…9) and each edge case maps to at least one test; add any missing test before
  continuing (Quality Gate 3)
- [X] T029 Clean up `src/` and `tests/`: no unused code, debug logging, or commented-out code;
  functions about 30 lines or less; nesting no deeper than 3 levels; magic values replaced with
  named constants (Principle I, Quality Gate 5)
- [X] T030 Run `npm run format`, then `npm run check`; fix every format, lint, and test failure;
  confirm `npm test` finishes in under 10 seconds (Quality Gates 1–2)
- [X] T031 Run the manual browser checks in [quickstart.md](./quickstart.md#manual-validation-browser)
  steps 1–6 and fix any failure (FR-011 layout, blocked storage, corrupt data)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup (T001–T002 for the test runner and jsdom). Blocks
  all user stories.
- **US1 (Phase 3)**: Depends on Foundational.
- **US2 (Phase 4)**: Depends on US1's `pickRandomQuote` (T013) and `startApp` (T014); both share
  `src/app.js`.
- **US3 (Phase 5)**: Depends on US1's `startApp` (T014). Independent of US2: its tests work
  without the "New quote" handler except US3-5, which also needs T018.
- **Polish (Phase 6)**: Depends on all stories.

### User Story Dependencies

```text
Setup → Foundational → US1 ─┬─→ US2 ──┐
                            └─→ US3 ──┴─→ Polish
```

- **US1 (P1)**: MVP; no dependency on other stories.
- **US2 (P2)**: Builds on US1's app module; testable on its own.
- **US3 (P3)**: Builds on US1's app module; testable on its own (scenario US3-5 also needs US2).

### Within Each User Story

- Tests are written first and MUST fail before implementation (Principle II).
- Pure logic before the storage module before UI wiring.
- `src/app.js` tasks (T014, T018, T024) are sequential because they edit the same file.

### Parallel Opportunities

- Setup: T003, T004, T005, T006 together after T001–T002.
- Foundational: T007, T008, T009 together; then T010.
- US1: T011 and T012 together; T016 alongside T013–T015.
- US3: T019, T020, T021 together; then T022 (with T026 alongside); then T023 → T024 → T025.
- US2 and US3 can proceed in parallel after US1 if their `src/app.js` edits are coordinated.

---

## Parallel Example: User Story 3

```bash
# Write all US3 tests together (each must fail first):
Task: "Write tests/unit/favorites.test.js"
Task: "Write tests/unit/favorites-store.test.js"
Task: "Write tests/ui/favorites.test.js"

# Then implement the pure logic and styles together (T023 follows T022):
Task: "Implement src/favorites.js"
Task: "Add favorites styles to styles.css"
```

## Parallel Example: User Story 1

```bash
Task: "Write tests/unit/quote-picker.test.js"
Task: "Write tests/ui/show-quote.test.js"
Task: "Create styles.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1
4. **Stop and validate**: `npm run check` passes; `npm start` shows a random quote per reload
5. Demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate → demo (MVP)
3. US2 → validate → demo
4. US3 → validate → demo
5. Polish → all quality gates pass → ready to merge

---

## Notes

- [P] tasks touch different files and have no dependencies on incomplete tasks.
- Commit after each task or logical group, describing the behavior added (Development Workflow).
- If implementation reveals a spec-level problem, fix spec.md or plan.md first, then the code.

---

## Phase 7: Convergence

- [X] T032 [US3] Keep keyboard focus in the favorites area after a favorite is removed from the list in `src/app.js`: when a "Remove" button is activated, move focus to the "Remove" button of the item that took its place, else the previous item's, else the `Favorites` heading (give `#favorites-heading` `tabindex="-1"` in `index.html`); first add a failing test in `tests/ui/favorites.test.js` asserting `document.activeElement` after removing the first, last, and only favorite per FR-010, US3/AC9 (partial)
- [X] T033 [US3] Make the can't-save notice reliably announced by screen readers when saving fails mid-visit: keep a `role="status"` live region present in the accessibility tree from page load and insert the notice text into it when `canSave` becomes `false` (the notice must still be visibly hidden while saving works, per contracts/ui.md); update `index.html`, `src/app.js`, and the storage-notice assertions in `tests/ui/favorites.test.js` (test first) per FR-015, plan: research R9 (partial)
- [X] T034 Record why `.specify/`, `.claude/`, and `specs/` are excluded from formatting and linting: add a short comment to `.prettierignore` and to the `ignores` entry in `eslint.config.js` (Spec Kit documents are hand-wrapped Markdown and are not app code) per T004, Constitution VI (unrequested)

---

## Phase 8: Convergence

- [X] T035 [US3] Stop re-announcing the can't-save notice on every render in `src/app.js`: change `#storage-notice` text only when its desired value differs from the current one, so the live region is written once when saving first fails; first add a failing test in `tests/ui/favorites.test.js` that uses a `MutationObserver` on `#storage-notice` with storage blocked and asserts that pressing "New quote" and the favorite toggle cause no mutations per FR-015, T033, plan: research R9 (partial)
