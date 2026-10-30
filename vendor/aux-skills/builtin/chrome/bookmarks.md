# chrome.bookmarks

The user's bookmarks. Read and write.

| Method | Arguments |
|---|---|
| `chrome.bookmarks.get(idOrIdList)` | `idOrIdList: string \| string[]` |
| `chrome.bookmarks.getChildren(id)` | `id: string` |
| `chrome.bookmarks.getRecent(numberOfItems)` | `numberOfItems: number` |
| `chrome.bookmarks.getSubTree(id)` | `id: string` |
| `chrome.bookmarks.getTree()` | none |
| `chrome.bookmarks.search(query)` | `query: string \| { query?: string; url?: string; title?: string }` |
| `chrome.bookmarks.create(bookmark)` | `bookmark: { parentId?: string; index?: number; title?: string; url?: string }` |
| `chrome.bookmarks.update(id, changes)` | `id: string`, `changes: { title?: string; url?: string }` |
| `chrome.bookmarks.move(id, destination)` | `id: string`, `destination: { parentId?: string; index?: number }` |
| `chrome.bookmarks.remove(id)` | `id: string` |
| `chrome.bookmarks.removeTree(id)` | `id: string` |
