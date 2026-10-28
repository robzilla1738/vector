# Chromium security updates

Aux follows Chrome stable security releases. Each update rebases `chromium/tree/` onto the new stable tag in a fresh checkout, rebuilds, reseals and ships as a Sparkle update once Robert approves publishing it. Measure steps in builds, not calendar time.

The durable checkout (`/Users/rcourson/Documents/Vibe/aux-chromium-durable/snapshot-20261023/src`) holds owner work and is never rebased, reset or used as the target. `scripts/chromium-rebase.py` refuses it, anything inside it or containing it, and whatever `AUX_CHROMIUM_SRC` names.

## 1. Fresh checkout

Make a separate checkout with `depot_tools` (from `aux-chromium-durable/depot_tools`), for example `/Users/rcourson/Documents/Vibe/aux-chromium-rebase-<version>/`:

```sh
mkdir aux-chromium-rebase-<version> && cd aux-chromium-rebase-<version>
fetch --nohooks --no-history chromium
```

## 2. Check, then apply

```sh
python3 scripts/chromium-rebase.py <fresh>/src <new-tag> --dry-run   # tag must already be fetched
python3 scripts/chromium-rebase.py <fresh>/src <new-tag>
```

- `--dry-run` replays `chromium/tree/aux.patch` onto the tag in a temporary Git index with `git apply --cached --3way` and checks the archive's new files against the tag. HEAD, the index and working files are untouched; Git may add loose objects.
- The real run fetches the tag and the current base commit (`manifest.json` `base`; 3-way merges need its blobs), refuses a checkout with local changes, checks out the tag detached, runs `git apply --3way --binary`, then extracts `added.tar.gz` except paths upstream now also has. If any path cannot be applied at all, Git applies nothing and nothing is extracted.

The JSON report groups every problem by area:

| Area | What lands there | How to resolve |
|---|---|---|
| `aux-owned` | Files the tree adds, paths named `aux*`, and archive paths upstream now also has (`exists upstream`) | Usually Aux code calling an API that moved: port it. An `exists upstream` path means upstream added a file at an Aux path; rename the Aux one |
| `branding` | Strings (`.grd`, `.grdp`, `.xtb`), product art, `chrome/app/theme`, `Info.plist`, installer files | Re-apply the Aux names and art on top of upstream's change; keep branding and platform edits in separate commits |
| `platform` | Edits to upstream code (hooks in `browser_view.cc`, `chrome_content_browser_client.cc` and so on) | Re-place the hook; prefer a smaller hook if upstream restructured |

Each entry has a `kind`: `conflict` (3-way merge left markers), `failed` (could not apply, for example upstream deleted the file) or `exists upstream`. Exit status is 1 while anything remains.

## 3. Build, export, reseal

The script prints these steps after a real run:

1. Resolve conflicts (Aux-owned first, then branding, then platform).
2. `gclient sync -D --with_branch_heads --with_tags` in the fresh checkout.
3. Update every pinned version: `chromium/version.txt`, `base.json` (written by the export), and the `Versions/155.0.8059.85` Framework paths in `scripts/` (`git grep -l 155.0.8059.85 -- scripts vendor chromium`).
4. Build `out/AuxFast` with `chromium/flags.aux.gn` through `python3 scripts/native-build.py autoninja -C <fresh>/src/out/AuxFast chrome`. One native build at a time.
5. `python3 scripts/chromium-tree.py export <fresh>/src chromium/tree --new-base`, and record the printed `manifestSha256` in the build receipt.
6. Reseal. The same-scope repair executor only re-signs the approved 155.0.8059.85 targets, so a new Chromium version needs a new signing review, or the Developer ID release signing from the release plan. Set `chromiumTreeManifestSha256` in `current-source-selection.json` and run `python3 scripts/verify-candidate.py`.
7. Focused checks: `pnpm test`, startup, Quit, abort and relaunch, split restore, palette, sign-in, and the Sparkle update from the previous build with the daemon running and a task active.
8. Ship it as a Sparkle update only after Robert approves publishing it.

The durable checkout moves to the new version only by replacing it with the rebuilt checkout, and only with Robert's yes, since it holds owner work.

## Status

`chromium-rebase.py` and its grouping are tested on a synthetic repository (`scripts/test_chromium_rebase.py`). No real rebase has run yet. The first one (155.0.8059.85 to the current stable) waits for the Phase 7 clean apply and build.
