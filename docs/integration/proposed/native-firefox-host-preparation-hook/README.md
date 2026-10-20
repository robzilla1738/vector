# Original Firefox host preparation gate

Source-only, two-file incremental proposal on the actual454 host headers/implementation (unchanged from the preceding owner proof). Eight counted anchors port the positively recovered preparation producer/consumer. It does not mount a partial full-import owner or claim complete Firefox migration.

## Exact original behavior

Original `LaunchImportIfReady` at4106480 first tests the real bookmark loading observation, template loading subscription, source readability, cancellation and existing client. It then checks original prepared+71 and preparation-started+70. If neither is set, it marks started and consumes the optional host+68 callback exactly once.

The original callback has shape `OnceCallback<void(OnceCallback<void(bool)>)>`: its invocation4106544..655c receives a once completion bound weakly to this exact host. Source410665c ignores a cancelled host, marks prepared and retries the genuine launch on true, or calls NotifyImportEnded on false. When no preparation callback exists,41065a0 marks prepared and proceeds immediately. After preparation, the actual original bridge/client construction begins41065a4. Repeated loaded-model notifications while the callback is pending cannot run it twice or create a client early.

The port's `SetAuxPreparationCallback` and `OnAuxPreparationComplete` names are typed155 adaptations; no recovered public C++ spelling is claimed. The three state members map the actual original optional callback and two booleans. `aux_preparation_complete_` means only this prelaunch gate, not successful data import. No import/password/cookie success result is manufactured.

The hook is guarded by ENABLE_AUX_BROWSER && IS_MAC, the actual source platform; ordinary/non-Aux platform launch remains unchanged. The original existing-client guard is restored inside that same branch. A synchronous callback can acknowledge, cancel or destroy the host, so the invocation path returns without further member access. The real WeakPtrFactory drops later acknowledgments after destruction. Original Cancel sets cancelled and routes through NotifyImportEnded, which notifies and deletes the host; no new Cancel/ownership implementation replaces it.

## Concrete owner/source prerequisites

The actual public route starts at427acfc → Firefox migrator ctor4262bc0 / Start4262e44(mode1) → ready42631c0 → current-profile host builder4263a68. The latter installs the preparation callback only for non-bookmarks-only imports at4263c40..cd0, binding4263f48 and the selected SourceProfile.source_path into the original host+68. That exact callback logs `PrepareFirefoxCookies` and posts4260740, whose supplied decompile is available at:

`/Users/rcourson/Downloads/aside-rea 2/native-fork/decompiled/04260740.c`

It is the real cookies.sqlite/moz_cookies worker. Cookie preparation acknowledgment must include its actual destination completion, not a stub returning true. The public Firefox owner/real callback/destination remain to be mounted after their coherent port. This hook alone intentionally has no caller in current Aux.

Password prerequisites remain distinct: original registry7821270/782130c produces0x4b (including PASSWORDS) on Mac; current155 Mac utility/password declaration remains disabled. Source observer42648b0 uses original host+11c/+114 to assess the actual password outcome. The exact result producer and original Mac utility/NSS owner are not yet recovered by this slice. They must be ported with real failure/completion semantics; copying numeric fields or setting them true is not an implementation. The full thin static input and hash, exact ready/mask/progress/cancel call chain and comparison with current155 are pinned in `native-firefox-public-import-owner-proof`.

## Integration and checks

The public importer header now directly includes chrome/browser/buildflags.h. Root should add `//chrome/browser:buildflags` to `//chrome/browser/importer:importer` public_deps if not otherwise exported; root owns GN. Existing base dependency supplies callback/weak binding. No new target/source registration is required. The actual host header is shared, so dependent native objects must rebuild before runtime evidence.

`verify.py` passes four original raw/listing range pins, eight anchor counts, two parent/output hashes and exact two-file patch replay. No source profile/database, NSS, Keychain, browser/native execution, build or OS operation occurred. No shared checkout edits were made. Actual compiled behavior and full import acceptance remain unclaimed.
