# Revalidate routed window after selecting a Space

`routing::OpenRequest::Window` selects the requested Space before retaining the browser's WeakPtr. `SelectSpace` persists native session state and synchronously notifies native observers. A callback that closes/rebinds the window makes the subsequent raw pointer dereference invalid; a callback that changes the destination can also issue a navigation under the wrong context before the existing post-navigation check notices it.

The counted one-file correction retains the actual browser before that call and reacquires its real native profile, binding epoch, admitted identity, normal-window/closing state and selected Space immediately before constructing `NavigateParams`. A lost owner or changed/busy Space refuses without issuing a navigation or falling back to a different profile. Existing post-navigation result checks remain. The original source and exact anchor counts are pinned. Patch applicability passes; root compilation and one actual explicit profile/Space open remain necessary.

No new authority, IPC, timeout, retry, UI control or architecture is introduced. This is a source-proven synchronous lifetime defect, not a claim that a profile switch was induced in the actual app.
