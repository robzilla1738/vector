# chrome.tabGroups

Read-only. You can look at the user's tab groups but not change them, since raw group edits would alter their own browser session.

| Method | Arguments |
|---|---|
| `chrome.tabGroups.query(queryInfo)` | `queryInfo: { collapsed?: boolean; color?: string; title?: string; windowId?: number }` |
| `chrome.tabGroups.get(groupId)` | `groupId: number` |
