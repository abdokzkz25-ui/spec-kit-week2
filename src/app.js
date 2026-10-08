import { pickRandomQuote } from './quote-picker.js';
import { isFavorite, removeFavorite, toggleFavorite } from './favorites.js';

const TOGGLE_LABEL = { favorited: '★ Favorited', notFavorited: '☆ Favorite' };
const REMOVE_NAME_TEXT_LENGTH = 40;
const STORAGE_NOTICE_TEXT =
  "Favorites can't be saved in this browser and will be lost when you reload.";

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    quoteText: byId('quote-text'),
    quoteAuthor: byId('quote-author'),
    newQuoteButton: byId('new-quote'),
    favoriteToggle: byId('favorite-toggle'),
    favoritesHeading: byId('favorites-heading'),
    favoritesList: byId('favorites-list'),
    favoritesEmpty: byId('favorites-empty'),
    storageNotice: byId('storage-notice'),
  };
}

function removeButtonName(quote) {
  const shortText =
    quote.text.length > REMOVE_NAME_TEXT_LENGTH
      ? `${quote.text.slice(0, REMOVE_NAME_TEXT_LENGTH)}…`
      : quote.text;
  return `Remove favorite: ${quote.author} — ${shortText}`;
}

function createFavoriteItem(document, quote, onRemove) {
  const item = document.createElement('li');
  const text = document.createElement('p');
  const author = document.createElement('p');
  const removeButton = document.createElement('button');
  text.className = 'favorite-text';
  text.textContent = quote.text;
  author.className = 'favorite-author';
  author.textContent = quote.author;
  removeButton.type = 'button';
  removeButton.textContent = 'Remove';
  removeButton.setAttribute('aria-label', removeButtonName(quote));
  removeButton.addEventListener('click', () => onRemove(quote.id));
  item.append(text, author, removeButton);
  return item;
}

function renderQuote(elements, quote, favorited) {
  elements.quoteText.textContent = quote.text;
  elements.quoteAuthor.textContent = quote.author;
  elements.favoriteToggle.setAttribute('aria-pressed', String(favorited));
  elements.favoriteToggle.textContent = favorited
    ? TOGGLE_LABEL.favorited
    : TOGGLE_LABEL.notFavorited;
}

function renderFavorites(elements, favoriteQuotes, canSave, onRemove) {
  const document = elements.favoritesList.ownerDocument;
  const items = favoriteQuotes.map((quote) => createFavoriteItem(document, quote, onRemove));
  elements.favoritesList.replaceChildren(...items);
  elements.favoritesEmpty.hidden = items.length > 0;
  // Inserting text into the live region is what gets announced, so write it only when it changes.
  const noticeText = canSave ? '' : STORAGE_NOTICE_TEXT;
  if (elements.storageNotice.textContent !== noticeText) {
    elements.storageNotice.textContent = noticeText;
  }
  elements.storageNotice.hidden = canSave;
}

// The pressed Remove button is gone after re-rendering, so keep keyboard users in the list.
function focusAfterRemoval(elements, removedIndex) {
  const buttons = elements.favoritesList.querySelectorAll('button');
  const target = buttons[removedIndex] ?? buttons[removedIndex - 1] ?? elements.favoritesHeading;
  target.focus();
}

function createInitialState(quotes, random, store) {
  return {
    currentQuoteId: pickRandomQuote(quotes, random).id,
    favoriteIds: store.load(),
    canSave: store.canSave(),
  };
}

/**
 * Render the app into `document` and attach event handlers. Expects the markup
 * from index.html (see specs/001-quote-of-the-day/contracts/ui.md).
 */
export function startApp({ document, quotes, random, store }) {
  const elements = findElements(document);
  const quotesById = new Map(quotes.map((quote) => [quote.id, quote]));
  const state = createInitialState(quotes, random, store);

  function render() {
    const favorited = isFavorite(state.favoriteIds, state.currentQuoteId);
    renderQuote(elements, quotesById.get(state.currentQuoteId), favorited);
    const favoriteQuotes = state.favoriteIds.map((id) => quotesById.get(id));
    renderFavorites(elements, favoriteQuotes, state.canSave, removeFromList);
  }

  function removeFromList(id) {
    const removedIndex = state.favoriteIds.indexOf(id);
    updateFavorites(removeFavorite(state.favoriteIds, id));
    focusAfterRemoval(elements, removedIndex);
  }

  function updateFavorites(nextFavoriteIds) {
    state.favoriteIds = nextFavoriteIds;
    state.canSave = store.save(nextFavoriteIds) && state.canSave;
    render();
  }

  elements.newQuoteButton.addEventListener('click', () => {
    state.currentQuoteId = pickRandomQuote(quotes, random, state.currentQuoteId).id;
    render();
  });
  elements.favoriteToggle.addEventListener('click', () => {
    updateFavorites(toggleFavorite(state.favoriteIds, state.currentQuoteId));
  });

  render();
}
