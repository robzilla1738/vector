# release-state-root-a8

The 1.0 daemon. It carries three changes, relinked from the `release-state-root-a7` recipes with `scripts/candidate/relink_daemon.py`. `a7` already has the `release-addons-a2` add-on pins (decision 19), so `a8` is the same pair plus the two changes below. `source/` holds each changed file with only these edits.

Output: `out/live-inputs/completion-20261026/release-state-root-a8/Aux Daemon`. A build needs `a8`, `release-addons-a2`, `release-memory-a1` and the browser's a2 constants together.

## aux-memory

Apple rejected the seeded `memory-distribution` binary (unsigned). Signing it during assembly is wrong: a timestamped signature differs every time, and build 43 lost memory that way.

`out/live-inputs/completion-20261026/release-memory-a1` holds one fixed copy of Aux's own helper (`apps/memory-helper/build.sh`), signed once with Developer ID, hardened runtime, a secure timestamp and identifier `dev.aux.browser.memory`, plus `pins.json`, its zstd form and `memory-helper.o`. It is the same code as the helper the daemon launches. Never re-sign it: `3d2bc19a…` is compiled into the daemon.

| Link | Where | Now |
|---|---|---|
| Binary | `memory-runtimes/<key>/<generation>/aux-memory` | `3d2bc19a…`, 995,312 bytes |
| Descriptor | `runtime.json`, whose SHA-256 names `<key>` | `032c4825…` |
| Catalog | `memory-catalog.json`, with `compressedBytes` and `compressedSha256` | 297,479, `6636cafb…` |
| Seed | `AUX_MEMORY_V2_SEED` in `aux-native-entry.mjs` | catalog hash, group, entries, sizes |
| Launch policy | `AuxMemoryHelperLaunchPolicy.json` `sourceSha256` | `3d2bc19a…` |
| Daemon constant | `kMemorySourceSha` in `AuxAccountMemoryHelper.mm`, not `daemon-policy.swift` | `3d2bc19a…` |

`scripts/release/assemble.py --memory-distribution` copies the binary, never signs it, re-pins each link, and `verify_memory_chain` checks every one exactly, including the constant in the daemon executable. `memory-helper.o` comes from the recorded `clang++` command (`release-memory-a1/compile.json`), which reproduces the a71 object byte for byte from the unchanged source.

The supplied generation name `a3a6ff12-…` stays. It only has to match `CURRENT` and the seed, and an update publishes a new random generation anyway.

## Home policy migration

A home used to refuse any build whose bootstrap policy hash differed from the one that created it, so an update that changed a pinned module would lock out every user.

The journals can't be rewritten. `initial-journal.json` is immutable and hash-chained: the target journal pins its digest, and the Keychain secure-stage row pins `policySha256` beside it (`AuxNativeFreshTargetBoundary`), and that row must not be touched. So `journal.policySha256` keeps its meaning, the policy that created the home, and the migration is a versioned record beside it:

`policy-succession.json` (`aux.install.native-fresh.policy-succession.v1`), in the home's initial journal folder: `policies[0]` created the home and the last entry is the one policy the home admits. The list keeps the creator and the last 63.

- **Migration:** `AuxResumedFreshNativeHome.migrateToCurrentPolicy`, called from `AuxBrowserFreshRootAdmission.acquireOrdinary` while both marker locks are held, so no prior daemon is live. It runs only with a policy `AuxSignedFreshBootstrapPolicyLoader` authenticated (`anchor apple generic` and leaf OU `9F2JXY8TCK`). The write is one atomic rename. Keys, Keychain rows and journals are not changed.
- **Checks kept exact:** `readExistingInitialJournal` requires the record's head to equal the running policy, and `revalidateOrdinaryStorageBinding` compares the same head. Before this change both compared with the journal.
- **Records that keep the creation hash:** the task reservation, journals and helper lifetime records stay bound to each other through it. `AuxNativeTaskLayout.reopen` now binds to the journal's hash, and the read-only preflight reads the reservation's, then rebuilds and compares the full reservation bytes as before.
- **Ordinary root markers:** `decodeOrdinary` was a second lockout, because it rebuilt each marker with the running policy's hash. A marker now has to name a policy in the home's lineage. A home with no reservation has only the current policy.

A missing, tampered or misbound record is refused, never reset. A downgrade appends like any other change, because Sparkle's signature and the team check already decide what may run.

The record's logic was exercised once with a throwaway harness over the real store: same policy writes nothing, advance, repeat, A-B-A, a stale staged file after a crash, the cap, an unchanged initial journal, and refusal of a wrong creator, wrong journal, empty record and stale journal hash. Real admission needs a launch.
