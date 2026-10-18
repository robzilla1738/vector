# Native patch ownership

The current155 series contains64 numbered areas, `0001`–`0064`, applied to
Chromium155.0.8059.85. Current source, compiled and observed status belongs in
[STATUS](../../docs/STATUS.md). Older consolidation evidence below describes its
explicit154 checkpoint and must not be used as155 build or acceptance evidence.

Area0060 adds asynchronous runtime dispatch with bounded outgoing transport,
original-connection power retirement and isolated, hash-bound PNG/JPEG/WebP
normalization. Its six affected paths were reconstructed from the preceding59
patches in a disposable tree. The incremental patch passes forward apply and
reverse checks; replayed path bytes equal the current155 source. The patch SHA256
is `99fc528e96df5e7420957d7cd2d32673cf542cbc590946fe580fcba61b053bb1`.
Native compilation/observation is recorded separately; an apply check is not a
browser acceptance result. The area also normalizes existing runtime-host C++
formatting. Generated ABI bindings, renderer assets and runtime bundles remain
owned by their staging producers and are excluded from this source patch.

Areas0061–0063 add generated original-window routing, immutable chunked PDF/audio
jobs with exact utility-process retirement, and separate off-by-default macOS
selected-app AX/local-OCR context. The29 affected paths replay from the preceding
60 areas in a disposable tree; all three patches pass forward/reverse checks and
final source bytes match. Proof: `/tmp/aux-native-followup-area-proof.json`.
The baseline full155 app build passes; the current PDF/audio/import utility passes
ten native fixtures. Current native UI/capture/RPC acceptance remains separate in STATUS.

Area0064 preserves immutable selected PDF bytes, adds snapshot-bound byte reads,
and retains valid empty PDF text snapshots with counted warnings. Its eight
affected paths pass forward/reverse and actual-source byte checks in
`/tmp/aux-native64-proof.json`. Native object compilation and the scanned-PDF
fixture are recorded separately in STATUS.

The next available area number is0065. Do not reset an active native tree or reuse
historical follow-up reservations. Continue to use the single existing launcher,
builder and plain PID lock; do not force-clear an active lock.

## Replay evidence

The frozen 42-entry input and consolidated series replayed in disposable affected-path trees from Chromium `154.0.8037.98`, pinned to `b859317bf11f6be47f9b7799ec690a0a42a1fb33`. Every consolidated patch passed `git apply --index --check` and applied successfully. Git tree identity verifies exact path, byte and mode equality; the canonical binary aggregate diff also matches. A read-only comparison against the product checkout after the sole writer applied the same 42-entry input found no difference across the 850 series-owned paths. Generated bindings, staged renderer assets, runtime bundles and build outputs are outside this source comparison. Verification changed no product or stock source, index, Profile, build or development lock.

| Evidence                         | Value                                                              |
| -------------------------------- | ------------------------------------------------------------------ |
| Input series SHA-256             | `775701a47eec9f4fcb7fa222e8ea91552e531f02f47b269fcbbf15efa6fa595d` |
| Consolidated series SHA-256      | `2215c28f24f7e165db5bfffa1bf497ec06e909b19e737796b9b0c319a5a4543c` |
| Identical aggregate SHA-256      | `6326a5ddea898910f334b03064f9fde016994b13713d4f0bfe18788c278e0d62` |
| Identical affected-path Git tree | `ad8be052b051ddfeca6cdf2e14dce58b85055dfa`                         |
| Net paths                        | 509 added, 341 modified, 0 deleted                                 |

[consolidation.json](consolidation.json) records every input patch hash, final area hash and path count, plus the previous consolidation's provenance. Source equivalence does not establish native compilation, browser acceptance or performance completion. Current integration and live evidence belong in [STATUS](../../docs/STATUS.md).

Renderer assets and generated host bindings are staged by their existing producers, not embedded in the series. The historical [154 stock benchmark patch](benchmark/0050-native-performance-stock.patch) remains unchanged. The [155 stock benchmark patch](benchmark/0052-native-performance-stock-155.patch) is separate from the Aux series; its eight affected paths pass pinned-source forward/reverse/byte checks (`/tmp/aux-stock155-proof.json`). The fresh stock app is not yet built, so this is not performance evidence.

## Areas

| Area patch                                                                                   | Paths | Ownership                                                                           |
| -------------------------------------------------------------------------------------------- | ----: | ----------------------------------------------------------------------------------- |
| [0001-build-foundation](aux/0001-build-foundation.patch)                                     |    25 | Shared GN targets, Swift toolchain, resources and build flags                       |
| [0002-branding-signing](aux/0002-branding-signing.patch)                                     |    18 | Aux branding, bundle identity, entitlements and crash integration                   |
| [0003-shell-host](aux/0003-shell-host.patch)                                                 |    33 | WebUI shell, bootstrap, warm windows, omnibox and task attention                    |
| [0004-runtime-host](aux/0004-runtime-host.patch)                                             |    13 | Profile runtime transport, private sessions and native provider lifetimes           |
| [0005-method-registry](aux/0005-method-registry.patch)                                       |     2 | Native method routing and capability registry                                       |
| [0006-cdp-authority](aux/0006-cdp-authority.patch)                                           |    13 | CDP authority and explicitly enabled remote debugging                               |
| [0007-egress-permissions](aux/0007-egress-permissions.patch)                                 |    25 | Egress authority, permissions and network admission                                 |
| [0008-native-person-observation](aux/0008-native-person-observation.patch)                   |    13 | Native person observation and document scripts                                      |
| [0009-native-person-capture](aux/0009-native-person-capture.patch)                           |    19 | Person capture, compositor receipts and capture masking                             |
| [0010-native-input-admission](aux/0010-native-input-admission.patch)                         |    43 | Physical input provenance and platform input admission                              |
| [0011-native-creator-cleanup](aux/0011-native-creator-cleanup.patch)                         |    15 | Native creator ownership and cleanup                                                |
| [0012-tabs-memory-saver](aux/0012-tabs-memory-saver.patch)                                   |    14 | Tab catalog, native memory saver, discard and wake lifecycle                        |
| [0013-organization-spaces](aux/0013-organization-spaces.patch)                               |     5 | Organization layouts, Spaces and native placement identity                          |
| [0014-profiles-routing](aux/0014-profiles-routing.patch)                                     |    11 | Browser Profiles and link routing                                                   |
| [0015-credentials-autofill](aux/0015-credentials-autofill.patch)                             |    13 | Credentials, autofill and native device confirmation                                |
| [0016-content-blocking](aux/0016-content-blocking.patch)                                     |   373 | Content filtering, maintained semantic engine/resources and network receipts        |
| [0017-library-history](aux/0017-library-history.patch)                                       |     8 | Native bookmarks, folders, guarded Undo and history                                 |
| [0018-downloads](aux/0018-downloads.patch)                                                   |     8 | Downloads and naming                                                                |
| [0019-extensions](aux/0019-extensions.patch)                                                 |    10 | Browser extension controls                                                          |
| [0020-dictation](aux/0020-dictation.patch)                                                   |     5 | Native dictation sessions                                                           |
| [0021-recovery](aux/0021-recovery.patch)                                                     |     1 | Native health and recovery recording                                                |
| [0022-updater](aux/0022-updater.patch)                                                       |     3 | Native updater integration                                                          |
| [0023-window-platform](aux/0023-window-platform.patch)                                       |    17 | Window platform controls and AppleScript integration                                |
| [0024-appearance-power](aux/0024-appearance-power.patch)                                     |     5 | Appearance and power preferences                                                    |
| [0025-preview-reader](aux/0025-preview-reader.patch)                                         |     4 | Link preview, reader and returned-source presentation                               |
| [0026-page-controls](aux/0026-page-controls.patch)                                           |    14 | Browser page controls and native methods                                            |
| [0027-commands](aux/0027-commands.patch)                                                     |     6 | Browser commands                                                                    |
| [0028-picture-in-picture](aux/0028-picture-in-picture.patch)                                 |    31 | Picture in Picture and media-session integration                                    |
| [0029-browser-renderer-integration](aux/0029-browser-renderer-integration.patch)             |    32 | Shared browser/renderer lifecycle and document integration                          |
| [0030-native-performance-fixtures](aux/0030-native-performance-fixtures.patch)               |     7 | Native timing, process-role witnesses and explicit journey fixtures                 |
| [0031-coding-projects](aux/0031-coding-projects.patch)                                       |    13 | Coding terminals, project files and local/cloud Preview                             |
| [0032-browser-import-export](aux/0032-browser-import-export.patch)                           |    50 | Browser import/export, native decoders and imported extension review                |
| [0033-native-browser-api-repairs](aux/0033-native-browser-api-repairs.patch)                 |     2 | Native browser api repairs                                                          |
| [0034-native-document-extraction](aux/0034-native-document-extraction.patch)                 |    24 | Native document extraction                                                          |
| [0035-native-receipt-export](aux/0035-native-receipt-export.patch)                           |     6 | Native receipt export                                                               |
| [0036-native-extension-reload](aux/0036-native-extension-reload.patch)                       |     1 | Native extension reload                                                             |
| [0037-native-window-performance](aux/0037-native-window-performance.patch)                   |     5 | Native window performance                                                           |
| [0038-app-icon-compression](aux/0038-app-icon-compression.patch)                             |     1 | App icon compression                                                                |
| [0039-image-clipboard](aux/0039-image-clipboard.patch)                                       |     5 | Image clipboard                                                                     |
| [0040-clear-window-glass](aux/0040-clear-window-glass.patch)                                 |     1 | Clear window glass                                                                  |
| [0041-tab-switcher-chords](aux/0041-tab-switcher-chords.patch)                               |     3 | Tab switcher chords                                                                 |
| [0042-selected-export-file-snapshot](aux/0042-selected-export-file-snapshot.patch)           |     4 | Selected export file snapshot                                                       |
| [0043-shell-file-chooser](aux/0043-shell-file-chooser.patch)                                 |     2 | Shell file chooser                                                                  |
| [0044-default-page-zoom-range](aux/0044-default-page-zoom-range.patch)                       |     1 | Default page zoom range                                                             |
| [0045-shell-zoom-isolation](aux/0045-shell-zoom-isolation.patch)                             |     2 | Shell zoom isolation                                                                |
| [0046-bookmark-window-destinations](aux/0046-bookmark-window-destinations.patch)             |     1 | Bookmark window destinations                                                        |
| [0047-bookmark-clipboard](aux/0047-bookmark-clipboard.patch)                                 |     5 | Bookmark clipboard                                                                  |
| [0048-library-event-forwarding](aux/0048-library-event-forwarding.patch)                     |     1 | Library event forwarding                                                            |
| [0049-native-library-presentation](aux/0049-native-library-presentation.patch)               |    14 | Native library presentation                                                         |
| [0050-private-history-navigation](aux/0050-private-history-navigation.patch)                 |     1 | Private history navigation                                                          |
| [0051-native-library-feature-preferences](aux/0051-native-library-feature-preferences.patch) |     6 | Native library feature preferences                                                  |
| [0052-embedded-page-focus-handoff](aux/0052-embedded-page-focus-handoff.patch)               |     7 | Embedded page focus handoff                                                         |
| [0053-native-history-dialog-return](aux/0053-native-history-dialog-return.patch)             |     4 | Native history dialog return                                                        |
| [0054-quick-ask-draft-layout](aux/0054-quick-ask-draft-layout.patch)                         |     4 | Quick ask draft layout                                                              |
| [0055-active-tab-window-title](aux/0055-active-tab-window-title.patch)                       |     1 | Active tab window title                                                             |
| [0056-person-navigation-autofill](aux/0056-person-navigation-autofill.patch)                 |    14 | Person navigation autofill                                                          |
| [0057-native-window-handback-lifecycle](aux/0057-native-window-handback-lifecycle.patch)     |     6 | Native window handback lifecycle                                                    |
| [0058-native-http-redirects](aux/0058-native-http-redirects.patch)                           |     2 | Native http redirects                                                               |
| [0059-compact-quick-ask](aux/0059-compact-quick-ask.patch)                                   |     3 | Compact quick ask                                                                   |
| [0060-runtime-async-media-admission](aux/0060-runtime-async-media-admission.patch)           |     6 | Runtime async media admission                                                       |
| [0061-runtime-window-proof-routing](aux/0061-runtime-window-proof-routing.patch)             |     1 | Runtime window proof routing; current build and observation evidence in STATUS.     |
| [0062-isolated-document-audio-jobs](aux/0062-isolated-document-audio-jobs.patch)             |    22 | Isolated document audio jobs; current build and observation evidence in STATUS.     |
| [0063-selected-app-desktop-context](aux/0063-selected-app-desktop-context.patch)             |    10 | Selected app desktop context; current build and observation evidence in STATUS.     |
| [0064-immutable-selected-pdf-originals](aux/0064-immutable-selected-pdf-originals.patch)     |     8 | Immutable selected pdf originals; current build and observation evidence in STATUS. |
