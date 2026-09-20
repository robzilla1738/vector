# Aux browser-layer candidate

Status: source-only layout probe; **not a runnable or qualified Aux replacement**.
The existing Electron app and user profile remain untouched.

## Concrete experiment

`layout-probe.cc` creates a Chrome-style Views window with one Chrome-style content
BrowserView and one Alloy-style trusted UI BrowserView. This arrangement is allowed
by the pinned CEF API. It keeps website content on the Chrome browser layer while
leaving a web-rendered sidebar possible. A content view that reports Alloy causes
construction to fail; substituting Alloy for website content would invalidate the
compatibility experiment.

The file compiles against the SDK below. It does not include a product launcher,
CEF renderer bindings, a duplicate sidebar, or mock controls. The caller must supply
clients and request contexts. It does not prove that Aux can control Chrome's tabs,
that the existing React shell can operate through CEF, or that any real extension,
password manager, SSO provider or screen-sharing workflow works.

## Reproducible SDK pin

- CEF: `152.0.7+g83ffcba+chromium-152.0.7977.83`
- Architecture: macOS ARM64
- Publisher archive: `cef_binary_152.0.7+g83ffcba+chromium-152.0.7977.83_macosarm64_minimal.tar.bz2`
- Publisher SHA-1: `57b023492c2381bd4c4bb237f3aa43bb19d97384`
- Locally computed SHA-256: `ba6fa6704082a7b39289b56cd0ac4a423b7ad74dd929cf11f5ce588274402a75`
- Source: https://cef-builds.spotifycdn.com/index.json

Only headers were extracted from the checksum-verified archive during this cycle.
The archive and headers are outside the repository at `/tmp/aux-cef-sdk-152` and may
be removed by the OS. No framework was installed and no .app was assembled.

Validation performed:

```sh
clang++ -std=c++20 -fsyntax-only \
  -I /tmp/aux-cef-sdk-152/cef_binary_152.0.7+g83ffcba+chromium-152.0.7977.83_macosarm64_minimal \
  experiments/cef-shell/layout-probe.cc
```

## Next acceptance gate

Running the macOS candidate requires a development-test .app. The user previously
deferred bundles; approval was requested for this isolated test only. Until answered,
do not assemble/run it. No signing, installation, distribution, account access,
credential-store discovery or profile migration is authorized by that request.

Once authorized, the runnable experiment must establish all of the following before
choosing this shell or moving user data:

1. Actual Aux shell/native bridge integration, real tab creation/selection/close,
   full sidebar collapse and correct window geometry at reference sizes. The CEF
   one-Chrome-BrowserView limit must not force stock Chrome chrome or Alloy content.
2. Existing runtime control of the same regular profile used by the human, without
   allowing webpage content into trusted shell RPCs.
3. Synthetic extension installation and representative APIs, plus a per-request
   screen chooser with legacy capture attempts unable to bypass source consent.
4. Private-window separation from regular debugging/persistence and coordinated
   unsaved-work handling. Do not assume Chromium defaults satisfy Aux's agent boundary.
5. Saved-data migration and recovery design only after feasibility is established.
   Real 1Password/platform passkey/signing qualification remains a later explicit gate.

If the candidate fails the tab/layout requirement, stop this path rather than
replacing the user's design or weakening browser compatibility to fit it.

References: CEF `include/internal/cef_types_runtime.h`,
`include/views/cef_browser_view_delegate.h`, and upstream cefclient Views example.
