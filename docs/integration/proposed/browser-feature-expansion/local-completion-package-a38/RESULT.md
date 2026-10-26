# Aux disposable-profile candidate — ready for local testing

The bounded fresh-profile milestone passes its listed actual-app checks. This is a local development candidate, not a full-product or release-ready declaration.

**App:** `/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app`

**Launch:** the adjacent `Launch Aux.command` (requires this local workspace). Aux is left open on Work's New Tab page. Startup to daemon readiness took about 20 seconds on the final restart.

The approved **Aux Browser A38 Disposable** support/cache namespace contains the synthetic Work and Personal profiles. The original nonempty `Aux Browser` folder was not moved, adopted or modified. The accepted app remains intact. No release, provisioning, notarization, new entitlement, new OS grant, owner-profile access or provider inference occurred.

## Working — actual app observations

| Check | Result |
| --- | --- |
| Protected launcher, paired daemon and native initialization | Pass; normal profiles, no incognito |
| Navigation | Local links, public HTTPS and back/forward passed during this milestone; final restored local page works |
| Two isolated profiles | Pass; Work/Personal retain different cookies, localStorage notes and native `/u/0` versus `/u/1` contexts |
| Active profile switching | Pass; each profile retains its own draft; Work TXT chip does not appear in Personal |
| Draft and attachment persistence | Pass for a newly edited Work draft, separate Personal draft, TXT chip and Recent files metadata after clean restart; attachment content/provider consumption is not claimed |
| Multiple windows | Work plus two Personal windows restore; Personal windows retain independent selected views and the shared normal tab list |
| Normal Quit | Pass; kernel reports browser exit 0 and daemon exit 0, existing memory helpers terminate/reap; all JS shutdown stages settle, no native deadline, guardian `groupStopped=true`, `forced=false` |
| Same-build restart | Pass; exact signed package reopens and restores the above state |
| Sidebar/chat/settings | Final build opens chat, collapses/expands the left sidebar and shows General/Appearance/Memory correctly |
| Local memory | Running normal, 100%, 10 chunks; search remains unverified |
| Commands and tab close | Centered Cmd+T/K/L commit/cancel, live footer rename/roster refresh and real beforeunload Cancel/Leave passed on the retained unchanged implementation during this milestone |
| Native CLI | Actual URL/profile destination passed earlier in the milestone; CLI code/signature retained |

The final assembled components are browser/framework **A78**, daemon **A72**, paired source **A51** and unchanged **UI33**. All 19 reviewed objects verify with the existing Robert Courson development identity/profile/entitlements. The final repair re-signed only the daemon and outer app, retaining 17 signatures. The external acceptance receipt binds signed inventory `03542e0336ecd93ee2f0b790905219d454288292f6ceeb236dc211e2b7852bab`:

- `disposable-location-review-a4/actual-integration-signing-a18.json`
- `disposable-location-review-a4/actual-focused-checks-a18.json`
- `out/local-completion-runtime-a4/launch-15.log` and `kernel-exit-a18.json`: clean Quit
- `out/local-completion-runtime-a4/launch-16.log`, `health-16.json`, Work/Personal AX captures and final screenshots: same-build restart

Successful compilation or signatures were not counted as runtime acceptance. Earlier failed snapshots, patches and receipts remain recoverable. The bundled pre-test acceptance marker is deliberately not rewritten after testing; the external receipt identifies the exact tested bytes.

## UI comparison and known limitations

Existing UI resources, styles, fonts, artwork and native layout values were preserved. The actual new-tab/chat/sidebar views were compared with the prior Aux capture and saved supplied Aside captures. The current system/backdrop produces light-gray glass, like the prior accepted Aux capture; the saved Aside references are darker. This is preservation of the accepted Aux UI, not certification of whole-window pixel parity across different backdrops or every state.

A nonblocking `analytics.identify` request logs 500 because generic subprocess execution is disabled. One retained Recovery fixture from an earlier failed close remains in the second Personal test window; fresh ordinary close and genuine beforeunload handling were fixed and passed. Advanced recovery was deliberately not expanded to clean up that historical fixture.

Use **Launch Aux.command**. Direct Finder/unmanaged launch has not been accepted: an earlier desktop-tool relaunch bypassed the protected launcher and never established readiness. This package is not a portable installer.

## Still needs implementation

- Third-party native messaging needs per-Profile host ownership, physical settlement and sandbox integration. 1Password desktop/autofill compatibility is not accepted; a permissive generic native bridge was not enabled.
- General exec/PTY, Computer Use and arbitrary native addons remain disabled. Full agent-tool parity needs a separate bounded implementation milestone.
- Production cloud integration/operations and a final full-product feature/UI/identity inventory remain unfinished. Visible advanced-feature controls are not proof every feature is complete.

## Still needs testing or setup

- Account-backed BYOK/eligible ChatGPT connection: user consent, inference, refresh and revocation. This requires a real provider connection; no key or account was used here.
- Chrome Store/third-party extension, native-host and autofill checks after native-messaging integration.
- Genuine pointer hover (the desktop API has no hover action), broader attachment/content/crash cases and advanced-feature acceptance.
- Memory search: the attempted own-client DevTools query was blocked by paste protection; the warning was respected and no query ran.
- Production cookie-key behavior: this development browser uses mock Chromium Keychain storage. Production sign-in/sync/sharing/speech, backup/key custody, alerts and operational restore remain unaccepted.

Legacy Aux profiles remain refused. Migration, advanced recovery, the larger task-capability architecture, mobile and payments are deferred. Their consequence is a fresh/disposable local build without those compatibility or service guarantees.

Release signing, notarization, updater, installation/distribution and production acceptance are separate remaining release work. No next feature batch was started.
