# Stable browser actions with genuine target profile bindings

This is a Chromium 155 adaptation required by the supplied same-window profile
transaction. Keep the existing root and every existing child ActionItem, including
its raw references, observers, invocation metrics and dynamic view ownership.
The three original callbacks that captured a Profile pointer now retain the same
window and resolve its actual profile at invocation (two new-private-window
commands and the Linux system-titlebar command). Their real checks and commands
remain unchanged.

The Mac transaction destroys only the internal preference listener before identity
changes. Commit points the same BrowserActions at the authoritative target. Nine
profile-conditional action IDs use the six exact original builder blocks and real
service/support predicates; existing items receive the target definition's
visibility, enabled state, text, tooltip, image and owned properties, while missing
target items are registered normally. Unsupported items retain identity but are
hidden and disabled. No root/action graph replacement or whole initialization is
performed. Those callbacks already resolve the stable window; the old service's
configurable contextual-cue callback is explicitly retired to its original
unconfigured callback before target configuration.

Target policy and menu properties use the original predicates. A fresh internal
listener subscribes to real target prefs and applies its existing sharing/QR policy
handlers. Existing source-profile callbacks, menu/page action objects and old
renderers are not transferred into the target. The full provider must retire old
profile UI/service owners before this phase, rebind these actions before target
toolbar/side-panel registration, and perform real tab/command settlement afterward.
Closed dynamic menus must retire their own model callbacks through their existing
lifecycle; this patch is not an alternative lifecycle for an open menu.

Phases: CanRebindForAuxProfileSwitch(target), BeginAuxProfileSwitch(target) returns
a generation; RebindAuxProfileSwitch(generation) requires actual target identity
and an empty tab model; EndAuxProfileSwitch(generation) restores actual source
bindings on abort. No extra window, fake service or successful switch trigger.
Source pins and exact native patch are in manifest.json. Runtime acceptance remains
outstanding; successful compilation is separate evidence.
