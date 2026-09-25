# Aux B7 native capture matrix

`tests/host/native-capture-matrix.mjs` prepares the core native-window capture pass. It connects to an isolated Chromium-fork candidate, opens only local fixture tabs, and uses macOS `screencapture` on the Aux window. CDP screenshots are insufficient because the embedded page and window material are composited outside the WebUI target.

List the eight layout, theme and surface cases without starting Chromium:

```sh
node tests/host/native-capture-matrix.mjs --list
```

After the candidate passes `tests/host/candidate-shell.mjs`, grant the terminal Screen Recording permission and run:

```sh
AUX_CANDIDATE_PROFILE=/tmp/aux-candidate-profile \
AUX_NATIVE_WINDOW_ID=12345 \
AUX_CAPTURE_REDUCED_TRANSPARENCY=0 \
AUX_CAPTURE_REDUCED_MOTION=0 \
node tests/host/native-capture-matrix.mjs --capture
```

The profile must live in `release/test-artifacts` or the system temporary directory. Obtain the decimal window ID from the running **candidate** window, and visually confirm it before capture. Repeat with macOS Reduce Transparency and Reduce Motion enabled, setting the two expected values to `1`. Captures and `manifest.json` stay under `release/test-artifacts/native-b7/` by default. The manifest records geometry and preference state but deliberately keeps `qualified: false`; each image still needs visual inspection, reference comparison and VoiceOver evidence before a B7 surface is marked verified.

This initial matrix covers horizontal and vertical home and live-page layouts in dark and light themes. Surface-specific journeys can call the same native screenshot path as their controls are qualified in the fork.
