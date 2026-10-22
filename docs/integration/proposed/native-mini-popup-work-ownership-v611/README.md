# Mini Popup pending-work ownership, native611

The global shortcut wiring is present: BrowserView initializes the popup owner;
Settings awaits native setEnabled/setShortcut; the parser accepts
Command+Shift+Space; Configure requires real global registration success; macOS
RegisterEventHotKey installs the Chromium Carbon handler; its event dispatch
reaches PopupManager::OnKeyPressed and ShowFor. A failed synthetic key attempt
alone does not establish a product defect. No substitute shortcut handler or
permission request was added. Successful registration and callback arrival now
have distinct INFO log lines, containing no profile paths, text or credentials.

A concrete separate defect exists: ShowFor/Configure can BindProfile and destroy
the old popup renderer even while its native directory chooser or renderer's
original pending-file/router blocker is active. A shortcut in another profile,
explicit switchProfile, or disabling/reconfiguring from another profile could
therefore discard unfinished work. Existing generation checks only prevent stale
callbacks from affecting successor windows; they do not preserve old work.

This proposal checks those actual pending owners before replacing the profile or
disabling the popup, and before modifying shortcut registration/preferences.
Explicit switchProfile returns the original extension API error path; global
shortcut dispatch logs a refusal. Same-profile opening and shortcut updates retain
the existing windows. The frame predicate matches the existing sidepanel boundary
and deliberately excludes ordinary pagehide/visibilitychange listeners. The
supplied router's conditional-beforeunload transformation is required (already
integrated). No busy flag is reset, operation canceled, or work migrated.

This is bounded pending-work protection, not proof that arbitrary completed
Mini Popup drafts survive destruction or that all active daemon tasks migrate.
Profile teardown/shutdown remain the original destruction path. Public API
shape, visuals, popup dimensions, focus generations and chooser callbacks remain.

Nine count-one edits in one native file; native611 composition/input/output hashes
are in files.json. Exact pin and git apply --check passed. The referenced frame
API already compiles in the existing native sidepanel owner. No native build,
app launch, helper operation, signing, OS grant or paid send was performed.
Integrator should include the proposal in its next build, check real shortcut
receipt versus dispatch, and exercise a pending picker/profile-switch refusal
followed by cancellation and ordinary reopening.
