import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFavorite,
  normalizeFavoriteIds,
  removeFavorite,
  toggleFavorite,
} from '../../src/favorites.js';

const KNOWN_IDS = ['q01', 'q02', 'q03'];

test('toggling a non-favorite adds it to the front', () => {
  assert.deepEqual(toggleFavorite(['q02'], 'q01'), ['q01', 'q02']);
});

test('toggling an existing favorite removes it', () => {
  assert.deepEqual(toggleFavorite(['q01', 'q02'], 'q01'), ['q02']);
});

test('unfavoriting and favoriting again moves the quote to the front', () => {
  const unfavorited = toggleFavorite(['q01', 'q02', 'q03'], 'q03');
  assert.deepEqual(toggleFavorite(unfavorited, 'q03'), ['q03', 'q01', 'q02']);
});

test('removing a favorite drops it and ignores ids that are not favorites', () => {
  assert.deepEqual(removeFavorite(['q01', 'q02'], 'q02'), ['q01']);
  assert.deepEqual(removeFavorite(['q01'], 'q09'), ['q01']);
});

test('isFavorite reports whether a quote is a favorite', () => {
  assert.equal(isFavorite(['q01'], 'q01'), true);
  assert.equal(isFavorite(['q01'], 'q02'), false);
});

test('toggle and remove never change the array they are given', () => {
  const favorites = Object.freeze(['q01', 'q02']);

  assert.doesNotThrow(() => toggleFavorite(favorites, 'q03'));
  assert.doesNotThrow(() => toggleFavorite(favorites, 'q01'));
  assert.doesNotThrow(() => removeFavorite(favorites, 'q02'));
  assert.deepEqual(favorites, ['q01', 'q02']);
});

test('saved favorites that are not an array load as no favorites', () => {
  for (const raw of [undefined, null, 'q01', 42, { ids: ['q01'] }]) {
    assert.deepEqual(normalizeFavoriteIds(raw, KNOWN_IDS), [], `raw value ${JSON.stringify(raw)}`);
  }
});

test('saved favorites drop non-string and unknown ids', () => {
  assert.deepEqual(normalizeFavoriteIds(['q02', 7, null, 'q99', 'q01'], KNOWN_IDS), ['q02', 'q01']);
});

test('saved favorites drop duplicates, keeping the most recent (first) occurrence', () => {
  assert.deepEqual(normalizeFavoriteIds(['q03', 'q01', 'q03', 'q01'], KNOWN_IDS), ['q03', 'q01']);
});
