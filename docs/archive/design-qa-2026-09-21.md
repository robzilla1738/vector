# Chat simplification — 2026-09-21

final result: blocked

The requested task-promotion interruption is fixed and browser-verified. On a
loaded page the toolbar leaves the layout and returns from the top edge. Full
Aside visual acceptance is not claimed: matching native conversation captures
are still missing.

## Evidence and scope

- Source visual: user-provided Aside new-chat screenshot, originally at
  `/var/folders/1j/bkszg0h10ng2tfhcbdk94cpm0000gp/T/TemporaryItems/NSIRD_screencaptureui_uK9API/Screenshot 2026-09-21 at 10.57.41 AM.png`.
- Implementation: `/tmp/aux-parity-final-erniip/08-chat-simplified.png`.
- Implementation viewport and capture: 1357 × 987 CSS/image pixels; dark theme,
  synthetic populated conversation. Source displayed at 1757 × 1051 pixels,
  empty native chat. Different content, viewport and native material mean these
  are not a normalized side-by-side comparison. Full-view and focused fidelity
  acceptance remain blocked on matching evidence.

## Findings and iteration

- Fixed: task creation previously opened a large form above every completed
  conversation's composer. It now requires Options → Save as task. Opening and
  cancelling were verified without creating a task.
- Fixed: conversation work history now starts collapsed even for running turns.
  Tests confirm it remains expandable and Pause/Stop remain usable.
- Fixed: promoting a chat no longer consumes or clears an unsent reply.
- On a loaded page the toolbar leaves the layout. Focus and a pointer at the
  top of the page reveal the URL and both icon groups together. A later live
  window confirmed the conversation preview, a tab menu that leaves the page
  painted, and a web-tab drop onto Bookmarks. Aside pixel parity is still
  open.
- No browser console errors returned in the inspected preview.

## Fidelity surfaces

- Typography: existing Geist and text tokens preserved; no new fonts.
- Spacing/layout: default task card removed so the conversation regains space;
  native matching-dimension comparison remains pending.
- Colors/tokens: unchanged; desktop translucency not assessed in web preview.
- Assets: Central Icons retained; arch SVG and full-canvas silver native icon added.
  The native master uses a deterministic geometric mask of the supplied artwork;
  rejected generated cutouts are not shipped. All 16–1024px macOS sizes regenerated.
- Copy: optional form now says “Save as task”; normal chat has no task upsell.

## Verification

- Desktop typecheck and build passed.
- Latest full unit suite: 161 files / 782 tests passed, including chat drafts,
  run controls, task promotion, native-material and chrome regressions.
- Workspace typecheck passed.
- Native unsigned previews were rebuilt and opened after chat and branding edits;
  the packaged ICNS was checked against the repository icon. Final Dock appearance
  after the full-canvas correction still requires user acceptance.

## Remaining acceptance checklist

- Compare populated Aside and Aux native chats at matching dimensions.
- Verify native pointer-only toolbar reveal, including the draggable title area.
- Continue the broader matrix tracked in `docs/ASIDE-PARITY.md`.
