# Native patch ownership

The current series extends the consolidated 32 areas with follow-ups 0033–0041.
Area [0041](aux/0041-tab-switcher-chords.patch) forwards actual held Ctrl-Tab
identity and focuses the shell for the preview's modifier-release handling.
Other Next/Previous shortcuts and menu commands still activate immediately.
Its three-file patch was checked and applied under the sole development lock;
compilation and native observation are recorded in STATUS. The consolidation
evidence below describes the earlier 32-area checkpoint.

The complete series contains 32 area patches, numbered `0001`–`0032`. Each of its 850 paths with a net change from pinned Chromium belongs to exactly one patch. The areas include native browser controls, document selections and PDF export, download dismissal, native history, private Profile retirement and embedded input ownership. Intermediate area patches are not independently buildable products.

This checkpoint folds the reviewed `0033`–`0042` follow-ups into their existing owners. Replaced patch files are removed; their history remains in Git. The next available reservation is `0033`. References to the former `0033`–`0042`, the original 100-patch series through `0101`, or the retired `0102` reservation describe earlier checkpoints, not additional active patches.

## Replay evidence

The frozen 42-entry input and consolidated series replayed in disposable affected-path trees from Chromium `154.0.8037.98`, pinned to `b859317bf11f6be47f9b7799ec690a0a42a1fb33`. Every consolidated patch passed `git apply --index --check` and applied successfully. Git tree identity verifies exact path, byte and mode equality; the canonical binary aggregate diff also matches. A read-only comparison against the product checkout after the sole writer applied the same 42-entry input found no difference across the 850 series-owned paths. Generated bindings, staged renderer assets, runtime bundles and build outputs are outside this source comparison. Verification changed no product or stock source, index, Profile, build or development lock.

| Evidence | Value |
| --- | --- |
| Input series SHA-256 | `775701a47eec9f4fcb7fa222e8ea91552e531f02f47b269fcbbf15efa6fa595d` |
| Consolidated series SHA-256 | `2215c28f24f7e165db5bfffa1bf497ec06e909b19e737796b9b0c319a5a4543c` |
| Identical aggregate SHA-256 | `6326a5ddea898910f334b03064f9fde016994b13713d4f0bfe18788c278e0d62` |
| Identical affected-path Git tree | `ad8be052b051ddfeca6cdf2e14dce58b85055dfa` |
| Net paths | 509 added, 341 modified, 0 deleted |

[consolidation.json](consolidation.json) records every input patch hash, final area hash and path count, plus the previous consolidation's provenance. Source equivalence does not establish native compilation, browser acceptance or performance completion. Current integration and live evidence belong in [STATUS](../../docs/STATUS.md).

Renderer assets and generated host bindings are staged by their existing producers, not embedded in the series. The separate [stock benchmark patch](benchmark/0050-native-performance-stock.patch) remains unchanged and is not part of the Aux series.

## Areas

| Area patch | Paths | Ownership |
| --- | ---: | --- |
| [0001-build-foundation](aux/0001-build-foundation.patch) | 25 | Shared GN targets, Swift toolchain, resources and build flags |
| [0002-branding-signing](aux/0002-branding-signing.patch) | 18 | Aux branding, bundle identity, entitlements and crash integration |
| [0003-shell-host](aux/0003-shell-host.patch) | 33 | WebUI shell, bootstrap, warm windows, omnibox and task attention |
| [0004-runtime-host](aux/0004-runtime-host.patch) | 13 | Profile runtime transport, private sessions and native provider lifetimes |
| [0005-method-registry](aux/0005-method-registry.patch) | 2 | Native method routing and capability registry |
| [0006-cdp-authority](aux/0006-cdp-authority.patch) | 13 | CDP authority and explicitly enabled remote debugging |
| [0007-egress-permissions](aux/0007-egress-permissions.patch) | 25 | Egress authority, permissions and network admission |
| [0008-native-person-observation](aux/0008-native-person-observation.patch) | 13 | Native person observation and document scripts |
| [0009-native-person-capture](aux/0009-native-person-capture.patch) | 19 | Person capture, compositor receipts and capture masking |
| [0010-native-input-admission](aux/0010-native-input-admission.patch) | 43 | Physical input provenance and platform input admission |
| [0011-native-creator-cleanup](aux/0011-native-creator-cleanup.patch) | 15 | Native creator ownership and cleanup |
| [0012-tabs-memory-saver](aux/0012-tabs-memory-saver.patch) | 14 | Tab catalog, native memory saver, discard and wake lifecycle |
| [0013-organization-spaces](aux/0013-organization-spaces.patch) | 5 | Organization layouts, Spaces and native placement identity |
| [0014-profiles-routing](aux/0014-profiles-routing.patch) | 11 | Browser Profiles and link routing |
| [0015-credentials-autofill](aux/0015-credentials-autofill.patch) | 13 | Credentials, autofill and native device confirmation |
| [0016-content-blocking](aux/0016-content-blocking.patch) | 373 | Content filtering, maintained semantic engine/resources and network receipts |
| [0017-library-history](aux/0017-library-history.patch) | 8 | Native bookmarks, folders, guarded Undo and history |
| [0018-downloads](aux/0018-downloads.patch) | 8 | Downloads and naming |
| [0019-extensions](aux/0019-extensions.patch) | 10 | Browser extension controls |
| [0020-dictation](aux/0020-dictation.patch) | 5 | Native dictation sessions |
| [0021-recovery](aux/0021-recovery.patch) | 1 | Native health and recovery recording |
| [0022-updater](aux/0022-updater.patch) | 3 | Native updater integration |
| [0023-window-platform](aux/0023-window-platform.patch) | 17 | Window platform controls and AppleScript integration |
| [0024-appearance-power](aux/0024-appearance-power.patch) | 5 | Appearance and power preferences |
| [0025-preview-reader](aux/0025-preview-reader.patch) | 4 | Link preview, reader and returned-source presentation |
| [0026-page-controls](aux/0026-page-controls.patch) | 14 | Browser page controls and native methods |
| [0027-commands](aux/0027-commands.patch) | 6 | Browser commands |
| [0028-picture-in-picture](aux/0028-picture-in-picture.patch) | 31 | Picture in Picture and media-session integration |
| [0029-browser-renderer-integration](aux/0029-browser-renderer-integration.patch) | 33 | Shared browser/renderer lifecycle and document integration |
| [0030-native-performance-fixtures](aux/0030-native-performance-fixtures.patch) | 7 | Native timing, process-role witnesses and explicit journey fixtures |
| [0031-coding-projects](aux/0031-coding-projects.patch) | 13 | Coding terminals, project files and local/cloud Preview |
| [0032-browser-import-export](aux/0032-browser-import-export.patch) | 50 | Browser import/export, native decoders and imported extension review |
