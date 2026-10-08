# Contract: Favorites Storage

The only persisted data in the app. Owned exclusively by `src/favorites-store.js` (Principle IV).

## Location

- **Mechanism**: `window.localStorage` (per browser, per origin).
- **Key**: `quote-of-the-day:favorites`
- **Probe key** (written and removed at startup to test save ability):
  `quote-of-the-day:probe`

## Value (version 1)

UTF-8 JSON string:

```json
{
  "version": 1,
  "ids": ["q07", "q02", "q11"]
}
```

| Field   | Type     | Rules |
|---------|----------|-------|
| version | number   | Must be `1`. Any other value → treated as no favorites. |
| ids     | string[] | Quote ids, most recently favorited first, no duplicates. |

## Reading

Reading never throws and never shows the can't-save notice. These all load as an empty list:
key absent, `localStorage` inaccessible, invalid JSON, wrong shape, wrong version. Unknown or
non-string ids and duplicates are dropped individually (see
[data-model.md](../data-model.md#favorites)).

## Writing

- The whole value is rewritten after every change (toggle or remove).
- A write that throws (blocked storage, `QuotaExceededError`, `SecurityError`) does not
  propagate: the store reports failure, the app keeps the change in memory, and the can't-save
  notice is shown.
- The app never deletes the key; an empty list is written as `{"version": 1, "ids": []}`.

## Compatibility

Quote ids are permanent. Removing a quote from the collection leaves its id in old saved data,
where it is ignored on the next load and dropped on the next write. A future format change MUST
bump `version` and handle (or deliberately discard) version 1 data.
