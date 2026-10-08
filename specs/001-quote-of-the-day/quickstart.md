# Quickstart & Validation: Quote of the Day

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

How to run the app and prove the feature works end to end. Element ids and storage details are
defined in [contracts/ui.md](./contracts/ui.md) and [contracts/storage.md](./contracts/storage.md).

## Prerequisites

- Node.js 22 LTS or newer (tooling only; the app itself has no runtime dependencies)
- A current version of Chrome, Firefox, Safari, or Edge

## Setup

```bash
npm ci            # installs pinned dev dependencies (ESLint, Prettier, jsdom)
```

## Commands

| Purpose | Command | Expected result |
|---------|---------|-----------------|
| Run the app | `npm start` | Prints `http://localhost:8080`; opening it shows a quote |
| Run tests | `npm test` | All tests pass in under 10 seconds |
| Lint + format check | `npm run lint` / `npm run format:check` | Zero errors |
| All checks (merge gate) | `npm run check` | Format check, lint, and tests all pass |

## Automated validation

`npm test` covers every acceptance scenario in the spec:

| Spec area | Covered by |
|-----------|------------|
| Collection rules (FR-001) | `tests/unit/quotes.test.js` |
| Random pick and "different quote" rule (FR-002, FR-003) | `tests/unit/quote-picker.test.js` |
| Toggle, ordering, cleaning saved data (FR-009, FR-012) | `tests/unit/favorites.test.js` |
| Storage failures and probe (FR-007, FR-008, FR-015) | `tests/unit/favorites-store.test.js` |
| US1–US3 acceptance scenarios and edge cases, on the real `index.html` | `tests/ui/*.test.js` |

## Manual validation (browser)

Run `npm start` and open the printed URL.

1. **US1**: A quote with its author is shown. Reload 5 times; at least two different quotes appear.
2. **US2**: Press "New quote" 10 times; the quote changes on every press with no page reload. Tab to
   the button and press Enter, then Space; each shows a new quote.
3. **US3**:
   1. With no favorites, the favorites area shows "No favorites yet".
   2. Press "☆ Favorite"; it changes to "★ Favorited" and the quote appears at the top of the list.
   3. Press "New quote", favorite a second quote; it appears above the first.
   4. Reload. Both quotes are still listed in the same order.
   5. Press "Remove" on the listed quote that is currently shown; it disappears from the list and
      the main button changes back to "☆ Favorite" at the same moment.
   6. Click on a list item's text; the main quote does not change.
4. **Storage blocked** (FR-015): In the browser's site settings, block cookies and site data for
   `localhost` and reload. A quote is shown, "New
   quote" works, favoriting works, and the notice "Favorites can't be saved in this browser…" is
   visible. Reload: favorites are gone, as the notice said.
5. **Corrupt data** (FR-009): In DevTools → Application → Local Storage, set
   `quote-of-the-day:favorites` to `not json` and reload. The page works, shows "No favorites yet",
   and does **not** show the can't-save notice.
6. **Layout** (FR-011): In DevTools device mode at 360px width, there is no horizontal scrolling,
   and long quotes wrap fully.
