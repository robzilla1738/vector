# Remaining local integration requirements

## Mini Popup

The original Settings enable switch must complete its native request successfully;
its UI already reports failure. The configured value comes from actual Local State,
not a guessed UI fallback. Native registration can fail for a shortcut conflict or
suspended handling; no Accessibility permission is implied by Carbon hotkey
registration. The shortcut-capture owner suspends registration delivery until its
capture is released or its document changes/dies. Root should verify actual
physical shortcut delivery without conflating it with a synthetic AppKit event.

The proposed native logs separate registration from callback arrival. If dispatched
appears, inspect the popup/profile result; if only registered appears, first verify
configured keys, capture suspension and genuine system delivery. Do not claim a
new input-monitoring grant or replacement shortcut implementation is required
without evidence. Current startup call is BrowserView::Init's
InitializeAuxMiniPopup(GetProfile()).

## Public desktop integration

The existing pinned audit in ../provided-desktop-tool-boundary/README.md traces the
original standard public tools. Browser interaction/screenshot uses original
REPL/CDP and Page.captureScreenshot. It does not expose generic system mouse/key/
screenshot control as a public standard tool. Adding that independently is not a
parity requirement proven by the supplied registration graph.

Computer Use is the separate original context observer, app inventory and specific
Contacts/Messages integration. It requires the expected copied helper to start and
actual applicable macOS permissions. A stopped helper's permission defaults are
not proof of grants. The remaining bounded observation acceptance needs an actual
live owner/health result and isolated observation, under the owner's approved
scope. Full Disk Access/Contacts/Messages requests are distinct; do not substitute
them for observer permissions. No new grants or helper calls were attempted here.

## Voice dictation

The supplied voice-dictation-overlay-CtbBZWfm.js captures audio through
navigator.mediaDevices.getUserMedia({audio:true}), records with MediaRecorder,
and POSTs multipart audio to the account-qualified local /stt/transcribe route.
The account URL builder rejects a missing/invalid account. The original daemon
route resolves that account and calls transcribeAudio, which invokes
fetchAsideAPIAuthenticatedMultipart against the configured authenticated hosted
API /stt/transcribe (120-second timeout). This is not a local speech model and is
not the ordinary AI-provider inference credential route.

Therefore acceptance needs: a working normal account/local daemon boundary;
actual browser microphone permission and system microphone access; a supported
recording device; and a configured reachable hosted speech endpoint with valid
account authorization for that service. Local AI-provider credentials alone do
not establish the final requirement. Preserve actual server errors; do not fake
transcriptions, silently redirect audio to a different provider, or borrow Aside
owner credentials. No recording, audio upload, credential read or service request
was made in this lane. A replacement speech backend would need a separate explicit
product/integration decision, not an invented parity implementation.

Source pins are in local-boundary-sources.json. The original daemon is static
implementation evidence, not an instruction to contact its default service.
