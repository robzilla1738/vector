# Computer Use readiness: concrete local scope

Current566 public helper: `out/provided-candidate-local-browser-pass/Aux.app/Contents/Resources/aux/apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use`.

SHA256 `3d4211d95fb5445ab2907af8bc19691a527bcbab65c08dbaaae0e33bda486665`; identifier `dev.aux.browser.computer-use`; ad-hoc hardened signature; no TeamIdentifier. Recheck exact bytes before any active test. Bundling and entitlements do not establish macOS authorization.

Actual authenticated account0 status reports helper built and stopped, with accessibility, screen-recording and input-monitoring health absent. This status read did not start the helper. Missing health is not verified permission.

The supplied `contextAwareness.requestPermissions` owner starts the helper and sends `permissions/observer`. Startup asynchronously sends policy then pause/resume; a guaranteed no-capture startup has not been established. Enabling unpaused Context Awareness may immediately capture with existing permissions. No such operation has been performed.

A bounded active check requires the owner's explicit authorization for this exact local helper, any Accessibility/Screen Recording/Input Monitoring grants that macOS requests, and potential desktop observation. OS grants can persist beyond the test. They are not restricted by macOS to our dummy webpage, so other visible apps could be observed. Close sensitive apps before that step. Do not represent the check as guaranteed single-window capture, nor grant Contacts, Apple Events or unrelated permissions based on this review.

If authorized: retain the approved disposable Aux home/account; foreground a dummy local test surface; request only the actual required permissions through the supplied implementation; have the owner handle macOS permission panels where required; observe the specific helper health, then perform one requested local action/capture with no cloud inference. Stop/disable Context Awareness afterward and record state. Do not change owner profiles, import data or broaden Keychain scope. If grant/capture is declined or unavailable, leave the helper stopped and keep Computer Use acceptance open while completing browser/chat work.
