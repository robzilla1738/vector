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

- Sidebar: native pinned tile grid (three per row), Bookmarks, Chats and Tabs sections above Chromium's vertical tab strip (`0073`, `0079`). The header is Aside's purple agent pill (opens the chat list) and the sidebar toggle. The footer has the profile avatar with chevron, profile pager dots (when there is more than one profile) and tab search. Sections collapse from their headers. Chats come live from the daemon, the open chat is highlighted, and right-click offers Pin, Mark as read, Archive and Delete (Pin only for sessions the daemon allows). Pinned tiles right-click to Reload, Duplicate, Unpin and Close. Tiles drag to reorder (verified). The sidebar is 282pt wide like Aside (`0081`). Chromium's own pinned container is kept empty, so dragging a tab into the grid to pin it is not supported.
- Ctrl-Tab opens a most-recently-used tab switcher panel (up to nine tabs) that commits when Ctrl is released (`0082`). Verified live: the panel shows while Ctrl is held and activates the highlighted tab on release. Chrome routes the chord through the browser action manager, so the action bodies call the switcher directly.
- Look: a neutral grey dark palette (frame and sidebar `#2d2d2d`, toolbar and page `#1b1b1b`) replaces Chromium's blue-tinted one (`0084`, `ui/color/sys_color_mixer.cc`). Sidebar rows use 13pt text with 12pt captions, the close X shows only on hover, and the sidebar toggle uses Aside's panel icon. The toolbar has no dividers and ends with Downloads then Extensions. The sidebar is opaque, where Aside's is translucent.
- Profile menu: Aside's panel (profiles with check and Edit/Delete, New profile, Bookmarks, Downloads, Extensions, History and Developers submenus, Settings, New Tab, Incognito Window). Edit opens a native icon picker (16 icons and a name field, stored in the `aux.profile_icons` local state pref, `0083`).
- Ad blocking: whole-page blocks (`$document`, `$all`) show Aux's "Aux blocked this page" interstitial with Go back and Continue once (`vendor/aside/shims/aux-blocked.*`).
- Window material: Chromium's glass frame (macOS vibrancy) is on by default (`0080`). The toolbar has no avatar button for regular profiles.
- Omnibox and toolbar: Aux extension pages show their page title instead of the extension URL (`0074`). The app menu button is hidden (`0077`, the menu bar is the entry point), Google's AI Mode is off by default (`0076`) and Downloads is pinned to the toolbar (`0078`). On the new tab page the omnibox is empty and unfocused with a magnifier and "Ask Google or type a URL" (`0085`), and there is no bookmark star. Typing or showing built-in pages uses `aux://` (for example `aux://settings`) in the omnibox and its built-in provider. History and search suggestion rows still show `chrome://`.
- Product strings: Chromium's own UI text says Aux (`0075-aux-product-strings.patch`). Profiles created before that patch keep their stored name ("Your Chromium").
- `chrome.aside*` private APIs are JS shims (`vendor/aside/shims/`), not native. The mini popup window chrome is not native, and Aside's update badge is not reproduced.
- The new tab override registers after the extension loads, so the first tab can start on Chromium's Google page. The launcher detects that and navigates the tab to `chrome://newtab` once the extension is up.
- Local accounts only. There is no Aux cloud.
- The Computer Use helper's own windows still show Aside strings (binary text).
- The browser is an unsigned component build that lives in `~/Documents/Code/aux-chromium-security-155`. macOS asks for Documents access on first launch.

## Next

`aux://` in history and suggestion rows, translucent sidebar, native `chrome.aside*` APIs, exact row sizing against Aside, a signed non-component build, and a Node-free launcher.
