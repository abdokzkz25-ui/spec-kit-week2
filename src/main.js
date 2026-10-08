// Entry point: the only place real browser globals are bound.
import { QUOTES } from './quotes.js';
import { startApp } from './app.js';
import { createFavoritesStore } from './favorites-store.js';

startApp({
  document,
  quotes: QUOTES,
  random: Math.random,
  store: createFavoritesStore(
    () => window.localStorage,
    QUOTES.map((quote) => quote.id),
  ),
});
