# Quote of the Day

A single static page that shows a random quote from a built-in collection. Press **New quote** for
a different one, and favorite the quotes you like. Favorites appear in a list on the same page
(newest first) and are kept across reloads in your browser. No backend, no sign-in.

## Prerequisites

- Node.js 22 or newer (only for the dev server, tests, and checks; the page itself has no runtime
  dependencies)

## Commands

| Purpose                                    | Command                |
| ------------------------------------------ | ---------------------- |
| Install pinned dev dependencies            | `npm ci`               |
| Run the app at http://localhost:8080       | `npm start`            |
| Run the tests                              | `npm test`             |
| Lint                                       | `npm run lint`         |
| Check formatting                           | `npm run format:check` |
| Fix formatting                             | `npm run format`       |
| Run every check (must pass before merging) | `npm run check`        |

Set `PORT` to use another port, e.g. `PORT=3000 npm start`. A server is needed because browsers do
not load JavaScript modules from `file://` URLs; any static host can serve the page in production.

## Project layout

```text
index.html             Page markup
styles.css             Styles (mobile first, light and dark)
src/quotes.js          The built-in quote collection
src/quote-picker.js    Random quote selection (pure logic)
src/favorites.js       Favorites rules (pure logic)
src/favorites-store.js The only code that touches browser storage
src/app.js             Connects clicks to the logic and renders the page
src/main.js            Entry point
scripts/serve.js       Local dev server (no dependencies)
tests/unit/            Tests for the logic and storage modules
tests/ui/              Tests for each user story, run against index.html in jsdom
specs/                 Spec Kit specification, plan, and tasks
```

## Favorites storage

Favorites are saved in `localStorage` under the key `quote-of-the-day:favorites` as
`{"version": 1, "ids": [...]}`, most recent first. If the browser blocks storage, favorites still
work for the current visit and the page shows a notice that they will be lost on reload. Corrupt
saved data is ignored. Quote ids in `src/quotes.js` are permanent; never reuse or renumber one.
