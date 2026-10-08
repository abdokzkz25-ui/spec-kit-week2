// Favorites are quote ids ordered most recently favorited first. Functions never mutate inputs.

export function isFavorite(favoriteIds, quoteId) {
  return favoriteIds.includes(quoteId);
}

export function removeFavorite(favoriteIds, quoteId) {
  return favoriteIds.filter((id) => id !== quoteId);
}

export function toggleFavorite(favoriteIds, quoteId) {
  return isFavorite(favoriteIds, quoteId)
    ? removeFavorite(favoriteIds, quoteId)
    : [quoteId, ...favoriteIds];
}

/** Clean saved ids: keep known string ids only, first occurrence wins. */
export function normalizeFavoriteIds(rawIds, knownIds) {
  if (!Array.isArray(rawIds)) {
    return [];
  }
  const known = new Set(knownIds);
  const valid = rawIds.filter((id) => typeof id === 'string' && known.has(id));
  return [...new Set(valid)];
}
