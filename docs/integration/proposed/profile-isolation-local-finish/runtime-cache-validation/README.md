# Inactive native runtime-cache inspection successor

This proposal implements read-only native inspection of the complete pinned **matching-version** runtime inventory. It does not change the accepted feature candidate, register a native method, execute the runtime, repair a cache, publish a directory, or authorize startup. The retained-cache branch in live `vendor/provided/runtime-seed.cjs` is unchanged.

## Actual supplied contract

`inputs.json` pins the exact selected seed, bootstrap, source inventory, daemon and extracted source functions. The selected daemon's `getLocalAgentRuntimeVersion` accepts a syntactically valid `version.txt` and a short platform-specific list of regular executable entrypoints. It does not verify every distribution file. `isRequiredFile` uses following `stat`; directory existence or that function returning a version is not full seed verification.

The updater downloads an archive against the fetched release metadata's size and SHA-256, validates extraction, checks expected version/entrypoints, performs its macOS preparation checks, and replaces the runtime. The selected source does not persist an authenticated per-file manifest or update receipt that this inspector can use to validate a later retained newer version. The updater preserves its `home` and `tmp` writable directories. Package operations may also change pinned npm/Python distribution files. Original updater/status behavior remains authoritative for its own narrower compatibility contract; these old seed pins are not update authority.

## Implemented native portion

`source/AuxRuntimeCacheInspection.inc` is a private implementation intended inside the existing host's anonymous namespace. It has no public ABI. `source/AuxRuntimeCacheOwner.inc` selects the task home exclusively through the retained real `BrokerOwner` and `AuxNativeContextCopyStorageRoots`; it accepts no JavaScript path, descriptor, profile, generation or pin inventory. It reuses current worker/owner checks and retains the owner plus a pending count through all physical reads and FD closure. There is no new privilege or custody token.

The reader opens fixed `runtime` beneath that admitted task descriptor. Every descendant parent is opened one component at a time with `openat(O_DIRECTORY | O_NOFOLLOW)` and retained while reading the child. Regular leaves use `O_NOFOLLOW | O_NONBLOCK`, regular-file/single-link/owner/mode checks, bounded streaming reads, before/after device/inode/size/timestamps and cancellation checks between chunks. Symlinks are read with `readlinkat`, compared byte-for-byte, and never followed. The compiled pin generator checks the complete relative link graph against the pinned inventory, including cycles and missing destinations. Parent directories must be real directories, never links. The implementation never falls back to absolute pathname reads or `/dev/fd` traversal.

All 10,929 original pin entries and the nine existing relocation records are compiled from the exact previously authenticated inventory. Text anchors are reversed against the **actual native-selected taskHome/runtime**, in reverse original order with exact counts, then original size/SHA-256 is checked. Other regular files are streamed and hashed. The reader checks the version again after scanning and rechecks native owner/transport generation, task-root identity and the named runtime directory before returning. No payload, path or credential contents are exposed by the proposed result: only status and aggregate counts.

These are bounded snapshot observations, not atomic namespace custody or a guarantee against every concurrent same-UID writer. The original runtime publication/custody blocker remains open. The code makes no whole-runtime or execution-safety claim.

## Result meanings

| Native status | Meaning and allowed interpretation |
| --- | --- |
| `kMatchingSeed` | Every pinned entry observed matches this source version, type, mode, link target and relocated file bytes. Extra files are not inspected. This is not runtime admission. |
| `kIncomplete` | The fixed runtime/version or a pinned entry is missing. A future complete-seed check must reject this result; it must not reset/delete the cache. |
| `kModifiedUnverified` | Existing pinned file bytes/mode or relocation differ. This may be legitimate npm/pip modification. Preserve the cache; do not label it corrupt or overwrite it. |
| `kNewerUnverified` | A different canonical numeric version is newer than the seed. Do not hash against obsolete pins, downgrade, or claim genuine update provenance. |
| `kOtherVersionUnverified` | Another valid version label, including nonnumeric labels. No invented update ordering. |
| `kUnsafe` / `kCancelled` | A contained read, metadata check, generation or lifetime condition failed. Do not translate this into successful seeding or installed status. |

Extras such as package caches, `tmp`, `home`, `.npmrc`, `__pycache__` and newly installed packages are neither deleted nor treated as original pin failures. Modification/removal of a *pinned* package remains unverified/incomplete; deciding its compatibility requires original downstream semantics or a separately specified authenticated update/install receipt, not an exception invented by this inspector.

## Exact integration work still required

1. Keep this inactive. Rebuild a coupled unsigned host only after reviewing the selected host inputs in `inputs.json`. Add required standard/POSIX and CommonCrypto includes at the host's global include section; include the core, generated pins and Owner wrapper inside its existing anonymous namespace **after** real `BrokerOwner`, `ReadExecRoot` and storage-root declarations. Do not replace the original supplied updater validator.
2. Provide a finite **zero-argument** current-environment native dispatch using the existing `CaptureBrokerOwner(env)`. No caller pathname, FD, pin JSON, profile or native handle is accepted. Queueing/settlement must be integrated with the actual host lifetime/drain mechanism, retain Owner/Worker through callback settlement, recheck environment/owner/generation before exposing a result, and never block the JS event loop on the 10,929-entry scan. The wrapper here covers the actual read interval; it is not a fabricated already-integrated async dispatcher.
3. Compile that wrapper against the **real selected host** and bind its object/ABI in the actual coupled host/daemon recipe. Only the core and exact compiled pin table have syntax evidence here; there is no claimed host-wrapper, live-addon or daemon acceptance.
4. Integrate the retained-cache and racing-EEXIST seed branches together. A complete-seed requirement must refuse `kIncomplete`/`kUnsafe`/`kCancelled`; inspection must run under the same authenticated roots used by bootstrap. Do not let `acquireAgentRuntimeUse`, offline status, or an ignored seeder result bypass the intended decision. The existing downstream checks must still run; their weaker success cannot be relabeled full inspection. The policy for `kModifiedUnverified`/newer/other-version is deliberately not silently changed by this proposal.
5. A fresh staging directory cannot be inspected by passing an arbitrary JS-selected FD or name to this fixed-runtime helper. The native publisher/staging Owner/action contract remains a separate prerequisite for verifying a complete stage before atomic publication. This proposal neither repairs that missing seam nor introduces a callable unsafe publisher.
6. Complete runtime execution acceptance, quarantine/signature policy, update provenance, mandatory namespace custody, universal writer coverage and whole-browser drain remain separate gates. No new signing or runtime grants are included.

## Lean evidence

One tiny disposable JavaScript descriptor fixture was attempted first. It failed closed before payload reading on macOS because directory traversal through `/dev/fd/<fd>/<child>` is unsupported there. That failed approach and an unexecuted Python diagnostic draft were discarded; neither ships in this proposal. `evidence.json` preserves the failure rather than calling it a passing containment test.

The actual native core plus exact generated pin table passed `/usr/bin/clang++ -std=c++17 -fsyntax-only -Werror -Wno-deprecated-declarations source-check.cc`. No new native executable/library was linked, signed or executed. No product, provider, network, owner profile or runtime payload was accessed. Static input manifests and source were read; the tiny fixture used only synthetic bytes. Native behavior and real-host integration remain untested.
