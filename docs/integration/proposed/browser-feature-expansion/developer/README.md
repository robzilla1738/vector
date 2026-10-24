# Page capture and developer tools integration

This slice preserves the supplied Screenshot overlay, area selector, result
preview, animation, copy control and existing Settings rows. It adds commands and
a native page/document boundary; it does not capture the desktop or request OS
permissions. No owner page, file, account, vault or real provider was accessed.

## Native integration owned by the root

Add `source/chrome/browser/ui/aux_page_capture.cc` and
`aux_developer_commands.cc` to the selected native target, with their headers.
Private API wrappers remain root-owned and must restrict each method to the real
installed Agent extension and sender-derived Profile. Never accept a Profile
path, WebContents pointer, or alternate window fallback from the renderer.

- `getPageCaptureTarget({generation})`: actual search-owner/current command
  generation and genuine user intent; resolve its actual active pane and call
  `GetAuxPageCaptureTarget(profile,pane)`. The command sends `capture:open` to
  exactly the returned native tab/document, reusing the supplied toolbar.
- `beginPageSurfaceCapture({tabId,documentId})`: installed Agent/background
  context, genuine capture interaction; resolve only the actual active pane of
  the sender's profile/window. Pass that pane and supplied document ID to
  `BeginAuxPageSurfaceCapture`. The helper compares the ID with native
  `ExtensionApiFrameIdMap`, rather than trusting a JavaScript identifier.
  Its `owner_current` callback must bind the real window, active pane and
  protected profile-admission epoch, and become false on retirement/switch.
- `capturePageSurface({capability})`: async `CaptureAuxPageSurface` reply.
- `validatePageSurfaceCapture({capability})`: native validation before any image
  returns from the supplied background to its content script.
- `cancelPageSurfaceCapture({capability})`: revoke and remove the capability;
  return success after native cancellation. The background always calls this in
  `finally`, including provider-free native and failed full-page capture paths.
- `getDeveloperSettings()` / `setDeveloperMode({enabled})`: actual Settings owner,
  current admitted profile and user intent for mutation. The helper uses the real
  Chromium extensions developer-mode preference and respects modifiability and
  private-profile restrictions. This is a normal UI preference, not a fabricated
  durable task-completion receipt.
- `openDeveloperTools({generation})`: actual search-owner generation + active
  pane; call `OpenAuxDeveloperTools`. It uses `IsInspectionAllowed` and the
  existing native DevTools window. No policy or trust override is introduced.
- `openExtensionManager({generation?})`: with generation require actual search
  owner; without it require actual supplied Settings owner. Resolve its exact
  native BrowserWindowInterface and call `OpenAuxExtensionManager`. The real
  `chrome://extensions` page controls installation, load-unpacked confirmation,
  permissions and removal.

Add `developer: GetAuxDeveloperCommandState(profile, actualPane)` to the existing
native command context. That enables only the actual available commands.

## Counted source adapters

UI order: NAV → Tidy → Files → Media → `transformAuxDeveloperUi`; apply
`transformAuxCaptureUi` in the same post-identity source staging pipeline.
The latter patches actual `background.js` and
`assets/capture-result-nUfmrYC9.js`, preserving component/CSS structure.
The supplied download button now uses its existing `downloads` permission and
`chrome.downloads.download({saveAs:true})`, so the native save dialog remains the
file-write owner. Copy retains the supplied Clipboard API and user gesture;
copy/save failures use the existing toast component instead of disappearing.

`transformAuxCaptureDaemon` adapts both actual daemon entries. Full-page capture
keeps the existing renderer session, layout metrics, scroll/tile composition and
restoration. Its authenticated local route now requires a native document
capability. `Page.enable` binds that lease to the existing native CDP guard;
subsequent reads, deferred sends and replies remain under the sticky native
session guard. No new automation client/session/frame IDs are fabricated.

Apply `transformAuxCaptureNative` to the actual
`chrome/browser/devtools/chrome_devtools_manager_delegate.cc` **after** the
existing tab-reference guard transform. It adds the page-capture guard as the
fallback for its separate capability registry; ordinary unbound CDP is unchanged.

## Boundaries and cancellation

Native capture retains an opaque one-minute WeakDocumentPtr/actual target/profile
lease. It refuses hidden, navigating, unsupported, or policy-restricted pages,
checks the owner at dispatch, copy completion and encoding completion, and never
returns pixels after a pending navigation or profile/pane switch. Capture is
limited to HTTP(S) page surfaces, 32 megapixels and 16 MiB of PNG data. Full-page
capture uses the same pixel bound before allocating tiles. Too-large pages get an
honest error directing users to an area capture.

The supplied background no longer guesses the focused window when sender tab or
document identity is absent. Full-page transient CSS and scroll restoration also
has an own-document visibility/pagehide cleanup listener, so profile changes do
not require an unsafe CDP cleanup command against a newly selected document.
No surface is silently substituted, and no OS desktop capture is used.

## Focused evidence and remaining acceptance

Four focused tests in `aux-productivity-capture.test.mjs` passed: exact native
identity/capability routing, refusal after profile drift without returning pixels,
policy-aware command visibility/document-targeted capture opening, and actual
supplied command/settings/background/result/paired-daemon composition plus syntax
checks. Existing command CSS class strings are unchanged. Native delegate hooks
are counted against the supplied document-guard source. These are source and
fixture checks, not actual page screenshots or native build success.

The integrator still must compile the added native units/wrappers and inspect a
small disposable page: area/viewport/full capture, native save cancellation,
clipboard copy, page/pane navigation during capture, DevTools target, and the real
extension manager/developer-mode control. Do not replay broad unrelated suites.
