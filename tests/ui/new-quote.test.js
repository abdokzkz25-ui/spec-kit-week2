import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPage, sequenceRandom, TEST_QUOTES } from '../helpers/load-page.js';

const RAPID_CLICKS = 20;

function quoteText(document) {
  return document.getElementById('quote-text').textContent;
}

function clickNewQuote(document) {
  document.getElementById('new-quote').click();
}

test('pressing "New quote" shows a different quote', () => {
  const { document } = loadPage({ quotes: TEST_QUOTES, random: () => 0 });
  const before = quoteText(document);

  clickNewQuote(document);

  assert.notEqual(quoteText(document), before);
});

test('pressing "New quote" updates the page without reloading it', () => {
  const { window, document } = loadPage({ quotes: TEST_QUOTES, random: () => 0 });
  const urlBefore = window.location.href;

  clickNewQuote(document);

  assert.equal(window.location.href, urlBefore);
  assert.equal(window.document, document);
});

test('every rapid press shows a quote different from the one before it', () => {
  const random = sequenceRandom([0, 0.99, 0.5, 0, 0.3, 0.7, 0.1]);
  const { document } = loadPage({ quotes: TEST_QUOTES, random });

  for (let press = 0; press < RAPID_CLICKS; press += 1) {
    const before = quoteText(document);
    clickNewQuote(document);
    assert.notEqual(quoteText(document), before, `press ${press + 1} repeated the quote`);
  }
});

test('with a single quote, pressing "New quote" keeps that quote without error', () => {
  const quotes = [TEST_QUOTES[0]];
  const { document } = loadPage({ quotes, random: () => 0.5 });

  clickNewQuote(document);

  assert.equal(quoteText(document), 'First quote.');
});

// Native, enabled buttons activate on Enter and Space; jsdom does not simulate that key behavior.
test('"New quote" is a native, enabled button named "New quote"', () => {
  const { document } = loadPage({ quotes: TEST_QUOTES, random: () => 0 });
  const button = document.getElementById('new-quote');

  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.type, 'button');
  assert.equal(button.disabled, false);
  assert.equal(button.textContent.trim(), 'New quote');
});
