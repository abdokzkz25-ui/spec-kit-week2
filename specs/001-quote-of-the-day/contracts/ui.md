# Contract: Page UI

The stable elements and behaviors that UI tests rely on. Tests locate elements by the ids below
(or by role and accessible name); styling and wording not listed here may change freely.

## Elements (in `index.html`)

| Id | Element | Purpose | Spec |
|----|---------|---------|------|
| `quote-text` | `<blockquote>` / `<p>` | Main quote text | FR-002 |
| `quote-author` | `<figcaption>` / `<cite>` | Main quote author, `"Unknown"` if unknown | US1-3 |
| `new-quote` | `<button type="button">` | Accessible name "New quote" | FR-003, FR-010 |
| `favorite-toggle` | `<button type="button">` | Toggle favorite on the main quote | FR-005, FR-006 |
| `favorites-list` | `<ul>` | One `<li>` per favorite, newest first | FR-012 |
| `favorites-empty` | `<p>` | "No favorites yet" message; hidden when the list has items | FR-012 |
| `favorites-heading` | `<h2 tabindex="-1">` | "Favorites" heading; receives focus when the last favorite is removed | FR-010 |
| `storage-notice` | `<p>` inside a `<div role="status">` | Can't-save notice; `hidden` and empty unless saving is unavailable | FR-015 |

## Favorite toggle states

| State | `aria-pressed` | Visible label | Accessible name |
|-------|----------------|---------------|-----------------|
| Not a favorite | `"false"` | `☆ Favorite` | "Favorite" |
| Favorite | `"true"` | `★ Favorited` | "Favorite" (state conveyed by `aria-pressed`) |

The label text and icon differ between states, so the state is not shown by color alone (FR-006).

## Favorites list item

Each `<li>` contains:

- the quote text and author, as plain text (not a link or button — selecting it does nothing,
  FR-014);
- a `<button type="button">` with visible text "Remove" and an accessible name of the form
  `Remove favorite: <author> — <first ~40 chars of text>`.

Activating "Remove" removes the item and, if that quote is the main quote, sets the toggle to
the not-a-favorite state in the same render (FR-013, US3 scenario 9). Focus then moves to the
"Remove" button of the item that took its place, else the one above it, else the `Favorites`
heading, so keyboard users stay in the list (FR-010).

## Can't-save notice

- Text: "Favorites can't be saved in this browser and will be lost when you reload."
- Shown (`hidden` removed and the text inserted) when the startup probe fails or any save fails;
  once shown, it stays for the rest of the visit.
- The surrounding `role="status"` live region is present from page load, so inserting the text
  is announced by screen readers.
- Never shown just because saved data was missing or corrupt.
- Non-blocking: does not move focus or disable any control.

## Behavior guarantees

- On start: exactly one quote is rendered in `quote-text`/`quote-author`; the toggle and list
  reflect loaded favorites.
- "New quote": replaces the main quote with a different one (when more than one exists) without
  navigation; the toggle updates to that quote's favorite state.
- All updates are synchronous and render from a single state object, so the toggle and list
  always agree.
