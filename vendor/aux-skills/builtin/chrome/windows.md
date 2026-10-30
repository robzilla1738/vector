# chrome.windows

Read-only. You can inspect windows but not change them, since raw window edits would alter the user's own browser session.

`queryOptions` is always optional: `{ populate?: boolean; windowTypes?: string[] }`.

| Method | Arguments |
|---|---|
| `chrome.windows.get(windowId, queryOptions?)` | `windowId: number` |
| `chrome.windows.getCurrent(queryOptions?)` | none required |
| `chrome.windows.getLastFocused(queryOptions?)` | none required |
| `chrome.windows.getAll(queryOptions?)` | none required |
