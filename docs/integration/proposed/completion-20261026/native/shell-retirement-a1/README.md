# shell-retirement-a1

The retired Aux shell (`enable_aux_shell`, `ENABLE_AUX_SHELL`, `ENABLE_AUX_RESULT_SCHEME`, `ENABLE_AUX_ISOLATED_WORLDS`) is removed from the durable checkout. Applied in place with `scripts/propose-shell-retirement.py --tree … --paths paths.txt --patch cleanup.patch`:

- every `#if` on a retired flag keeps only its shell-off branch; a mixed condition such as `ENABLE_AUX_BROWSER || ENABLE_AUX_SHELL` becomes `ENABLE_AUX_BROWSER`;
- GN `if (enable_aux_shell)` blocks are removed and the argument is gone; remaining legacy asserts read `false`;
- each changed C++ file is checked against the original with `/usr/bin/unifdef -k`: both reduce to the same tokens in the shell-off configuration (raw strings are emptied identically on both sides, since unifdef cannot parse them).

All 96 files changed; no retired-flag reference remains. `chrome/browser/ui/aux` is not shell-only (the browser uses its page identity, for example), so files are deleted only once no build target references them.

## Unbuilt sources removed

After retirement, 128 of the 146 `.cc`/`.mm` files under `chrome/browser/ui/aux` and `chrome/browser/ui/webui_browser` had no object in the `out/AuxFast` build graph (`unbuilt-sources.txt`), and `ui/aux/BUILD.gn` was loaded by nothing. With the owner's go-ahead (2026-10-27), 468 files were deleted (`deleted-paths.txt`): everything in `chrome/browser/ui/aux` except `page_identity.{cc,h}` (built by `chrome/browser/aux:page_identity`), including the unused `semantic/` JavaScript tree, plus the four unbuilt `aux_*` files in `webui_browser`. Each was confirmed unincluded by live code, tracked or untracked. The earlier `chromium/tree` export keeps them recoverable.
