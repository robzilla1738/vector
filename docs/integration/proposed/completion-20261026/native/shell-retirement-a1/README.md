# shell-retirement-a1

The retired Aux shell (`enable_aux_shell`, `ENABLE_AUX_SHELL`, `ENABLE_AUX_RESULT_SCHEME`, `ENABLE_AUX_ISOLATED_WORLDS`) is removed from the durable checkout. Applied in place with `scripts/propose-shell-retirement.py --tree … --paths paths.txt --patch cleanup.patch`:

- every `#if` on a retired flag keeps only its shell-off branch; a mixed condition such as `ENABLE_AUX_BROWSER || ENABLE_AUX_SHELL` becomes `ENABLE_AUX_BROWSER`;
- GN `if (enable_aux_shell)` blocks are removed and the argument is gone; remaining legacy asserts read `false`;
- each changed C++ file is checked against the original with `/usr/bin/unifdef -k`: both reduce to the same tokens in the shell-off configuration (raw strings are emptied identically on both sides, since unifdef cannot parse them).

All 96 files changed; no retired-flag reference remains. `chrome/browser/ui/aux` is not shell-only (the browser uses its page identity, for example), so files are deleted only once no build target references them.

## Unbuilt sources (deletion waits for the owner)

After retirement, 128 of the 146 `.cc`/`.mm` files under `chrome/browser/ui/aux` and `chrome/browser/ui/webui_browser` have no object anywhere in the `out/AuxFast` build graph (`unbuilt-sources.txt`, from `ninja -t targets all`). Their BUILD entries sit in targets nothing depends on. Removing them, the headers only they include, and those targets is a bulk delete in the owner's checkout, so it waits for the owner's go-ahead; the `chromium/tree` export keeps every file recoverable.
