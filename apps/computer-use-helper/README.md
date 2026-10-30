# Aux Computer Use helper

Aux's own build of `Aux Computer Use.app`, the helper the daemon runs for Context Awareness and a few one-shot commands. It speaks the protocol in [docs/spec/computer-use-helper-protocol.md](../../docs/spec/computer-use-helper-protocol.md) and keeps the supplied identity: bundle path, executable `aux-computer-use`, `CFBundleIdentifier` `dev.aux.browser.computer-use`, display name, `LSUIElement`, and the TCC responsibility disclaim (`AUX_TCC_DISCLAIMED=1`, spec 8.1).

## Build and test

```sh
apps/computer-use-helper/build.sh                     # → apps/computer-use-helper/.build/app/Aux Computer Use.app
python3 apps/computer-use-helper/tests/session_test.py
```

`build.sh` runs `swift build -c release --arch arm64` and assembles an unsigned bundle with Aux's icon and menu-bar template from `assets/brand`. `VERSION` and `BUILD` set the bundle versions (default `1.0.0` and `1`). `LSMinimumSystemVersion` is 15.0.

The test drives a synthetic NDJSON session (health, policy, menu, resume/pause, both `permissions` kinds, `invoke`, protocol errors, `shutdown`, stdin EOF) and the one-shot `permissions.check`, `applications.list`, usage errors and a refused data command. Every stdout line is checked against the daemon's schema. The `permissions` step shows the sheet for a moment; nothing is granted.

## Release

```sh
python3 scripts/release/assemble.py … --computer-use-helper 'apps/computer-use-helper/.build/app/Aux Computer Use.app'
```

Before signing, `assemble.py` replaces the supplied helper with this app and re-pins `AuxComputerUseHelperLaunchPolicy.json` (`sha256`, `bytes`) to the new unsigned executable. Signing then re-pins it to the signed bytes, as it already does for every helper. It refuses when the policy does not pin the supplied helper or the app is not `dev.aux.browser.computer-use`.

`sourceSha256` stays `debc03de…dde51`. `aux-daemon` compares it with a compiled constant and does not hash any source file at launch, so **no aux-daemon rebuild is needed**. The constant now names a provenance record, not this binary.

## What the observer does

Accessibility observation only. It follows the frontmost app (`NSWorkspace`) and, through an `AXObserver`, its focused and main window, window titles, focused element and selected text. On a change it walks the focused window's AX outline and sends `window.changed` with `ax.text` (full tree first, then a diff). When `policy.screenText` is on and a window has no AX text, it OCRs that one window on device and sends `screen.ocr` text only.

It reads **no keyboard or pointer input**: no event tap, no `CGEventTap`, no Input Monitoring, no key contents and no keystroke timing. So it never sends `keyboard.*`, `mouse.*` or `browser-signal` lines. Selections are sent only when non-empty, so caret moves while typing produce nothing. Idle state and `attention.inputAgeSeconds` use the system's time since any input (`CGEventSourceSecondsSinceLastEventType`, any event type), polled every 5 s.

Input Monitoring is reported as not used:

- `health` never carries `inputMonitoringTrusted`, `eventTapHealthy` or `inputTapRunning`. It carries `inputCaptureAvailable: false` (a field the daemon's schema already has) and `inputMonitoring: "not-used"` (an extra key the non-strict schema ignores).
- `permissions.check` adds `accessibility`, `screenRecording` and `inputMonitoring: "not-used"` to the spec's four fields.
- The permission sheet lists Accessibility and Screen Recording only, and the bundle has no `NSInputMonitoringUsageDescription`.

Because the daemon reads a missing `inputMonitoringTrusted` as `false`, `contextAwareness.permissions` reports `inputMonitoring: false`. That screen is hidden in Aux's Settings. After a grant-triggered relaunch the daemon may re-send `permissions kind:"observer"`; the helper shows the sheet only when a permission the policy needs is still missing.

Other behavior:

- Starts paused and records nothing until a `policy` and a `resume` arrive (G7). `health` is sent at launch, every 10 s, on request, and when state or a permission changes.
- Exits 0 on stdin EOF, `shutdown`, SIGTERM or SIGINT, after `session.ended {reason:"shutdown"}` for an open session and a final `health {state:"stopped"}`. A closed stdout also exits.
- Suppression counts (`excluded-application`, `excluded-domain`, `private-window`, `secure-input`, `secure-target`) go out once a minute. Aux itself, system surfaces and the helper are never observed.
- `permissions kind:"messages"` answers at once with `menu-action messages-permissions {completed:false}`.
- The menu-bar item appears the first time the daemon resumes the observer. It has Pause (30 minutes, 1 hour, until tomorrow) or Resume, Clear History (with a confirmation), Clear Last App Session, Recent Applications (include/exclude per app and domain), Settings, Allow Permissions and Quit Aux Computer Use. Each reports a `menu-action`.
- The sheet's Allow buttons open the spec's Privacy & Security deep links (`Privacy_Accessibility`, `Privacy_ScreenCapture`) and float a guide beside System Settings with the helper's icon to drag into the list.

## One-shot commands

`aux-computer-use <command> [--json <object>] [--no-dialog]` writes one envelope (spec 7.2). `permissions.check`, `applications.list` and `lifecycle.shutdown` work. Every Messages, Contacts and KakaoTalk command validates its required fields and then fails with `AUX_COMPUTER_USE_EXTERNAL_DATA_UNAVAILABLE`: the release route refuses them anyway (spec G2).
