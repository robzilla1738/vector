# Status

Last updated 2026-10-19.

## Works (verified locally)

- Aside's daemon, CLI, both extensions, skills and helpers, rebranded to Aux, staged by `npm run vendor:aside`.
- `node scripts/aux.mjs` runs the daemon, the authenticated CDP gate and the browser. The extension bridge connects, the new tab page and side panel render with Aux artwork, and `aux exec` drives the browser (checked with `vercel-ai-gateway/meta/muse-spark-1.3-contributor`).
- `npm run package` installs `~/.local/bin/aux` and a self-contained `~/Applications/Aux.app` (browser, daemon, extensions, runtime and launcher scripts inside; the launcher needs `node` on PATH). Verified by launching the bundle from `/tmp` with every process running from inside it.
- Browser: Chromium 155 built with `chromium/flags.aside.gn` (`enable_aux_shell=false`), vertical tabs on by default.
- `chrome.asideAdblock` (`vendor/aside/shims/aux-adblock.js`): filter lists (the uBlock catalog from upstream) are fetched, parsed and applied as declarativeNetRequest dynamic rules. Verified: EasyList, uBO filters and EasyPrivacy compile to about 13.7k rules and block ad hosts on a real page. Cosmetic filters, scriptlets and options DNR cannot express (redirect, removeparam, csp, popup) are skipped, and the DNR dynamic rule cap (29k after collapsing `||domain^` rules) applies.
- `chrome.asideBrowserImport`: bookmarks and history from Chrome, Edge, Brave, Arc, Dia, Atlas and Comet profiles, read by the daemon bridge (history through `/usr/bin/sqlite3` on a snapshot). History enters through `chrome.history.addUrl`, so visit times and titles are not preserved. Verified by importing a Dia profile (30 bookmarks, 3000 history entries). Passwords, cookies and autofill are not imported (Keychain-encrypted).
- `chrome.asideOmnibox` (`aux-omnibox.js`): new tab page autocomplete from typed input, history, bookmarks, open tabs (Switch to Tab) and Google suggestions. Verified in the new tab UI.
- Tab search (Cmd+Shift+A and the sidebar footer button) opens Aside's own `tabsearch.html` in an extension popup (`0076`).


## Differences from Aside

- Sidebar: native Bookmarks, Chats and Tabs sections sit above Chromium's vertical tab strip, with a profile and tab-search footer pinned to the bottom (`0073-aux-sidebar-sections.patch`). Sections collapse from their headers. Chats come live from the daemon, the open chat is highlighted, and right-click offers Pin, Mark as read, Archive and Delete (Pin only for sessions the daemon allows). Pinned tabs keep Chromium's own layout inside the tab list: Aside's top tile grid would need Chromium's pinned container hidden and rebuilt, which breaks pin drag and drop. Still missing: the profile pill, Aside's glass (vibrancy) material and exact sizing. The footer profile button opens Chromium's profile menu, not Aside's.
- Omnibox and toolbar: Aux extension pages show their page title instead of the extension URL (`0074`). The app menu button is hidden (`0077`, the menu bar is the entry point) and Google's AI Mode is off by default (`0076`). The rest of the toolbar is stock Chromium: Aside's always-visible Downloads button and `aside://` display scheme are not reproduced.
- Product strings: Chromium's own UI text says Aux (`0075-aux-product-strings.patch`). Profiles created before that patch keep their stored name ("Your Chromium").
- `chrome.aside*` private APIs are JS shims (`vendor/aside/shims/`), not native. The mini popup window chrome is not native, and the Aside profile menu and icon picker are not reproduced.
- The new tab override registers after the extension loads, so the first tab can start on Chromium's Google page. The launcher detects that and navigates the tab to `chrome://newtab` once the extension is up.
- Local accounts only. There is no Aux cloud.
- The Computer Use helper's own windows still show Aside strings (binary text).
- The browser is an unsigned component build that lives in `~/Documents/Code/aux-chromium-security-155`. macOS asks for Documents access on first launch.

## Next

Native sidebar profile pill and pinned tile grid, vibrancy material, `aside://` omnibox scheme, Aside's profile menu and icon picker, native `chrome.aside*` APIs, a signed non-component build, and a Node-free launcher.

- Toolbar: Downloads is pinned by default (patch 0078).
