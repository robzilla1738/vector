# Actual saved-pin session-restore guard and completion

This corrects the earlier interpretation of original `07adfd94`. It is **`SessionRestore::IsRestoring(profile)`**, not a profile-close coordinator. The required coordinator already exists in Chromium155. This proposal connects the supplied saved-pin service to that real implementation; it does not introduce a second registry or any proxy close-state check.

## Producer proof

The original constructor `03417c64` stores profile at `+18`, browser at `+20`, synchronous at `+28`, startup-tab data and real keep-alives, then registers the actual object in the set at `0xed43638`. Its destructor `034185f8` removes that same object. The class implements actual browser-collection observation; its browser-close handler `07ae0404` compares the browser at `+20`, records a canceled restore when requested, and retires that restorer. A browser-close handler does not make the registry a close coordinator.

`07adfd94` walks this actual restorer set and compares each restorer's profile at `+18`. Its adjacent `07adfe40` walks the **same** set and reads synchronous at `+28`. These exactly correspond to current155's `SessionRestore::IsRestoring` and `IsRestoringSynchronously`, with the same actual `SessionRestoreImpl` constructor, active-object insertion/destructor erasure, profile and synchronous accessors. The original constructor/destructor, registry operations, two queries, callback registry and actual155 implementation hashes are pinned by the verifier. No name inferred from a nearby call is used as authority.

The original service registers its weak callback at `032224a4 → 07adfeb8`. That function adds to the real restored-callback list returned through `0415b254`. Original completion emitter `0415b07c..b090` gets that callback list and passes actual profile and restored-tab count. `041d5f78` compares the event profile to the service profile, ignores count, then directly reconciles its real observed models through `041d5fb4 → 041d64d0`. Current155 exposes exactly `RestoredCallback = RepeatingCallback<void(Profile*, int)>` and `RegisterOnSessionRestoredCallback`.

## Two-file implementation

Apply after the exact service outputs of `15fb04a43`. Root's compiler-only201 shadow rename remains an independent rebase; this proposal deliberately preserves the predecessor's unchanged local binding. Only `pinned_tab_service.h/.cc` change; no GN/registration or public interface is added.

The three original automatic-adoption sites consult real `SessionRestore::IsRestoring(profile_)`: normal-browser observation, native insertion/replacement, and untagged pinned `kAll` changes. They still cache genuine restored identity while restoration is active. The preference-change task is not given an invented restore guard; its separate source behavior remains intact. Explicit pin/unpin paths are likewise unchanged.

Actual completion is profile-filtered and weakly bound before the service enumerates existing browsers. It reconciles only real same-profile normal models. **It does not recheck `IsRestoring` inside completion.** Actual155 calls `FinishedTabCreation`, posts asynchronous deletion with `DeleteSoon`, and emits completion before destruction erases the active restorer. A central guard inside `ReconcilePinnedEntries` would suppress the very completion that must adopt restored identities. The source's direct completion path is preserved.

For the existing Aux same-window owner transaction, a real completion received while paused sets a pending latch. Only the matching final resume drains it against the newly owned actual models. This is a155 integration adaptation to preserve a genuine notification across the existing pause; it dispatches no fabricated callback, browser event, profile or restored count. Normal repeated completions continue to run source reconciliation.

Earlier `native-pinned-tab-entry-service` and `native-pinned-tab-entry-reconciliation` notes are corrected in this commit. Historical assembly filenames that used “close” are retained so prior evidence paths remain resolvable; their bytes prove the session-restore behavior described here.

## Verification and remaining scope

`python3 verify.py` checks original producer/query/subscription/emitter/callback bytes and call targets, actual155 APIs, exact two-file replay, all three guards, weak/profile-filtered subscription ordering and completion's deliberate registry bypass. No source original was executed. No native build, app/dialog launch, signing, owner profile or runtime acceptance occurred.

The saved-pin restore metadata's read-side (`pinned_tab_entry_url`) remains a separate source/consumer audit, alongside drag/drop/ghost, compact/temporary-width presentation, custom active RGB and hover-card seams. There is no remaining unidentified async-close coordinator prerequisite for this service: that earlier label was incorrect.
