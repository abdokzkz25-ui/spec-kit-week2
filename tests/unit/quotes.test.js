import { test } from 'node:test';
import assert from 'node:assert/strict';
import { QUOTES } from '../../src/quotes.js';

const MINIMUM_QUOTES = 10;

test('the collection has at least 10 quotes', () => {
  assert.ok(QUOTES.length >= MINIMUM_QUOTES, `only ${QUOTES.length} quotes`);
});

test('every quote id is unique', () => {
  const ids = QUOTES.map((quote) => quote.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every quote has non-empty, trimmed text', () => {
  for (const quote of QUOTES) {
    assert.ok(quote.text.length > 0, `${quote.id} has empty text`);
    assert.equal(quote.text, quote.text.trim(), `${quote.id} text is not trimmed`);
  }
});

test('every quote has a non-empty author', () => {
  for (const quote of QUOTES) {
    assert.ok(quote.author.trim().length > 0, `${quote.id} has no author`);
  }
});

test('the collection cannot be changed at runtime', () => {
  assert.ok(Object.isFrozen(QUOTES));
});
