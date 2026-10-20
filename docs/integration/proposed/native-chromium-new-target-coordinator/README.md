# Original mode0 new-profile coordinator

This is a concrete, uncompiled source proposal for the original native WebUI **new-profile** branch. It consumes `9477435e4`'s complete4255868 worker rather than substituting extension mode1 import or a row-based autofill parser. The public extension importer remains unchanged.

`aux_import::ChromiumNewTargetImport` is owned by the real WebUI/window controller. `Start(ChromiumNewTargetSelection, Completion)` captures the selected source enum/path/display name and already captured optional password. It ignores a second Start while running, as original42530c0 does. It reserves the actual `ProfileManager::GenerateNextProfileDirectoryPath`, creates the actual `ProfileAttributesInitParams` with the original source-label + ` - ` + selected-name and real chosen default avatar, registers it, and posts the full worker on a MayBlock sequence. It does not create a Profile before that worker finishes.

On the worker's real success it invokes `CreateProfileAsync` with the original initialized callback and null created callback. The initialized Profile then receives, in source order:

1. Actual name preference/attributes and original extension reset-record pruning through the already ported metadata helpers.
2. Optional Chrome photo. `chromium_clone_photo_mac.mm` decodes the actual bytes with NSImage, applies the original URL/picture/attribute fields, sets both original true avatar preferences and flushes actual local/profile preferences. Missing/empty/undecodable photo stays nonfatal. The values are pinned at4257b8c..4257c18; they were not inferred from the field names.
3. The real guarded theme reset helper.
4. The existing source-recovered extension installer4258108, which has its own pending-ID registry/reload/permission lifecycle. Original import completion does **not** wait for this observer; no invented third barrier is added.
5. Cookies and passwords rebuilt through native-only wrappers around the exact existing mode1 reconstruction functions. There is no replacement converter, JSON/RPC exposure or new crypto. Empty/missing destination stores follow the original skips. Cookie completion waits every actual SetCanonicalCookie result regardless of Include status; passwords wait the actual batch AddLogins callback. The final true callback requires both original flags.

Original failure removes the reserved attributes and posts target deletion, then reports false with the real error. Original running state is cleared before completion. Weak callbacks retire with the real owner. Actual155's existing `kAuxBrowserImport` ScopedProfileKeepAlive retains the target through the destination callbacks; a local keepalive also spans the final callback so the real UI completion can act on it. It does not prevent browser shutdown or claim arbitrary forced-destruction support.

## Required integration

Add `chromium_new_target_import.cc` and `chromium_clone_photo_mac.mm` to the existing import target, after worker/clone primitives. `chromium_import_destination.h` exposes two private native converter wrappers added to existing `import_service.cc`; the original functions and all mode1 behavior are retained byte-for-byte. GN needs existing profile/password/network/gfx dependencies plus AppKit for the .mm. Integrator owns GN/application.

The real Handler/window owner must own this object until completion and retire it before ProfileManager shutdown. Its completion receives `{success,target_profile,profile_name,error}` only, never source passwords, cookie values or password DTOs. Bind this actual result to L4's `ShowNewProfileImportCompleted` and proven original window/profile loader route according to the captured original optional-switch/UI flag. Original4258c80 invokes its success callback **before** that optional UI-switch path. The coordinator does not synthesize a window, route every completion through an alert, or claim loaded-target success before the native callbacks. L4 owns those actual window/loader bindings; root owns Handler mode0 routing.

No external authority, source-key lookup, signing, Keychain operation, source-profile read or import runtime test was executed while preparing this proposal.

## Evidence and verification

`source-evidence.json` pins the original full arm64 SHA, bounded Start/reservation, worker reply/CreateProfileAsync, initialized metadata/photo/theme, installer, destination and twoflag completion assembly, literal avatar prefs, complete original decompiles, and actual155 API headers. `python3 verify.py` passed those static hashes and exact six-file patch replay in a disposable directory. This is source verification, not compile or runtime acceptance.
