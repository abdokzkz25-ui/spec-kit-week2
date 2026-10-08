// The only module that touches browser storage. Nothing here ever throws: storage can be
// blocked, full, or hold corrupt data, and the page must keep working (Principle V).
import { normalizeFavoriteIds } from './favorites.js';

const FAVORITES_KEY = 'quote-of-the-day:favorites';
const PROBE_KEY = 'quote-of-the-day:probe';
const FORMAT_VERSION = 1;

function openStorage(getStorage) {
  try {
    // Reading window.localStorage itself throws when site data is blocked.
    return getStorage();
  } catch {
    return null;
  }
}

function probeWritable(storage) {
  try {
    storage.setItem(PROBE_KEY, PROBE_KEY);
    storage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

function readSavedIds(storage) {
  try {
    const saved = JSON.parse(storage.getItem(FAVORITES_KEY));
    return saved?.version === FORMAT_VERSION ? saved.ids : [];
  } catch {
    return [];
  }
}

/**
 * @param getStorage () => Storage, e.g. () => window.localStorage
 * @param knownIds ids of the quotes in the collection; any other saved id is ignored
 */
export function createFavoritesStore(getStorage, knownIds) {
  const storage = openStorage(getStorage);
  let writable = storage !== null && probeWritable(storage);

  return {
    load() {
      return storage === null ? [] : normalizeFavoriteIds(readSavedIds(storage), knownIds);
    },
    save(ids) {
      if (storage === null) {
        return false;
      }
      try {
        storage.setItem(FAVORITES_KEY, JSON.stringify({ version: FORMAT_VERSION, ids }));
        return true;
      } catch {
        writable = false;
        return false;
      }
    },
    canSave() {
      return writable;
    },
  };
}
