# Original Chromium new-target worker

This implements the complete supplied `4255868` **worker** on top of `af8eb1f33`'s copied-profile primitives. It is an uncompiled, unmounted source proposal. It does not change the extension's mode1/current-profile importer or claim initialized-profile/destination success.

The new `aux_import::PrepareChromiumNewTarget(ChromiumCloneRequest)` is MayBlock. Its request must come from the real native WebUI selection owner: the selected source kind/path, the genuinely reserved unloaded target path, requested profile name, and the optional source password already captured before dispatch. An absent password and an admitted empty password remain distinct. The worker derives the same existing `SourceKey` only when required; it never starts a second key lookup. Raw password/key data never appears in the receipt or an RPC.

Implemented ordering and original outcomes:

1. Require the selected source directory. Kind2 **ChatGPT Atlas** bypasses manual key/snapshot work. Every other kind checks the original four encrypted-store paths and requires the captured optional password when any exists. The error is `Could not access <source> encrypted data`.
2. Run the actual clone/extension/theme/preference plan from the preceding proposal. Copy and preference failures remove the genuine reserved target as before.
3. Arc merges the existing actual Arc parser's preorder tree into the **copied** Bookmarks JSON. Missing JSON gets the original three permanent roots/GUIDs. Existing JSON must have the original bar/list shape. Maximum string ID is scanned recursively; native32-bit signed IDs are assigned after folder-child recursion; UUIDv4, original timestamps/fields, bar modification and checksum removal are preserved. Duplicate same-name folders remain distinct. Arc merge failure warns and continues, as original4255868 does.
4. Reinitialize actual tracked preferences. Failure removes the reserved target. Then, only if a source key was admitted, read original cookies **before** passwords using the same existing native reader implementations. Blob byte fields remain private. Reader failure produces `Could not read <source> cookies or passwords`, removes the target and returns worker failure.
5. Return the original eligible extension descriptor plan. Chrome alone reads actual selected-profile `profile.info_cache`/`gaia_picture_file_name`, falls back to `Google Profile Picture.png`, carries the original `migrated-chromium-profile-photo://<selected-id>` key and bytes, and persists those bytes to the copied target. Missing/empty/unwritable photo is nonfatal and leaves no optional photo.
6. Set worker success only after those phases. The receipt also retains the actual target path and requested name. It is not a completion event.

## Integration boundary

Add `chromium_clone_worker.cc` to the existing native import target alongside `chromium_profile_clone.cc`. The new worker uses existing `//base` and existing import target dependencies; no new backend or crypto library is introduced. Two count-pinned additions to `migrator.h/.cc` expose the existing private-byte encrypted reader and original Arc parser to the new worker; the public3arg reader and all mode1 callers stay unchanged.

The real mode0 coordinator must post this MayBlock function and join its result **before** `ProfileManager::CreateProfileAsync`. On failure it must not create/load the target or send success. On success it must still run the actual initialized-profile metadata/theme/photo owner, real destination cookie/password/extension restoration barriers, final completion alert and optional activation. L4 owns the initialized-profile metadata helpers; root owns Handler routing/GN/application. This patch contains no no-op completion callback, invented `Profile`, source-authority bypass, per-row autofill parser or independent success facade. Generic copied Web Data remains the original mechanism.

Source kinds are the original fixed enum (Arc, Brave, ChatGPT Atlas, Chrome, Comet, Dia, Microsoft Edge, Helium); these are not the public picker roster indices. The source path and reserved target must remain captured across async work rather than recomputed from the current browser profile.

## Evidence and check

`source-evidence.json` pins the complete original arm64 image, bounded original worker/presence/Arc serializer/helper assembly, original UTF16 source labels, literal bytes and current155 APIs. Complete bounded REA snapshots are retained; raw LLVM is authoritative where decompiler flow is truncated. The original signed integer formatter and UUIDv4 version/variant/lowercase format are positively pinned rather than inferred from numeric IDs.

`python3 verify.py` passed original byte/literal/API hashes and exact four-file patch replay in a disposable directory. It executes no worker, DB, source profile, Keychain or OS operation. Native compile, actual WebUI routing and runtime import behavior remain integrator work.
