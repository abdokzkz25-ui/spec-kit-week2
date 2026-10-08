# Contract: Module Interfaces

Public exports of each source module. Tests exercise only these exports and the rendered page
([ui.md](./ui.md)) — never private helpers (Principle II). Signatures use JSDoc-style types.

## `src/quotes.js` — data

```js
/** @type {ReadonlyArray<{ id: string, text: string, author: string }>} */
export const QUOTES
```

Frozen array; rules in [data-model.md](../data-model.md#quote).

## `src/quote-picker.js` — pure logic, no DOM, no storage

```js
/**
 * Pick a quote uniformly at random, never returning the quote with `excludeId`
 * unless it is the only quote. `random` returns a number in [0, 1).
 */
export function pickRandomQuote(quotes, random, excludeId = null) → Quote
```

- Throws only if `quotes` is empty (a programming error; the shipped collection is never empty).

## `src/favorites.js` — pure logic, no DOM, no storage

```js
export function toggleFavorite(favoriteIds, quoteId) → string[]      // new array, newest first
export function removeFavorite(favoriteIds, quoteId) → string[]      // new array
export function isFavorite(favoriteIds, quoteId) → boolean
export function normalizeFavoriteIds(rawIds, knownIds) → string[]    // FR-009 cleaning rules
```

All functions return new arrays and never mutate their inputs.

## `src/favorites-store.js` — the only module that touches storage

```js
/**
 * @param getStorage () => Storage — called inside try/catch, because merely reading
 *        window.localStorage can throw when site data is blocked.
 */
export function createFavoritesStore(getStorage, knownIds) → {
  load(): string[],            // never throws; [] on any problem
  save(ids: string[]): boolean, // false if the write failed; never throws
  canSave(): boolean,          // result of the startup probe, then false after any failed save
}
```

## `src/app.js` — UI wiring

```js
/**
 * Render the app into `document` and attach event handlers. Expects the markup
 * from index.html (see contracts/ui.md).
 */
export function startApp({ document, quotes, random, store }) → void
```

Contains no selection or favorites rules of its own: it translates events into calls to the
modules above and re-renders from state (Principle IV).

## `src/main.js` — entry point (not unit-tested)

Calls `startApp` with the real `document`, `QUOTES`, `Math.random`, and
`createFavoritesStore(() => window.localStorage, QUOTES.map(q => q.id))`. It is the only place
real globals are bound, which keeps every other module testable with fakes.
