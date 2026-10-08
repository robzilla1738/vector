# Native patch ownership

The consolidated checkpoint contains 32 area patches, numbered `0001`–`0032`. Each of its 840 paths with a net change from pinned Chromium belongs to exactly one patch. Subsequent coherent fixes append to the series: `0033` retires private semantic-filter resources with their actual Profile; `0034` registers implemented asynchronous runtime methods and routes coding Preview through its original window; `0035` binds embedded documents to acknowledged native input and actual physical event targets; `0036` gives human Find and Zoom browser ownership independent of Node. The complete series is the build input; intermediate area patches are not independently buildable products.

This consolidation replaces the 100-patch series at repository commit `26527f6659f3e90ee674eed93c8924d9993bd3ad`, through the former `0101-private-budget-sandbox-broker.patch`. Replaced patch files are removed; their history remains in Git. Numbering has restarted: the next available reservation is `0037`; the former `0102` reservation is retired. Historical patch numbers in earlier evidence refer to the original series, not this ownership table. Replay equality below describes the original 32-area checkpoint, excluding subsequent fixes.

## Replay evidence

Both series replayed in disposable affected-path trees from Chromium `154.0.8037.98`, pinned to `b859317bf11f6be47f9b7799ec690a0a42a1fb33`. Every consolidated patch passed `git apply --index --check` and applied successfully. Git tree identity verifies exact path, byte and mode equality; the canonical binary aggregate diff also matches. No product or stock checkout, native builder, Profile or development lock was changed by this verification.

| Evidence | Value |
| --- | --- |
| Original series SHA-256 | `6309dd337c944e01b119cf9c5ac560445f48ed840d199872ee9c3859164cb790` |
| Consolidated series SHA-256 | `2215c28f24f7e165db5bfffa1bf497ec06e909b19e737796b9b0c319a5a4543c` |
| Identical aggregate SHA-256 | `22b2cb87234f0a3b7e42621b275f9f20bd736236ab2cf9b5d0f65ad46b33a205` |
| Identical affected-path Git tree | `2cb374a898133839f46c9b047fd9ed36a24a611b` |
| Net paths | 509 added, 331 modified, 0 deleted |

The original series touched 1,969 paths historically. The other 1,129 paths have no remaining upstream delta, so consolidation carries no obsolete add/remove history. [consolidation.json](consolidation.json) records the individual area hashes and path counts at this checkpoint. This evidence establishes source equivalence; it does not claim native build, browser acceptance or performance completion.

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
| [0010-native-input-admission](aux/0010-native-input-admission.patch) | 35 | Physical input provenance and platform input admission |
| [0011-native-creator-cleanup](aux/0011-native-creator-cleanup.patch) | 15 | Native creator ownership and cleanup |
| [0012-tabs-memory-saver](aux/0012-tabs-memory-saver.patch) | 14 | Tab catalog, native memory saver, discard and wake lifecycle |
| [0013-organization-spaces](aux/0013-organization-spaces.patch) | 5 | Organization layouts, Spaces and native placement identity |
| [0014-profiles-routing](aux/0014-profiles-routing.patch) | 11 | Browser Profiles and link routing |
| [0015-credentials-autofill](aux/0015-credentials-autofill.patch) | 13 | Credentials, autofill and native device confirmation |
| [0016-content-blocking](aux/0016-content-blocking.patch) | 373 | Content filtering, maintained semantic engine/resources and network receipts |
| [0017-library-history](aux/0017-library-history.patch) | 6 | Native bookmarks, folders, guarded Undo and history |
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
