import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, TEST_QUOTES } from '../helpers/load-page.js';

function displayedQuote(document) {
  return {
    text: document.getElementById('quote-text').textContent,
    author: document.getElementById('quote-author').textContent,
  };
}

test('opening the page shows exactly one quote with its author', () => {
  const { document } = loadPage({ quotes: TEST_QUOTES, random: () => 0 });

  assert.deepEqual(displayedQuote(document), { text: 'First quote.', author: 'Author One' });
  assert.equal(document.querySelectorAll('#quote-text').length, 1);
});

test('different random values show different quotes across visits', () => {
  const shown = [0, 0.4, 0.8].map(
    (value) => displayedQuote(loadPage({ quotes: TEST_QUOTES, random: () => value }).document).text,
  );

  assert.equal(new Set(shown).size, 3);
});

test('a quote with no known author shows "Unknown"', () => {
  const { document } = loadPage({ quotes: TEST_QUOTES, random: () => 0.9 });

  assert.equal(displayedQuote(document).author, 'Unknown');
});

test('a long quote is shown in full', () => {
  const longText = 'Long words and long sentences. '.repeat(20).trim();
  const quotes = [{ id: 'long', text: longText, author: 'Someone' }];

  const { document } = loadPage({ quotes, random: () => 0 });

  assert.equal(displayedQuote(document).text, longText);
});
