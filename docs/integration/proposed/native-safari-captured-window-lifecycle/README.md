# Safari captured-owner warning/event and completion presence

Three exact anchors in the existing lifecycle h/mm, based on the standalone-authority output (identical to actual491 native files at capture). No Handler, coordinator, registration or GN mutations.

`CaptureSafariInvalidArchiveWarning(WebContents&) -> OnceCallback<bool()>` captures the actual initiating context/window and returns **true only after** showing the original `ShowSafariInvalidArchive()` warning. If that owner no longer exists, it returns false and the actual caller supplies the WebUI invalid-file event. These branches are exclusive, matching `4250e40`: the warning branch at `4250f14..f3c` tail-calls `458d4ec`; the event branch is reached at `4250f40`, not after the warning.

The warning renderer is owned by L2's `native-safari-webui-owner`, not duplicated here. Original warning uses style0, exact title/body and OK. It is a native modal alert, not a newly invented sheet or a success dialog. If the initiating window disappears during the modal loop, the already displayed warning still returns true; no second event is emitted.

`CaptureImportOwnerPresence(WebContents&) -> RepeatingCallback<bool()>` shares the same real weak initiating WebContents and weak `gfx::NativeWindow`. On invocation it requires the actual retained standalone context/window via existing `RetainsStandaloneOwner`, plus a non-null native NSWindow. That underlying guard uses the actual browser collection/tab identity and original app marker; it does not infer existence from a visible flag, remembered bool, account state or replacement active browser. This preserves original `4250e70..ef8` resolution/registry/native-window checks and is also consumable by the genuine Safari completion branch `4251b94`.

## Agreed owner bindings

L2 owns SafariWebUIImport lifecycle/settlement. prefs_reuse owns Handler. Their agreed lifecycle fields are:

```
invalid_archive = CaptureSafariInvalidArchiveWarning(*initiating_contents);
has_owner_window = CaptureImportOwnerPresence(*initiating_contents);
```

Capture at initiation, before async work. Coordinator calls the once warning; only false/absent triggers its actual `Update("invalid-file", ...)`, which Handler projects to `safari-import-invalid-file` with exact original message `This is not a valid Safari data ZIP file.` through its existing weak callback. It must not manufacture `browser-import-failed` or show warning and event together. The completion owner may use the presence callback to choose the real source completion/open-profile path; this helper itself does not create, close or activate any profile/window.

The existing file-picker cancellation and basic file-validity callbacks remain separate. No changes to their behavior are inferred from this failed-import preparation branch. The actual coordinator/helper prerequisites must be integrated together; no placeholder callback is supplied.

Verification pins whole thin hash, three bounded original ranges, three exact event/message/callback literals, both native baseline/output hashes, three count-checked anchors and disposable patch replay. No dialog, native window, actual profile/ZIP/Keychain/OS action, build or runtime operation ran. Root owns integration compilation and actual behavior observation.
