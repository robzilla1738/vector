# Aux browser-layer candidate

Status: development launcher and layout candidate; **not an Aux replacement**.
The existing Electron app and user profile remain untouched.

## Concrete experiment

`layout-probe.cc` creates a Chrome-style Views window with one Chrome-style content
BrowserView and one Alloy-style trusted UI BrowserView. This arrangement is allowed
by the pinned CEF API. It keeps website content on the Chrome browser layer while
leaving a web-rendered sidebar possible. A content view that reports Alloy causes
construction to fail; substituting Alloy for website content would invalidate the
compatibility experiment.

The layout source compiles against the SDK below. The development launcher uses isolated
request contexts and sandboxed helper processes. It does not include a product launcher,
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

The checksum-verified SDK was extracted outside the repository at
`/tmp/aux-cef-sdk-152`. Development app output and synthetic profiles are also under
`/tmp`; the OS may remove them. Nothing was installed into Applications.

Validation performed:

```sh
clang++ -std=c++20 -fsyntax-only \
  -I /tmp/aux-cef-sdk-152/cef_binary_152.0.7+g83ffcba+chromium-152.0.7977.83_macosarm64_minimal \
  experiments/cef-shell/layout-probe.cc
```

## Development build

The active implementation cycle permits isolated development builds. This is not a
release, signing, installation, distribution, or user-profile migration workflow.
`build.py` requires the pinned SDK and a fresh output directory. Verify the archive's
SHA-256 above before extracting it. Build output and profiles stay outside the repo.

```sh
python3 experiments/cef-shell/build.py --sdk /absolute/path/to/pinned-sdk --output /tmp/aux-host-dev
"/tmp/aux-host-dev/Aux Host Candidate.app/Contents/MacOS/Aux Host Candidate" --profile=/tmp/aux-host-profile
```

The left-hand surface is explicitly diagnostic and has no mock product controls.
The runtime bridge is not connected. Product integration must establish:

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

## Current implementation evidence — 2026-09-20

The macOS launcher and sandboxed helper compile against the pinned SDK. Context
initialization must complete before browser-view construction. The Chrome view must
be attached before the Alloy shell, then the shell can be reordered to the left.
Both browser creation callbacks report their expected runtime styles with separate
persistent contexts. The native window opens at the requested geometry.

**Updated rendering evidence:** after fixing context initialization and attachment order,
local Chrome content and the isolated Alloy shell both render with sandboxing enabled.
`--content-only` isolates the Chrome view for diagnosis. Load callbacks now report
failures and completion; accessibility is enabled in the candidate.

**Candidate acceptance failed:** the wired Cmd+T Chrome command opens a separate stock
Chromium window with its own tab strip and address bar. It does not add a controllable
tab inside Aux's existing content surface. Do not integrate this candidate as the product
host or replace Aux's layout with stock browser chrome. An embeddable Chrome tab
lifecycle and stable startup still need a supported implementation. Browser-info timeout
messages also remain. The diagnostic process was stopped after inspection.

Reference lifecycle: [CEF macOS browser entry point](https://github.com/chromiumembedded/cef/blob/master/tests/cefsimple/cefsimple_mac.mm)
and [sandboxed helper entry point](https://github.com/chromiumembedded/cef/blob/master/tests/cefsimple/process_helper_mac.cc).
