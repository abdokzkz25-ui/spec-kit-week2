# Research: Quote of the Day

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-08

User constraints for this plan: plain HTML/CSS/JavaScript, no backend, favorites persisted in
`localStorage`. Each decision below resolves an open point in the Technical Context.

## R1. Code organization without a build step

- **Decision**: Native ES modules (`<script type="module">`) loaded directly by `index.html`; no
  bundler, transpiler, or framework.
- **Rationale**: Every evergreen browser supports ES modules, and Node can import the same files
  for testing, so one source tree serves both. Satisfies Principle III (no unneeded tooling) and
  Principle IV (separate files for logic, storage, and UI).
- **Alternatives considered**:
  - One classic `<script>` with globals — works from `file://`, but cannot be imported by tests
    without hacks and blurs module boundaries.
  - Bundler (Vite, esbuild) — adds a build step and dependencies the spec does not need.

## R2. Serving the page locally

- **Decision**: A ~25-line zero-dependency static server at `scripts/serve.js` built on
  `node:http`, run with `npm start`. Any static host (e.g., GitHub Pages) works in production.
- **Rationale**: Browsers refuse to load ES modules from `file://` URLs, so the page must be
  served over HTTP. A tiny script avoids adding a runtime dependency (Principle III) and gives the
  README a single command (Principle VI).
- **Alternatives considered**:
  - `npx http-server` / `serve` — an extra package, and `npx` without a pinned version violates
    Principle VI.
  - `python3 -m http.server` — works, but adds a second toolchain requirement next to Node.

## R3. Test runner

- **Decision**: Node's built-in test runner (`node --test`) and `node:assert/strict`.
- **Rationale**: Zero dependencies, fast (whole suite well under the 10-second target), and
  supports ES modules natively. Satisfies Principle II's "single documented command" via
  `npm test`.
- **Alternatives considered**: Jest (needs ESM configuration, heavy), Vitest (extra dependency for
  features this project does not use).

## R4. Testing UI behavior (acceptance scenarios)

- **Decision**: `jsdom` as a pinned **dev** dependency. UI tests load the real `index.html` into a
  jsdom window, start the app with injected fakes, and assert on rendered output and user events.
- **Rationale**: Principle II requires a test for every acceptance scenario, through public
  interfaces (rendered output). Node has no DOM, so a DOM implementation is a concrete need the
  platform cannot meet. jsdom is the most widely used option and needs no browser download.
- **Alternatives considered**:
  - Playwright/Puppeteer — real browsers, but large downloads and slower runs, which would break
    the ~10-second suite target; reserved for later if layout bugs (e.g., FR-011) need automation.
  - `happy-dom` — lighter, but less complete standards coverage; no speed need justifies it here.
  - Testing only pure logic — would leave UI acceptance scenarios untested, violating Principle II.

## R5. Linting and formatting

- **Decision**: ESLint (flat config, `@eslint/js` recommended rules + `globals`) and Prettier, as
  pinned dev dependencies. `npm run check` runs format check, lint, and tests together.
- **Rationale**: Principle I requires formatting and lint rules to be enforced by tools, not review;
  Principle VI requires one command that runs all checks. These are the de-facto standards for
  JavaScript and need minimal configuration.
- **Alternatives considered**: Biome (single tool, but less familiar; either would satisfy the
  constitution — choose the more common pair); no tooling (violates Principle I).

## R6. Deterministic randomness

- **Decision**: Selection logic takes a `random` function argument (defaulting to `Math.random`
  only in the entry point). Tests pass a fixed sequence.
- **Rationale**: Principle II requires randomness to be injectable so results do not depend on
  chance.
- **Alternatives considered**: Seeded PRNG library — unnecessary dependency; stubbing
  `Math.random` globally — leaks between tests and violates test independence.

## R7. Picking a different quote (FR-003)

- **Decision**: Pick uniformly from the collection **excluding** the current quote: choose an index
  in `[0, n-1)` and skip over the current one. With one quote, return it unchanged.
- **Rationale**: Guarantees a different quote in one draw (SC-002: every press shows a change), with
  no retry loop. Matches the clarification: only the displayed quote is excluded, no history.
- **Alternatives considered**: Re-roll until different — unbounded in theory and harder to test;
  shuffle-bag — rejected by clarification Q3.

## R8. localStorage format and robustness (FR-007, FR-009, FR-015)

- **Decision**: One key, `quote-of-the-day:favorites`, holding JSON
  `{"version": 1, "ids": ["q07", "q02"]}` with ids ordered most recently favorited first. Details
  in [contracts/storage.md](./contracts/storage.md).
- **Rationale**: An ordered id list encodes FR-012's ordering without timestamps. A versioned
  object lets the format change later without misreading old data. Storing ids, not text, means
  edits to quote wording never desync favorites.
- **Robustness rules**:
  - Every `localStorage` access, including reading the `window.localStorage` property itself
    (it throws `SecurityError` when site data is blocked), is wrapped in `try/catch`.
  - Unparseable JSON, a wrong shape, unknown ids, non-string ids, and duplicates are dropped
    silently → treated as "no favorites" (FR-009). These never show the can't-save notice.
  - Save ability is probed once at startup by writing and removing a probe key. If the probe
    fails, or any later save throws (e.g., `QuotaExceededError`), the app switches to in-memory
    favorites and shows the can't-save notice (FR-015).
- **Alternatives considered**: One key per favorite (harder to keep ordered and atomic);
  IndexedDB (async, far more complex than a short id list needs); cookies (sent to servers,
  size-limited, no benefit).

## R9. Accessibility of controls (FR-006, FR-010)

- **Decision**: Native `<button>` elements. The favorite control is a toggle button with
  `aria-pressed` and visible text/icon that changes ("☆ Favorite" / "★ Favorited"), so state is
  not shown by color alone. Each list "Remove" button has an accessible name that includes the
  quote's author and the start of its text. The can't-save notice uses `role="status"` so screen
  readers announce it without stealing focus.
- **Rationale**: Native buttons get Enter/Space keyboard activation and focus for free (US2
  scenario 3), with no custom key handling to test.
- **Alternatives considered**: Clickable `<div>`s/icons — need manual roles, tabindex, and key
  handlers; a checkbox for favorite — reads oddly next to a quote.

## R10. Layout (FR-011, long quotes)

- **Decision**: A single-column, mobile-first layout using CSS custom properties, `max-width` on
  the content, relative font sizes, and `overflow-wrap: anywhere` for long words. Light and dark
  color schemes via `prefers-color-scheme`.
- **Rationale**: Meets the 360px-to-desktop requirement without media-query sprawl or a CSS
  framework.
- **Alternatives considered**: CSS framework (dependency with no concrete need).

## Resolved unknowns

All Technical Context fields are decided; no `NEEDS CLARIFICATION` items remain.
