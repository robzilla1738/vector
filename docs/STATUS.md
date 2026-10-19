# Status

Last updated 2026-10-19.

## Works (verified locally)

- Aside's daemon, CLI, both extensions, skills and helpers, rebranded to Aux, staged by `npm run vendor:aside`.
- `node scripts/aux.mjs` runs the daemon, the authenticated CDP gate and the browser. The extension bridge connects, the new tab page and side panel render with Aux artwork, and `aux exec` drives the browser (checked with `vercel-ai-gateway/meta/muse-spark-1.3-contributor`).
- `npm run package` installs `~/.local/bin/aux` and `~/Applications/Aux.app` (a launcher for this checkout).
- Browser: Chromium 155 built with `chromium/flags.aside.gn` (`enable_aux_shell=false`), vertical tabs on by default.

## Differences from Aside

- Sidebar: native Bookmarks, Chats (live from the daemon, active chat highlighted, New Chat, Show all) and Tabs sections sit above Chromium's vertical tab strip (`0073-aux-sidebar-sections.patch`). Still missing against Aside: pinned tile grid, profile pill and bottom avatar/search bar, chat row actions (pin, archive, mark read), section collapse, Aside's exact glass material and sizing.
- `chrome.aside*` private APIs are JS shims (`vendor/aside/shims/aux-private-shim.js`), not native. Omnibox, adblock, mini popup window chrome and the importer WebUI are not native.
- Local accounts only. There is no Aux cloud.
- The Computer Use helper's own windows still show Aside strings (binary text).
- The browser is an unsigned component build that lives in `~/Documents/Code/aux-chromium-security-155`. macOS asks for Documents access on first launch.

## Next

Remaining sidebar parts, native toolbar/omnibox parity, native `chrome.aside*` APIs, a signed non-component build, `Aux.app` assembly with the browser, daemon and CLI inside one bundle.
