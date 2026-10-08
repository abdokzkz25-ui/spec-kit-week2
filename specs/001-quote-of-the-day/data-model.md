# Data Model: Quote of the Day

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-10-08

## Quote

A saying from the built-in collection. Defined in source code (`src/quotes.js`) and never changed
at runtime.

| Field  | Type   | Rules |
|--------|--------|-------|
| id     | string | Required, unique within the collection, stable forever once shipped (e.g., `"q01"`). Never reused for a different quote. |
| text   | string | Required, non-empty, trimmed. |
| author | string | Required, non-empty. Use the literal `"Unknown"` when the author is not known (US1 scenario 3). |

**Collection rules** (enforced by a unit test over `src/quotes.js`):

- At least 10 quotes (FR-001).
- All ids unique; all fields present and non-empty.
- Order in the array has no meaning.

## Favorites

The visitor's set of favorited quotes, kept per browser.

| Field | Type          | Rules |
|-------|---------------|-------|
| ids   | string[]      | Ordered **most recently favorited first** (FR-012). No duplicates. Every id MUST match a quote in the collection. |

**Derived values**

- `isFavorite(id)` — true when `id` is in `ids`.
- Favorites list view — `ids` mapped to their quotes, in stored order.

**State transitions** (pure functions, no storage or DOM access — Principle IV)

| Action | From | To |
|--------|------|----|
| Toggle on quote `x` (not a favorite) | `ids` | `[x, ...ids]` (newest first) |
| Toggle on quote `x` (already a favorite) | `ids` | `ids` without `x` |
| Remove `x` from list | `ids` | `ids` without `x` (same as toggle-off) |

Unfavoriting a quote and favoriting it again moves it to the front of the list, which matches
"most recently favorited first".

**Loading / validation** (FR-009) — raw saved data is normalized as follows; any failure yields
`[]` and never raises:

1. Missing value → `[]`.
2. Unparseable JSON, not an object, `version !== 1`, or `ids` not an array → `[]`.
3. Drop entries that are not strings or do not match a collection id.
4. Drop duplicates, keeping the first (most recent) occurrence.

## App state (UI module, in memory)

| Field | Type | Meaning |
|-------|------|---------|
| currentQuoteId | string | Quote shown as the main quote. Set at startup (random pick) and by "New quote". Never changed by the favorites list (FR-014). |
| favoriteIds | string[] | Current favorites, as above. Source of truth for both the main toggle and the list, so they always agree (FR-013). |
| canSave | boolean | `false` when the startup probe fails or any save throws. When `false`, the can't-save notice is visible and favorites live in memory only (FR-015). Once `false`, it stays `false` for the visit. |

Every user action updates state synchronously and re-renders from it, so rapid presses always show
one consistent quote and favorite state (Edge Cases).

## Persisted form

See [contracts/storage.md](./contracts/storage.md) for the exact `localStorage` key and JSON shape.
