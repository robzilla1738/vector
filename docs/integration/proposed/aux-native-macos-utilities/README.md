# Inactive macOS utility run routes

This source ports the five actual macOS utility command routes from the pinned supplied native addon into an instance-owned, per-call JSON dispatcher. It does not activate the addon replacement, change the UI or touch owner state. No production module initializer is supplied.

`AuxMacOSUtilityCommandCore(boundary:).run(command:input:) -> String?` returns original-style JSON **text** for a recognized utility command; nil means another command's route. The installation core, secure-store and PDF/OS capabilities remain separately composed by the trusted host. The JS interface must remain `run(command, input)` returning a string; JS must not choose a native scope, handle or replacement capability. A native host can construct `AuxAppKitUtilityBoundary` only after its own admission/policy decisions. This proposal deliberately makes no change to the shared owned dispatcher or packaging.

The implementation is reconstructed source from bounded SDK disassembly of the supplied implementation, not claimed to be original buildable Swift source. The recovered-cpp filename inventory had no matching Swift command source. REA reported neither supported Ghidra nor Hopper providers available, so no new analysis job/provider installation or repair was attempted. Existing jobs were untouched. Full original identities remain only in truthful historical evidence and source pins, not the new Swift implementation.

## Recovered contract

| Command | Exact request/response and native behavior |
|---|---|
| generate-thumbnail | Three string fields `filePath`, `iconOutputPath`, `thumbnailOutputPath`; otherwise `error: generate-thumbnail requires filePath, iconOutputPath, and thumbnailOutputPath`. Reply has `success`, `thumbnailGenerated`, `iconGenerated`. **Success equals iconGenerated**, not thumbnailGenerated or their OR: original packed-result comparison at 44d58–44d5c. |
| list-open-apps | String filePath; missing field error `list-open-apps requires filePath`; nonexistent file `File not found`. Optional string iconDirectory. Reply `{apps:[{appName,appPath,default?:true,iconPath?:string}]}`. Workspace default/opening candidates; standardized-path dedupe, absent default added, default first then localized case-insensitive appName. Display-name key then bundle-name key then extensionless app basename; empty string names remain valid, as original. |
| app-icons | `[String] bundleIds`, string iconDirectory; otherwise `app-icons requires bundleIds and iconDirectory`. Reply `{icons:{bundleId:path}}`; unavailable applications/icons omitted. Create directory best-effort; workspace lookup then shared icon cache. |
| copy-file | String filePath; otherwise `copy-file requires filePath`. Existence first, `File not found` without clipboard access. General pasteboard clear then one NSURL written. Actual false returns `Failed to copy file to clipboard`; only true returns `{success:true}`. |
| open-with | String filePath and appPath; otherwise `open-with requires filePath and appPath`. File/app existence checked in that order, errors `File not found`/`Application not found`. Workspace default OpenConfiguration, one fileURL and explicit applicationURL. Completion error localizedDescription; wait5s gives `Timed out opening file with application`. Only successful completion returns `{success:true}`. |

Malformed JSON, JSON null/array or missing/null/type-mismatched fields flow through the same required-field errors as the original readStdinJson/conditional String casts. JSON serialization failure retains `{"error":"JSON serialization failed"}`. There is no mutable global input buffer.

### Thumbnail and icon behavior

The original helper at43f18 requests a256-point square thumbnail, scale2, representation type4, iconMode false. Then a128-point square icon, scale2, type4, iconMode true; if unsuccessful retries type1/iconMode true. Each request waits3seconds and cancels on timeout. Callback CGImage is written directly through ImageIO public.png, creating parent directory; callback errors/write failures report false, not fabricated image success. If the two icon requests fail, workspace icon is rasterized at128points with256pixels. App-icon cache uses32points/64pixels. Bundle identifier (fallback extensionless basename) replaces `/` with `_` and gains `.png`; existing cache is reused, PNG encoding/write failure returns existing-output status. Shared rasterization uses NSDeviceRGB,8bits,4samples,alpha, high interpolation, NSBitmapImageRep PNG.

The new callback storage is synchronized and remains alive after timeout; cancellation is not assumed to finish a callback. This is a necessary race correction to the original unsynchronized captured mutable result, with the same request/wait/cancel/result semantics. `AuxUtilityCompletion` is the actual mechanism used by the AppKit boundary and captured tests.

## Evidence

Original addon SHA-256: `bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb`.

Bounded complete function assembly is in `evidence/`; earlier copy/open command bodies stay in `../aux-native-pdf-os-surface/evidence/{copy,open-with}-literals.asm`, hash-pinned here. Main anchors:

- cmdGenerateThumbnail44928; QuickLook pipeline43f18; callback43b70; bitmap43670.
- cmdListOpenApps454f0; displayName44edc; appIcon4517c; comparator46a14.
- cmdAppIcons46dd0; cmdCopyFile4765c; cmdOpenWith47f50; open completion4eb74.
- App selectors/field-literals in those bodies bind the request schema and actual APIs; source pins also bind original daemon consumer snippets and byte offsets.

## Focused verification and real gaps

Run `bash docs/integration/proposed/aux-native-macos-utilities/check.sh`. It serializes compilation of the **actual** AppKit/QuickLook/ImageIO boundary and captured fixture, then invokes only captured protocol implementations and callback completion orchestration. It never constructs `AuxAppKitUtilityBoundary`, reads owner files, accesses the clipboard, enumerates apps or opens applications. Test evidence belongs to this source slice only.

Still required: trusted runtime capability/dispatcher attachment, correct host AppKit execution context, native host/admission review, and explicitly authorized disposable real OS checks for clipboard paste, application candidates/default selection/icons, open completion and QuickLook output/timeouts. A compile and captured fixture do not prove those OS operations on the real app. No no-op success route, production `.node` initializer, permissions, signatures, production host or whole-addon completion is claimed. Windows-only pick-directory/open-path/reveal-path/focus-explorer-path/install-crash-handler routes remain outside this Mac command set, as in supplied Mac dispatch.
