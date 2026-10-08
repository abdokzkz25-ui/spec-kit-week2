import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickRandomQuote } from '../../src/quote-picker.js';

const QUOTES = [
  { id: 'a', text: 'A', author: 'X' },
  { id: 'b', text: 'B', author: 'X' },
  { id: 'c', text: 'C', author: 'X' },
  { id: 'd', text: 'D', author: 'X' },
];
const EDGE_RANDOM_VALUES = [0, 0.25, 0.5, 0.75, 0.999999];

test('picks the quote at floor(random * count) when nothing is excluded', () => {
  assert.equal(pickRandomQuote(QUOTES, () => 0).id, 'a');
  assert.equal(pickRandomQuote(QUOTES, () => 0.5).id, 'c');
  assert.equal(pickRandomQuote(QUOTES, () => 0.999999).id, 'd');
});

test('never returns the excluded quote when other quotes exist', () => {
  for (const excluded of QUOTES) {
    for (const value of EDGE_RANDOM_VALUES) {
      const picked = pickRandomQuote(QUOTES, () => value, excluded.id);
      assert.notEqual(picked.id, excluded.id, `random ${value} returned excluded ${excluded.id}`);
    }
  }
});

test('can reach every other quote when one is excluded', () => {
  const reached = new Set(
    EDGE_RANDOM_VALUES.map((value) => pickRandomQuote(QUOTES, () => value, 'b').id),
  );
  assert.deepEqual([...reached].sort(), ['a', 'c', 'd']);
});

test('returns the only quote even when it is excluded', () => {
  const single = [QUOTES[0]];
  assert.equal(pickRandomQuote(single, () => 0.7, 'a').id, 'a');
});

test('throws when the collection is empty', () => {
  assert.throws(() => pickRandomQuote([], () => 0));
});
