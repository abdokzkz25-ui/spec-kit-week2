import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { startApp } from '../../src/app.js';

const PAGE_HTML = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

const STUB_STORE = Object.freeze({
  load: () => [],
  save: () => true,
  canSave: () => true,
});

/** Render index.html in jsdom (page scripts are not run) and start the app with test doubles. */
export function loadPage({ quotes, random, store = STUB_STORE }) {
  const dom = new JSDOM(PAGE_HTML, { url: 'http://localhost/' });
  const { window } = dom;
  startApp({ document: window.document, quotes, random, store });
  return { window, document: window.document };
}

/** A `random` replacement that yields `values` in order, cycling. */
export function sequenceRandom(values) {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}

/** An in-memory stand-in for window.localStorage that can be told to fail. */
export function createFakeStorage({ initial = {}, blocked = false, failWrites = false } = {}) {
  const items = new Map(Object.entries(initial));
  let writesFail = failWrites;
  return {
    blocked,
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem(key, value) {
      if (writesFail) {
        throw new DOMException('Storage is full', 'QuotaExceededError');
      }
      items.set(key, String(value));
    },
    removeItem: (key) => items.delete(key),
    setFailWrites(shouldFail) {
      writesFail = shouldFail;
    },
    keys: () => [...items.keys()],
  };
}

/** Mirrors `() => window.localStorage`, which throws when site data is blocked. */
export function getStorageFor(fakeStorage) {
  return () => {
    if (fakeStorage.blocked) {
      throw new DOMException('Access is denied', 'SecurityError');
    }
    return fakeStorage;
  };
}

/** A small collection for tests; `q03` has an unknown author. */
export const TEST_QUOTES = Object.freeze([
  { id: 'q01', text: 'First quote.', author: 'Author One' },
  { id: 'q02', text: 'Second quote.', author: 'Author Two' },
  { id: 'q03', text: 'Third quote.', author: 'Unknown' },
]);
