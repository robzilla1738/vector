# chrome.tabs

Read-only: use it to see what's in the tab strip. Raw tab edits aren't available because they would alter the user's own browser session.

- Open and close tabs with `openTab(url)` and `closeTab(page)`.
- Work inside a page with `page.goto()`, `page.click()` or locator methods. If the attached page is a tab you borrowed from the user, these still change what that tab shows.

| Method | Arguments |
|---|---|
| `chrome.tabs.query(queryInfo)` | `queryInfo: { active?: boolean; currentWindow?: boolean; windowId?: number; url?: string \| string[]; title?: string; pinned?: boolean; audible?: boolean; discarded?: boolean; groupId?: number; index?: number }` |
| `chrome.tabs.get(tabId)` | `tabId: number` |
