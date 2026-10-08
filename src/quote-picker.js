/**
 * Pick a quote uniformly at random, never returning the quote with `excludeId`
 * unless it is the only quote. `random` returns a number in [0, 1).
 */
export function pickRandomQuote(quotes, random, excludeId = null) {
  if (quotes.length === 0) {
    throw new Error('Cannot pick a quote from an empty collection');
  }
  const excludedIndex = quotes.findIndex((quote) => quote.id === excludeId);
  if (excludedIndex === -1 || quotes.length === 1) {
    return quotes[Math.floor(random() * quotes.length)];
  }
  // Draw from the other n - 1 quotes and step over the excluded one, so one draw always differs.
  const index = Math.floor(random() * (quotes.length - 1));
  return quotes[index >= excludedIndex ? index + 1 : index];
}
