import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFavoritesStore } from '../../src/favorites-store.js';
import {
  createFakeStorage,
  getStorageFor,
  loadPage,
  sequenceRandom,
  TEST_QUOTES,
} from '../helpers/load-page.js';

const FAVORITES_KEY = 'quote-of-the-day:favorites';
const KNOWN_IDS = TEST_QUOTES.map((quote) => quote.id);
// With TEST_QUOTES: random 0 → q01 on start; "New quote" from q01 with random 0 → q02.
const SHOW_FIRST = () => 0;

function openPage({ storage = createFakeStorage(), random = SHOW_FIRST } = {}) {
  const store = createFavoritesStore(getStorageFor(storage), KNOWN_IDS);
  const page = loadPage({ quotes: TEST_QUOTES, random, store });
  return { ...page, storage };
}

const byId = (document, id) => document.getElementById(id);
const toggle = (document) => byId(document, 'favorite-toggle');

function listedQuotes(document) {
  return [...byId(document, 'favorites-list').querySelectorAll('li')].map((item) =>
    [...item.children].map((child) => child.textContent.trim()).join(' '),
  );
}

function assertToggleShows(document, favorited) {
  assert.equal(toggle(document).getAttribute('aria-pressed'), String(favorited));
  assert.equal(toggle(document).textContent.trim(), favorited ? '★ Favorited' : '☆ Favorite');
}

function removeButtons(document) {
  return [...byId(document, 'favorites-list').querySelectorAll('button')];
}

function savedIds(storage) {
  return JSON.parse(storage.getItem(FAVORITES_KEY)).ids;
}

test('favoriting the shown quote marks it as a favorite', () => {
  const { document } = openPage();
  assertToggleShows(document, false);

  toggle(document).click();

  assertToggleShows(document, true);
});

test('activating the toggle on a favorite removes the mark', () => {
  const { document } = openPage();

  toggle(document).click();
  toggle(document).click();

  assertToggleShows(document, false);
});

test('a favorited quote is still marked after a reload', () => {
  const { document, storage } = openPage();
  toggle(document).click();

  const reloaded = openPage({ storage });

  assertToggleShows(reloaded.document, true);
});

test('an unfavorited quote is not marked after a reload', () => {
  const { document, storage } = openPage();
  toggle(document).click();
  toggle(document).click();

  const reloaded = openPage({ storage });

  assertToggleShows(reloaded.document, false);
});

test('moving between quotes shows each quote’s own favorite state', () => {
  const { document } = openPage({ random: sequenceRandom([0, 0, 0]) });
  toggle(document).click(); // q01 is now a favorite

  byId(document, 'new-quote').click(); // q02
  assert.equal(byId(document, 'quote-text').textContent, 'Second quote.');
  assertToggleShows(document, false);

  byId(document, 'new-quote').click(); // excluding q02, random 0 → q01
  assert.equal(byId(document, 'quote-text').textContent, 'First quote.');
  assertToggleShows(document, true);
});

test('with no favorites, the list is empty and says so', () => {
  const { document } = openPage();

  assert.deepEqual(listedQuotes(document), []);
  assert.equal(byId(document, 'favorites-empty').hidden, false);
});

test('favoriting adds the quote with its author to the top of the list immediately', () => {
  const { document } = openPage();

  toggle(document).click(); // q01
  assert.deepEqual(listedQuotes(document), ['First quote. Author One Remove']);
  assert.equal(byId(document, 'favorites-empty').hidden, true);

  byId(document, 'new-quote').click(); // q02
  toggle(document).click();
  assert.deepEqual(listedQuotes(document), [
    'Second quote. Author Two Remove',
    'First quote. Author One Remove',
  ]);
});

test('the same favorites are listed in the same order after a reload', () => {
  const { document, storage } = openPage();
  toggle(document).click();
  byId(document, 'new-quote').click();
  toggle(document).click();
  const before = listedQuotes(document);

  const reloaded = openPage({ storage });

  assert.deepEqual(listedQuotes(reloaded.document), before);
});

test('removing the shown quote from the list also clears its mark', () => {
  const { document, storage } = openPage();
  toggle(document).click();

  removeButtons(document)[0].click();

  assert.deepEqual(listedQuotes(document), []);
  assertToggleShows(document, false);
  assert.deepEqual(savedIds(storage), []);
});

test('each Remove button is named after its quote', () => {
  const { document } = openPage();
  toggle(document).click();

  const [button] = removeButtons(document);

  assert.equal(button.textContent, 'Remove');
  assert.equal(button.getAttribute('aria-label'), 'Remove favorite: Author One — First quote.');
});

test('long quotes are shortened in the Remove button name', () => {
  const longQuote = { id: 'long', text: 'x'.repeat(60), author: 'Someone' };
  const storage = createFakeStorage();
  const store = createFavoritesStore(getStorageFor(storage), ['long']);
  const { document } = loadPage({ quotes: [longQuote], random: SHOW_FIRST, store });
  toggle(document).click();

  const label = removeButtons(document)[0].getAttribute('aria-label');

  assert.equal(label, `Remove favorite: Someone — ${'x'.repeat(40)}…`);
});

test('clicking a favorite in the list does not change the main quote', () => {
  const { document } = openPage();
  toggle(document).click(); // q01
  byId(document, 'new-quote').click(); // q02 shown

  byId(document, 'favorites-list').querySelector('li').click();

  assert.equal(byId(document, 'quote-text').textContent, 'Second quote.');
});

test('with storage blocked, the page works and warns that favorites will not be kept', () => {
  const { document } = openPage({ storage: createFakeStorage({ blocked: true }) });

  assert.notEqual(byId(document, 'quote-text').textContent, '');
  assert.equal(byId(document, 'storage-notice').hidden, false);

  byId(document, 'new-quote').click();
  assert.equal(byId(document, 'quote-text').textContent, 'Second quote.');

  toggle(document).click();
  assertToggleShows(document, true);
  assert.equal(listedQuotes(document).length, 1);
});

test('corrupt saved favorites load as none without showing the warning', () => {
  const storage = createFakeStorage({ initial: { [FAVORITES_KEY]: 'not json' } });

  const { document } = openPage({ storage });

  assert.deepEqual(listedQuotes(document), []);
  assert.equal(byId(document, 'storage-notice').hidden, true);
});

test('when saving starts failing, the change still applies and the warning stays', () => {
  const { document, storage } = openPage();
  assert.equal(byId(document, 'storage-notice').hidden, true);

  storage.setFailWrites(true);
  toggle(document).click();

  assertToggleShows(document, true);
  assert.equal(listedQuotes(document).length, 1);
  assert.equal(byId(document, 'storage-notice').hidden, false);

  storage.setFailWrites(false);
  toggle(document).click();
  assert.equal(byId(document, 'storage-notice').hidden, false);
});

test('saved favorites for quotes that no longer exist are not listed', () => {
  const saved = JSON.stringify({ version: 1, ids: ['gone', 'q02'] });
  const storage = createFakeStorage({ initial: { [FAVORITES_KEY]: saved } });

  const { document } = openPage({ storage });

  assert.deepEqual(listedQuotes(document), ['Second quote. Author Two Remove']);
});

test('favoriting every quote in the collection lists every one, newest first', () => {
  const { document } = openPage({ random: sequenceRandom([0, 0, 0.99]) });

  toggle(document).click(); // q01
  byId(document, 'new-quote').click(); // q02
  toggle(document).click();
  byId(document, 'new-quote').click(); // excluding q02, random 0.99 → q03
  toggle(document).click();

  assert.deepEqual(
    listedQuotes(document).map((entry) => entry.split('.')[0]),
    ['Third quote', 'Second quote', 'First quote'],
  );
  assert.equal(byId(document, 'quote-text').textContent, 'Third quote.');
});

test('rapid toggling leaves the toggle and the list in agreement', () => {
  const { document } = openPage();

  for (let click = 0; click < 10; click += 1) {
    toggle(document).click();
  }

  assertToggleShows(document, false);
  assert.deepEqual(listedQuotes(document), []);

  toggle(document).click();
  assertToggleShows(document, true);
  assert.equal(listedQuotes(document).length, 1);
});
