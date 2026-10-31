# Proposed STATUS rewrite

For the integrator to apply to `docs/STATUS.md`, then delete this file. It replaces everything above `## Working loop (UI changes)`, plus the three later fixes below. Build numbers are as of 2026-10-31.

## Replacement top

```markdown
# Aux status

Last updated 2026-10-31. This is the single current-state page. The plan to 1.0 is the [finish plan](ROADMAP-EXECUTION-GRAPH.md), which overrides older plans where they disagree. Dated history through 2026-10-26 is in [archive/status-history-through-2026-10-26.md](archive/status-history-through-2026-10-26.md).

## Where things stand

**Latest: build <N>** (`out/release/1.0.0-<N>`), committed on local `main`. Build 137 is a diagnostic build, not for use. What was seen on screen, and what's open, is in [the review checklist](plans/2026-10-30-review-checklist.md) and the finish plan's nodes.

- **Product:** nearly everything in the [owner ledger](plans/2026-10-30-owner-requests.md) has been seen on screen. Spaces replace profiles, individual chats replace the home thread, local agent CLIs and API keys replace in-app sign-in, and macOS 15 is the floor.
- **Release path:** no official build has run, Sparkle isn't in the app, and Chromium is two milestones behind. Build 43 is the only notarized build.
- **Components:** builds use `release-addons-a1` with `release-state-root-a6`. The `a2`/`a7` pair changes the policy hash an existing home pinned, so that home refuses it (`docs/spec/native/macos-utilities.md` section 7).
- **Tests:** `pnpm test` is the full host suite. `pnpm test:ci` runs without `out/` and passed in a clean export on 2026-10-31 (221 Node tests plus the Python suites). CI on GitHub needs the next push to go green: the earlier "ready" claim covered only the Node half.
- **Hosted:** healthy, with `getaux.co` still on the old deployment until the site ships. See HOST-1 and WEB-1.
```

## Later fixes

1. In `### Repo and pipeline`, replace the "Local CI is ready" bullet with: "CI runs on Tartelet for `robzilla1738/vector` with three jobs (`scripts/ci/README.md`). It stayed red on the last pushes until BASE-2. `pnpm test:ci` covers the hermetic Node tests and all Python suites except `test_repair_combined.py`, which needs `out/`."
2. Replace the `Out of scope:` line with: "Out of scope for 1.0: in-app shell, ChatGPT sign-in, Widevine VMP, Firefox and Zen passwords, native Orion bookmarks, backups as a feature, mobile, payments, Aux-funded inference and a built-in Vault."
3. In step 3 of the working loop, keep the `a1` + `a6` text as it stands. The old line 13 that names `release-state-root-a7` goes away with the replacement top.
