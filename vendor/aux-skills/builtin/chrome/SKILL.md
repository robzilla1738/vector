---
name: chrome
description: 'Read this when you need to use Chrome extension APIs: managing bookmarks, tabs, windows, tab groups, history, downloads, or top sites.'
icon: "/builtin-skills/v1/chrome.jpg"
---

# Chrome extension APIs

The `chrome` global in the REPL exposes an allowlisted set of Chrome MV3 methods. Names and positional arguments are the same as in extension code.

```js
const tabs = await chrome.tabs.query({});
const bookmark = await chrome.bookmarks.create({ title: 'Aux', url: 'https://getaux.co' });
```

You can call only the methods these files list. `chrome.*` is for browser-profile state: bookmarks, tabs, windows, history, downloads and top sites. To work with a page itself, use Auxwright (`page`, `locator`, `snapshot`, `openTab`).

## Read the file for the API you need

| API | File |
|---|---|
| Bookmarks | `./bookmarks.md` |
| Tabs | `./tabs.md` |
| Windows | `./windows.md` |
| Tab groups | `./tab-groups.md` |
| History | `./history.md` |
| Downloads | `./downloads.md` |
| Top sites | `./top-sites.md` |
