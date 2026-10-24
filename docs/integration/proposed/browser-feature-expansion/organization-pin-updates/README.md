# Root pinned-tab shared-update recovery

Two-file overlay against actual a18 selected pinned tile sources, applied independently of the cleanup controller changes. It uses the existing native organization controller's shared-URL and independent-copy actions; no new GN files, shared model changes, replacement menu, UI layout or page renderer are introduced.

Root global pins now show the same cyan pending-update cue and explanatory tooltip as nested pinned-folder rows. The supplied favicon, tile size, border, soft shadow and background are unchanged. The tile observes actual window organization-state changes so the cue reflects the current window's independent loaded URL.

For a loaded pin with a pending shared update, an extension of the real `TabMenuModel` adds “Use shared URL from another window” and “Keep independent copy.” Original tab/extension commands remain intact. The additional commands are handled by their exact appended model indices and never dispatched into the native context-command enum. Profile pause cancels the menu and invalidates the owner weak pointer. Command dispatch rechecks actual current model, organization availability and pending update before invoking the existing protected native navigation or durable independent-copy implementation. No URL identity matching or other-window focus is added.

Lean verification: ordered count-one replay, equivalent unified-patch byte replay and whitespace checks. Actual menu virtual APIs, original menu ownership, profile-pause invalidation, and existing controller action fences were inspected. No native build, app launch, screenshots or owner-state access. Actual pending-update menu/marker behavior remains runtime acceptance, not a claimed observation.
