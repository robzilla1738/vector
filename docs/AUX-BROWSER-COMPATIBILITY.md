# Aux browser compatibility gate

Updated 2026-09-20. Phase 1 remains active. This record separates measured behavior
from unqualified product claims. No real accounts or credential stores were accessed.

## Founder priorities

Broad SSO and passkeys are required; the founder need not enumerate sites. Prioritize
1Password, investigate Apple Passwords, and prefer existing Chrome extensions.
An Aux marketplace is conditional later work; an owned vault is exploratory. Neither
substitutes for compatibility with the founder's existing authentication workflows.

## Current evidence and consequence

| Capability | Evidence | Consequence for first review |
|---|---|---|
| Screen sharing | Modern `getDisplayMedia` uses the native macOS system picker on supported OS releases. Aux never enumerates or preselects a source; every request requires a fresh user choice. If that picker is unavailable, the request fails closed. Legacy source-id capture remains denied because Electron 43 reports it as an empty media request | Safe native source consent is available on supported macOS versions; older macOS and legacy capture remain unavailable pending a separate safe chooser |
| Media and conferencing | Separate camera/microphone decisions persist and reset; fake-camera capture and local WebRTC video/generated-audio/data exchange pass. Fake microphone capture times out in Aux and standalone Chromium reference | Real microphone, conferencing services and screen sharing remain unqualified. Generated audio is not microphone qualification |
| Popup/tab authentication plumbing | Native synthetic flows verify background-tab selection/referrer behavior, cross-origin referrer and opener continuity, IdP and RP SameSite cookies, redirect/state callback, opener messaging, blank-window navigation, POST payload, nested windows, explicit noopener, focus return and fast-close cleanup | Available for review; this does not qualify a real provider's policy, account, MFA or SSO deployment |
| WebAuthn web API | Electron 43.6.0 virtual CTAP2 authenticator completed registration/assertion; Node verified the signature, challenge, origin, RP hash and user-verification flags; unrelated RP rejected | Browser protocol path works with virtual hardware. Real platform/security-key/provider behavior remains unqualified |
| Native Touch ID | Installed API and version-pinned docs require explicit configuration and matching signing entitlement; Aux has not configured it | Not available as an Aux-qualified feature. Requires future signed identity/bundle work, currently deferred |
| Apple Passwords / synced passkeys | No integration qualified; Electron 43.6.0's documented Touch ID credentials are device-bound | Do not describe Touch ID configuration as Apple Passwords or iCloud passkey support |
| 1Password desktop integration | Vendor requires extension installation and verifies browser identity/signature; no real extension or desktop connection tested | Open compatibility gate, with signed-browser qualification needed later |
| Existing Chrome extensions | Aux now installs a chosen unpacked MV3 extension, copies it into managed storage, persists enable/disable/removal, restores it at startup, injects its content script into real regular pages and excludes it from private browsing; API surface remains partial | Useful unpacked extensions are available for review. Chrome Web Store, auto-update and broad extension compatibility remain unsupported; a marketplace alone cannot solve missing execution APIs |

## Measured extension surface

`tests/smoke/extensions-desktop.mjs` drives the actual Settings flow in a temporary
profile. It approves one synthetic unpacked extension, verifies content-script
execution on an Aux tab, performs full restarts while enabled and disabled, enables
it again, proves the same managed extension is absent from a private process, removes
it, and proves it remains absent after another restart. Aux rejects symbolic links,
bounds copied file count/bytes, shows declared manifest access before install, sets
`allowFileAccess: false`, and never loads regular extensions in private browsing.
The inspected settings surface is `release/test-artifacts/aux-extensions.png`.

This is a local developer-extension workflow. Aux copies the selected directory;
it does not watch the source, update the extension or fetch code from a store.
Removal deletes the managed copy, while Chromium profile storage may remain until
browser data is cleared.

`tests/smoke/browser-compatibility-desktop.mjs` probes an isolated synthetic extension
page with declared permissions. In Electron 43.6.0:

- Exposed functions: runtime.connectNative, runtime.sendNativeMessage, tabs.query,
  storage.local.get, storage.sync.get, scripting.executeScript.
- Undefined: tabs.create, contextMenus.create, downloads.download, cookies.get.

Presence is **not functional qualification**. In particular, no native host was
called and storage.sync was not verified to sync. The probe does not enumerate
all APIs or prove a particular third-party extension works/fails. Electron's
published subset remains the support baseline; do not infer full support from a
function existing. Re-run on any candidate shell/version.

The resulting nonsecret evidence is `release/test-artifacts/aux-browser-compatibility.json`.
It contains capability results, not credentials. The authenticator and extension are
removed and their temporary profile deleted on exit. The initial fixture used an IP
RP identifier; corrected to localhost before the successful protocol verification.

## Architecture decision and next coordinated work

Keep the current development app usable for the first hands-on review. Do not build
an extension marketplace, password vault or broad API-shim layer to mask this gate.
The current Electron shell is not qualified as the final compatibility solution.

Before declaring Phase 1 complete, compare a maintained full-Chromium browser shell
against the actual extension and native-identity requirements, with the Aux runtime,
saved-data contracts and design retained. A candidate must demonstrate extension
installation/update/removal, permissions, 1Password integration, supported passkey
providers and representative SSO; having Chromium rendering is insufficient.
Account-specific tests and signed-native integration stay explicit follow-ups; the
no-bundle instruction remains in force. Continue independent daily-browser work
while resolving this architecture gate. Do not silently disable identity checks or
read credential stores to make a candidate pass.

## Candidate comparison — 2026-09-19

A clean run of `tests/smoke/chromium-extension-baseline.mjs` against the existing
Playwright Chrome for Testing 153.0.8010.12 binary demonstrates real extension tab
creation/removal, local storage round-trip, page script injection, cookie write/read/
removal and context-menu creation/removal. All APIs in the Electron presence probe
are exposed there. Downloads, native messaging and sync remain presence-only checks;
no native host, real account, Web Store or credential provider was invoked. Evidence:
`release/test-artifacts/aux-chromium-extension-baseline.json`. This is a different
browser/version baseline, not a controlled single-variable comparison or Aux result.

| Path | Assessment | Decision |
|---|---|---|
| Current Electron + extension API shims | Existing UI/runtime works, but extending the partial extension implementation creates more browser-platform maintenance | Retain for immediate development review; do not grow a general Chrome compatibility shim |
| CEF Alloy embedded into the existing macOS window | Current CEF macOS header forces Alloy for a supplied parent view; Chrome-style functionality cannot be assumed for that embedding path | Reject as a claimed drop-in solution |
| CEF Chrome-style Views shell | Upstream offers Chrome UI/browser functionality, but at most one Chrome-style BrowserView per window; a Chrome-owned window/tab model would need integration with Aux's custom shell | Candidate for a native prototype, not qualified or selected as the final implementation |
| Maintained Chromium browser-layer shell | Reference browser demonstrates the extension primitives missing from Aux; retains browser-level rather than rendering-only integration | Preferred architectural direction for final compatibility; custom UI, native identity, updates and migration still require proof |

**Execution decision:** preserve the working Electron first-review path and the
existing runtime. Final compatibility work must retain the Chromium browser layer,
not simply replace one embedded renderer with another. The next native prototype
must prove Aux sidebar/tab control and a single human/agent profile alongside real
extension behavior before migrating production state. A CEF-based prototype fails
if preserving the design requires falling back to Alloy and losing the required
browser features. No final shell migration has been performed or qualified.

The no-app-bundle instruction still applies: neither a CEF nor Chromium app was
built, signed or installed. The comparison used an already available test browser
with isolated HOME/profile and mock-keychain/basic test credential storage. Keep
ordinary browsing fixes portable where practical; do not block independent Phase 1
work on native prototype/signing acceptance or replace the Aux design with stock
Chrome as a shortcut.

## Screen-sharing permission boundary — 2026-09-19

`tests/smoke/screen-sharing-boundary-desktop.mjs` submits both a user-activated
`getDisplayMedia({video:true})` request and a legacy desktop `getUserMedia` request
from the same synthetic page. A deny-only permission observer records identical
permission requests: `media`, `mediaTypes: []`, same origin/frame metadata. Both
reject with NotAllowedError; no screen enumeration, OS grant or capture occurs.
Evidence is `release/test-artifacts/aux-screen-sharing-boundary.json`.

Version-pinned Electron source (`WebContentsPermissionHelper::RequestMediaAccessPermission`
and `MediaAccessAllowed`) explains why this matters: device audio/video types get
labels, display types do not; legacy desktop requests go to HandleUserMediaRequest,
while modern display requests go through ChooseDisplayMediaDevice. Production never
grants the ambiguous empty media request. Modern capture instead uses Electron's
separate native macOS system-picker path, keeping source selection outside Aux;
legacy capture still fails closed. The artifact records the original boundary
investigation and must not be read as the current product behavior.

Older macOS versions without the native picker still need a safe chooser before Aux
can grant capture. This remains part of the Phase 1 compatibility boundary, not
justification for a renderer bypass or a blanket media permission.

## Private-window isolation status — 2026-09-19

Aux now opens New Private Window from the regular File menu into a separate Electron
process. That process reuses the real Aux shell and original sidebar model, but does
not start the runtime, open a production CDP endpoint, load extensions, or use the
regular tab/history/settings databases. Shell and page sessions are nonpersistent;
history, permissions, bookmarks and download status exist only in memory. Agent,
project and settings controls are absent. Explicitly saved downloads remain on disk
and the private home states that consequence.

`tests/smoke/private-desktop.mjs` verifies the real command path, zero-width sidebar
collapse and restore, nonpersistent Chromium sessions, cookie/localStorage/form/tab/
history separation after restart, absence from regular runtime data, scratch-profile
cleanup and the lack of a production remote-debugging switch. It also exercises a
real `beforeunload` form: Stay preserves both tabs and the draft; Leave closes the
private process. Rendered shell evidence is in `aux-private-home.png` and
`aux-private.png`. Only synthetic local pages and profiles were used.

The earlier hidden-window probe remains useful negative evidence: an in-memory
partition inside the regular debug/runtime process would still expose the private
target and could persist page metadata. The shipped source path avoids that design.

A single whole-app Quit now preflights the regular process and every private child
before closing any of them. Private processes prepare and hide after their documents
approve leaving, validate that the approved document set has not changed, and commit
only after every process agrees. A later Stay decision aborts earlier approvals and
restores the regular and private windows with their tabs, form state and scratch
profiles intact. The retained product journey exercises two dirty private windows,
including that later-veto case, then verifies that unanimous Leave closes everything
and removes both scratch profiles. Closing only the regular window still leaves private
windows running by design. Multiple regular windows now own independent native stages,
selected tabs and sidebar layouts while sharing the regular profile and runtime; their
restart and dirty-document behavior is qualified in `progress/2026-09.md`.
Private crash recovery and agent access remain intentionally absent; ordinary process
failure relies on the nonpersistent session boundary, while user-saved files remain
durable.

## CEF mixed-Views source probe — 2026-09-19

The CEF runtime-style contract permits a Chrome-style Window to host one Chrome
BrowserView alongside Alloy BrowserViews. `experiments/cef-shell/layout-probe.cc`
compiles against pinned CEF 152.0.7 SDK headers and uses that arrangement: Chrome
for website content, Alloy only for trusted Aux UI. No runtime was launched or user
profile migrated. This sharpens the candidate direction without establishing its
actual tab integration, rendered quality or browser compatibility. Running the macOS
experiment needs a development-test .app and therefore remains deferred under the
current no-app-bundle instruction. See the experiment README for the exact acceptance
gate when that prerequisite is later authorized.

## BR-06 refresh — credentials, import and feasibility decisions (2026-09-22)

### Human credential experience — implemented and unit-qualified

The Aux vault now serves the human login path, not only agent grants. Secrets live
in the OS-encrypted native store under deterministic item names (restart and
keychain continuity hold), are revealed only inside the main→page boundary for an
explicit fill, and never enter model context, observations, logs or saved results.

- Trusted fill: right-click "Fill sign-in" and palette "Fill sign-in…" resolve
  password-kind items for the exact page origin in main, then fill the chosen
  frame. `vault.fill` validates the frame's normalized http(s) origin against the
  item's stored origin — subdomains, sibling domains, lookalike hosts, other ports
  and credential-bearing URLs are denied and recorded. Fill is user-initiated only.
- Save/update prompts: an isolated-world detector reports the account name (never
  the password) on submit and submit-ish clicks; main captures the field values in
  the reporting frame (subframe-aware via `framesInSubtree`), compares an existing
  item's stored secret without revealing it, and stays silent when nothing
  changed. The banner offers Save or Update; Update rewrites the secret in place.
- Locked vault: offers still capture and the banner collects the passphrase for
  unlock-then-save; a wrong passphrase keeps the offer open with an inline error.
- Generator: `vault.generate` produces 12–64 char passwords from a CSPRNG over a
  no-lookalike alphabet; the Settings save form fills it on request.
- Explicit import/export: Settings → Vault exports all live items to a
  user-chosen JSON file (mode 600) and imports `aux-vault` exports back with
  per-entry validation and origin+username+label dedupe.
- Non-password vault kinds ("secret") are excluded from the sign-in surface.
- Private browsing never installs the detector, offers, or the banner.
- Agent surface unchanged: task grants use opaque credential references; external
  clients can read vault metadata but cannot reveal, import, export, update or
  fill secrets. `vault.fill`/`export`/`import`/`update`/`secretMatches` run
  main-process-only via `desktopUser`.
- Evidence: `tests/unit/human-vault.test.ts` (21 cases) covers exact/wrong/
  lookalike/subdomain origins, revoked and expired items, credential-bearing
  URLs, secret-match silence, update, generator bounds, export/import round-trip
  with dedupe, fill/capture scripts in jsdom (field targeting, disabled/hidden
  fields, serialization safety) and the detector (username-only reports,
  submit+click coalescing).

### Browser-data import — implemented and unit-qualified

Settings → Data → Import is preview-first: it lists each installed source with
per-category availability and blocker text before anything is copied. Chromium-
family profiles (Chrome, Chrome Beta, Chromium, Edge), Arc and Firefox are read
from on-disk stores; Safari is offered with a Full Disk Access blocker when macOS
denies the directory. Attached Chrome contributes its live tabs as an "open tabs"
category. Runs execute in the runtime (off the UI thread), emit per-category
progress, are cancellable mid-run, and report per-source partial results — a
failed or locked source never blocks the rest. SQLite sources are WAL-aware
snapshots taken read-only; source browser files are never mutated. History
dedupes on `(url, visited_at)`; bookmarks dedupe by URL with Arc sidebar
metadata (space/folder/pin/title) folded in where present.

Deliberately not imported: other browsers' encrypted credential stores (Chrome
"Login Data", Firefox `logins.json`, Safari keychain entries). Importing those
requires the source browser's own key material and is out of scope; cookies stay
on the existing count-only CDP/profile path, and the native vault above is the
scoped credential experience.

### Feasibility decisions — recorded early, per roadmap

- **Extension native messaging.** `runtime.connectNative` and
  `runtime.sendNativeMessage` are present in Electron 43.6.0 (measured). A real
  host still needs a registered `NativeMessagingHosts` manifest and the browser
  identity a signed bundle provides. Decision: API-level support only; host
  qualification deferred with signing. Extensions that require a native
  companion (1Password desktop unlock) remain unqualified — the native vault is
  the scoped credential experience for daily browsing until then.
- **Passkeys.** Virtual CTAP2 authenticator registration/assertion verified.
  Platform and synced passkeys require `app.configureWebAuthnOptions` plus the
  Touch ID entitlement on a signed bundle — deferred with signing. WebAuthn
  continues to work for security keys at the protocol level.
- **DRM.** Electron ships no Widevine CDM; licensing and bundling it is a
  separate component agreement (and hardware attestation for premium tiers).
  Decision: DRM-protected streaming is out of scope for this build; documented
  rather than silently failing.
- **Full Chrome extension parity.** Managed unpacked extensions with permission
  review, identity-pinned updates, atomic rollback and private-mode exclusion
  are supported. Chrome Web Store install, auto-update and broad API parity
  remain out of scope; the measured API subset above is the support baseline.

## Primary sources

- [Electron extension support](https://www.electronjs.org/docs/latest/api/extensions)
- [Electron 43.6.0 platform authenticator contract](https://github.com/electron/electron/blob/v43.6.0/docs/api/app.md#appconfigurewebauthnoptions-macos)
- [1Password additional browsers](https://support.1password.com/additional-browsers/)
- [1Password browser connection security](https://support.1password.com/1password-browser-connection-security/)

- [CEF runtime styles and view limits](https://github.com/chromiumembedded/cef/blob/master/include/internal/cef_types_runtime.h)
- [CEF macOS parent-view constraints](https://github.com/chromiumembedded/cef/blob/master/include/internal/cef_types_mac.h)
- [CEF browser-view toolbar interface](https://github.com/chromiumembedded/cef/blob/master/include/views/cef_browser_view.h)

- [Electron 43.6.0 media permission dispatch](https://github.com/electron/electron/blob/v43.6.0/shell/browser/web_contents_permission_helper.cc)
