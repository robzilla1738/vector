# Status

Last updated 2026-10-19.

## Works (verified locally)

- Aside's daemon, CLI, both extensions, skills and helpers, rebranded to Aux, staged by `npm run vendor:aside`.
- `node scripts/aux.mjs` runs the daemon, the authenticated CDP gate and the browser. The extension bridge connects, the new tab page and side panel render with Aux artwork, and `aux exec` drives the browser (checked with `vercel-ai-gateway/meta/muse-spark-1.3-contributor`).
- `npm run package` installs `~/.local/bin/aux` and `~/Applications/Aux.app` (a launcher for this checkout).
- Browser: Chromium 155 built with `chromium/flags.aside.gn` (`enable_aux_shell=false`), vertical tabs on by default.

## Differences from Aside

- Sidebar: native Bookmarks, Chats and Tabs sections sit above Chromium's vertical tab strip, with a profile and tab-search footer pinned to the bottom (`0073-aux-sidebar-sections.patch`). Sections collapse from their headers. Chats come live from the daemon, the open chat is highlighted, and right-click offers Pin, Mark as read, Archive and Delete (Pin only for sessions the daemon allows). Pinned tabs keep Chromium's own layout inside the tab list: Aside's top tile grid would need Chromium's pinned container hidden and rebuilt, which breaks pin drag and drop. Still missing: the profile pill and Aside's exact glass material and sizing. The footer profile button opens Chromium's profile menu, not Aside's.
- Omnibox: Aux extension pages show their page title instead of the extension URL (`0074-aux-omnibox-page-title.patch`). The rest of the toolbar is stock Chromium.
- Product strings: Chromium's own UI text says Aux (`0075-aux-product-strings.patch`). Profiles created before that patch keep their stored name ("Your Chromium").
- `chrome.aside*` private APIs are JS shims (`vendor/aside/shims/aux-private-shim.js`), not native. Not provided at all: `chrome.asideOmnibox` (the extension's own autocomplete; calls are optional so the UI degrades quietly), `chrome.asideAdblock` (the Adblock settings section stays hidden) and a working importer (onboarding says import is unavailable). The mini popup window chrome is not native.
- The very first tab at startup can render Chromium's Google new tab page because it navigates before the unpacked extensions load. Every later new tab opens the Aux new tab page.
- Local accounts only. There is no Aux cloud.
- The Computer Use helper's own windows still show Aside strings (binary text).
- The browser is an unsigned component build that lives in `~/Documents/Code/aux-chromium-security-155`. macOS asks for Documents access on first launch.

## Next

Remaining sidebar parts (pinned tiles, profile pill), toolbar styling, tab switcher, tab search bubble, profile menu and icon picker, importer, adblock, native `chrome.aside*` APIs, a signed non-component build, `Aux.app` assembly with the browser, daemon and CLI inside one bundle.
