# Supplied popup WebContents transparency

Proposal only: no shared writes, native build/launch/signing, profile read or OS action. Incremental after `native-mini-popup-position-focus`: C++ input`a3fe2c2a8b4deff2193a65e2b2f70e742d7ebacc33156568afc5079bdc04b4da`; local BUILD input`2a230caf8cdce1eb71c06f7ff18b0776d3f323e1c28aa45c78fc47c62414e36b`. The only new GN dependency is `//skia` for the actual transparent color constant. No macOS material, profile-switch, root wiring or supplied UI file changes.

The original native helper04598fcc, called for both main and option WebContents creation, installs a persistent transparent background-color observer, sets an optional transparent renderer page-base color, and clears an existing render view's default background. Clearing only the NSWindow (current Aux behavior) does not establish any of those web-surface colors and can leave the supplied translucent UI over an opaque web rectangle.

The patch uses Chromium155's existing `views::WebContentsSetBackgroundColor`, whose WebContents-owned observer reapplies color to outermost main frames on `RenderFrameCreated`. Its stored color also feeds NativeViewHost clipping when the WebContents attaches. Both main and original child WebContents receive the helper **before attachment**; no replacement document or custom observer class is introduced. The renderer page-base color persists and is sent when its view is created, and an already-present render view receives the actual public `SetBackgroundColor(SK_ColorTRANSPARENT)` call.

Original02a62d00 also updates a previously installed color record. Current155's helper is create-only, so this adapter removes/recreates only an existing **nontransparent record of that same helper type**, using its public userdata key. It preserves all other WebContents data. Repeated setup with an already-transparent record is idempotent. This is a narrow upstream-version adaptation rather than a new background policy.

## Source proof and limitations

`source-evidence.json` pins original retained main/child/helper decompiles, original arm64 framework identity, four fresh bounded REA dossiers and actual155 public/helper implementation files.04598fcc's explicit optional-color write and page broadcast agree with155's `SetPageBaseBackgroundColor`.032a83c0's alpha0/255 validation, optional-default comparison, platform update and renderer opacity change agree with `RenderWidgetHostViewBase::SetBackgroundColor`. The persistent observer type correspondence is inferred from its userdata/allocation/color behavior and existing upstream implementation; stripped original symbols are not claimed recovered.02a62d00's raw decompiler has truncated tail/branch warnings, recorded with the evidence.

Original helper's final optional-color virtual call remains unidentified; no independent replacement is guessed. Existing NSWindow material is untouched: the `DesktopMediaPickerVisualEffect` literal alone does not prove a particular AppKit material enum, so the current HUD choice is still an unresolved fidelity gap. Animation, offscreen reopen and lock routing remain separate. This patch does not claim complete popup parity or actual transparency acceptance.

## Lean checks and integration

Run `python3 docs/integration/proposed/native-mini-popup-transparency/verify.py`. It checks actual supplied/upstream source pins, both baseline/output hashes, temporary patch validation/replay, and the persistent observer/page/current-view setup before main/child attachment. Changed C++ was clang-formatted. No native API executes in these checks.

Root should compose after position/focus, generate GN and compile the mini-popup object under its build lock. Actual disposable observation must verify initial loading and subsequent frame creation in both themes, the live model option menu over the main popup, and absence of opaque clipped rectangles/white flashes. The supplied CSS remains responsible for its own panel fills. These runtime and visual results remain unverified.
