# Native on-device dictation

Chromium Aux implements the existing `dictationStatus`, `startDictation`,
`stopDictation`, `cancelDictation`, and `onDictation` shell contract in native
macOS code. The browser process uses `SFSpeechRecognizer` with
`requiresOnDeviceRecognition = YES` and `AVAudioEngine` for transient microphone
capture. It does not send audio or transcript text to the Aux runtime or a
remote recognizer. The renderer receives only the transcript for the owning
shell and keeps it as an editable draft; it does not send or execute it.

`dictationStatus` checks support for the current macOS language without
prompting. `startDictation` prompts for Speech Recognition and microphone
permissions when necessary. If either is denied, the shell receives a
non-sensitive error. The Aux app Info.plist carries both required purpose
strings, and the existing app signing entitlements allow audio input.

Only one browser-process session may own the microphone. The browser issues
an opaque owner ID for the live shell; the renderer provides only its session
UUID. Stop and cancel calls from another shell or an old session cannot affect
the owner. Navigation, hiding the shell, Mojo client disconnect, and shell
teardown cancel capture. Stop ends audio and waits at most three seconds for a
final transcription. Cancel discards the text and ignores late Speech callbacks.
Capture stops after 60 seconds, and transcript events are capped at 20,000
UTF-16 code units.

## Verification

- Run `dictation_session_unittests` in the Aux Chromium GN build. It checks
  overlapping owners, foreign stops, stale sessions, and owner teardown.
- Run `pnpm exec vitest run --project unit tests/unit/aux-features.test.ts` in
  the Aux repository. It checks that Chromium dictation methods stay behind
  the `dictation` feature stage.
- In a disposable Profile, verify current-language support, first-use
  permission prompts, recording/partial/final events, stop, cancel, and an
  editable unsent draft. Repeat after denying each permission and after
  navigating or hiding the shell during the macOS prompt.
- Open a second Profile while recording in the first. It must not receive
  events or stop the first session. Test that an old session UUID cannot stop
  the next recording.
- Inspect the signed Aux.app Info.plist for
  `NSMicrophoneUsageDescription` and `NSSpeechRecognitionUsageDescription`,
  and its signed entitlements for `com.apple.security.device.audio-input`.

The native microphone and TCC permission run require an Aux Chromium build on
macOS with a supported on-device Speech language. Automated session tests do
not claim to exercise a real microphone or grant macOS permissions.
