import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFavoritesStore } from '../../src/favorites-store.js';
import { createFakeStorage, getStorageFor } from '../helpers/load-page.js';

const FAVORITES_KEY = 'quote-of-the-day:favorites';
const PROBE_KEY = 'quote-of-the-day:probe';
const KNOWN_IDS = ['q01', 'q02', 'q03'];

function storeWith(savedValue, options = {}) {
  const initial = savedValue === undefined ? {} : { [FAVORITES_KEY]: savedValue };
  const storage = createFakeStorage({ initial, ...options });
  return { storage, store: createFavoritesStore(getStorageFor(storage), KNOWN_IDS) };
}

test('loads no favorites when nothing has been saved', () => {
  assert.deepEqual(storeWith(undefined).store.load(), []);
});

test('loads no favorites when saved data is corrupt or has the wrong shape', () => {
  const badValues = [
    'not json',
    '"q01"',
    '[]',
    'null',
    JSON.stringify({ version: 2, ids: ['q01'] }),
    JSON.stringify({ version: 1, ids: 'q01' }),
  ];
  for (const value of badValues) {
    assert.deepEqual(storeWith(value).store.load(), [], `saved value ${value}`);
  }
});

test('loads saved favorites in order, dropping unknown, non-string, and duplicate ids', () => {
  const saved = JSON.stringify({ version: 1, ids: ['q02', 'q99', 5, 'q01', 'q02'] });

  assert.deepEqual(storeWith(saved).store.load(), ['q02', 'q01']);
});

test('saving writes the versioned format under the favorites key', () => {
  const { storage, store } = storeWith(undefined);

  assert.equal(store.save(['q03', 'q01']), true);
  assert.equal(storage.getItem(FAVORITES_KEY), '{"version":1,"ids":["q03","q01"]}');
});

test('saving an empty list writes an empty ids array', () => {
  const { storage, store } = storeWith(undefined);

  store.save([]);

  assert.equal(storage.getItem(FAVORITES_KEY), '{"version":1,"ids":[]}');
});

test('the save-ability probe leaves no key behind', () => {
  const { storage } = storeWith(undefined);

  assert.equal(storage.getItem(PROBE_KEY), null);
  assert.deepEqual(storage.keys(), []);
});

test('when storage is blocked, nothing throws and saving is reported as unavailable', () => {
  const { store } = storeWith(undefined, { blocked: true });

  assert.deepEqual(store.load(), []);
  assert.equal(store.save(['q01']), false);
  assert.equal(store.canSave(), false);
});

test('when writes fail from the start, saving is reported as unavailable', () => {
  const { store } = storeWith(undefined, { failWrites: true });

  assert.equal(store.canSave(), false);
  assert.equal(store.save(['q01']), false);
});

test('when writes start failing later, saving becomes and stays unavailable', () => {
  const { storage, store } = storeWith(undefined);
  assert.equal(store.canSave(), true);

  storage.setFailWrites(true);
  assert.equal(store.save(['q01']), false);
  assert.equal(store.canSave(), false);

  storage.setFailWrites(false);
  store.save(['q02']);
  assert.equal(store.canSave(), false);
});

test('corrupt saved data alone does not make saving unavailable', () => {
  assert.equal(storeWith('not json').store.canSave(), true);
});
