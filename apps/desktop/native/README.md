# On-device dictation

`dictation.swift` is Aux’s macOS Speech/AVFoundation helper. The desktop build compiles
it for the current architecture, targeting macOS 13 or later, with an embedded privacy
usage description. The app also declares microphone and speech usage descriptions.
Building it requires Apple’s Swift command-line tools.

`aux-dictation --status` checks support for the current macOS locale without requesting
microphone or speech authorization. Normal operation requests authorization, streams
partial text as newline-delimited JSON, and accepts `stop` or `cancel` on stdin. Closing
stdin also exits. Recording stops after 60 seconds; the host bounds the entire session
(including permission prompts) to 90 seconds. Audio is never written to disk by Aux.

The recognizer must report on-device support, and each request requires on-device
recognition. There is no network transcription fallback. Unsupported locales do not
expose a nonfunctional Dictate control. A supported locale can still fail when the user
denies permission or an input device is unavailable; the conversation presents recovery
text and keeps any partial transcript available for review.

The main-process broker admits only the trusted regular shell, ties events and stop/
cancel operations to the requesting WebContents and session ID, and stops capture when
the view is destroyed/reloaded, its window hides/closes, or Aux exits. Pending startup
can be cancelled before a helper starts. No runtime or webpage RPC can request capture.
The renderer stops its session when the conversation unmounts and retains the uninserted
transcript in window-local memory for that conversation. Switching panel/full-page views
returns to editable review instead of continuing hidden capture. Text is inserted only by
an explicit user action and is then handled as an ordinary editable draft.

Evidence: helper compiled; read-only status reported on-device en_US availability on
this development Mac; renderer fixture exercised recording, stop, review editing and
insertion while preserving an existing draft. Real microphone/permission and packaged
TCC attribution have not been exercised. The fixture `?dictation=fixture` generates
synthetic text and never accesses audio. Tap-to-start/stop and hold-Space-to-talk are implemented. Releasing Space during startup
cancels the pending capture; releasing during recording finishes into review. Recording
stops when changing conversation surfaces; its transient transcript remains reviewable.

Escape stops capture into review. Escape from review collapses it to Review dictation;
the transcript stays available until Insert or explicit Discard. Broker lifecycle tests
use simulated helper processes and do not establish native microphone/TCC behavior.
