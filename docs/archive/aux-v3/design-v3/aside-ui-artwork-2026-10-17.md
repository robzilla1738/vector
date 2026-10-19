# Aside UI adoption: illustrations, selected sources and utilities

This source slice was prepared in the isolated `aux-ui-parity` worktree from
`07199225f`. It does not include native browser changes or establish native parity.
The reference remains extension 1.26.1004.147 plus the owner's newer captures.

## Exact role and artwork evidence

The 3424×1978 reference PNGs correspond to 1712×989 logical windows. Captures
091, 097, 103 and 105 show a 636px card containing a right-side illustration
288×160px, with 4px surrounding padding and 168px outer height. The existing Aux
feature layout already supplied the 288px column and 168px minimum, but its four
CSS drawings individually required 164px before padding. Those drawings and their
unused preview tokens are removed. A single `.setting-illustration` role owns
288×160px, cover crop, the shared radius and intrinsic image dimensions. Below
560px content width the existing grid stacks the artwork after text and controls;
it retains its size while the card grows to fit readable text.

Original inert asset references, all in `assets/` under the extracted extension:

| Capture        | Product chunk            | Original raster                  | Intrinsic raster |
| -------------- | ------------------------ | -------------------------------- | ---------------- |
| 091 Channels   | `channels-DacHN2Rk.js`   | `cover-BBxO7594.webp`            | 1500×855         |
| 097 Developers | `developers-DKtKKZrJ.js` | `aside-cli-3UABIqGq.webp`        | 1000×572         |
| 103 Quick Ask  | `mini-popup-DLprmZ6Y.js` | `aside-mini-popup-DpI8c-u_.webp` | 1000×572         |
| 105 Selection  | `lasso-D8rvcE_H.js`      | `aside-lasso-BhzH82rC.webp`      | 1000×572         |

The Aux versions in `apps/shell/public/settings/` preserve the reference
composition: cyan sky/message card; pink cropped terminal; orange background and
brown translucent composer; cyan cat selection and overlapping popup. Bitmap
branding edits used `image_gen`, then standard WebP packaging at 576px width,
quality88. The four lazy, asynchronously decoded assets total about45KB; they do
not add eager Home downloads. Complete generated originals remain outside Git in
`~/.codex/generated_images/01a14cb4-2a25-70e3-be00-9caeca0d0fd8`.

Intentional Aux differences: Aux arch/name replaces Aside/Claude branding, CLI
shows the implemented `aux open example.com` command, the messenger illustration
asks for a source summary, and the selection illustration says Ask Aux about
this. No billing tier, customer usage, credentials or working connection is
invented. The illustrations are decorative (`alt=""`); operative copy and controls
remain real DOM content with existing state/authority. The image content remains
fixed artwork in both themes, matching the reference's treatment.

## Selected browser sources

`BrowserContextTray` now shares the approved context-card anatomy with the
already aligned `AttachmentTray` and Home context summary: 180×44px, 6px padding,
8px gaps, 32px icon tile, ellipsis and two text lines. A selected browser source
remains distinct from a live observation: changed and closed selections show
explicit Page changed / Tab closed text and retain their original `PageContextRef`.
The existing registered Refresh/Remove commands, async current-source validation,
disabled retirement and keyboard button semantics are unchanged. No new source
permission or implicit refresh was added. Captures014 and155–157 plus the extracted
composer card roles ground this presentation; they do not prove an independently
captured stale-source state, so the added stale/closed treatment is an Aux behavior.

Dark and light use existing surface/ink roles. Stale-source titles and actions
remain readable foreground text; a quiet warning tile and explicit status replace
the old all-yellow text, which was difficult to read in light appearance.

## Verified utility glyphs

The canonical24px viewbox and16px slots remain. No second icon library was added.

| Aux glyph       | Verified extracted source                                                                   |
| --------------- | ------------------------------------------------------------------------------------------- |
| AppWindow       | `browser-tabs-aU3LdbR6.js`                                                                  |
| CornerDownLeft  | `arrow-corner-down-left-D9tBz26z.js`                                                        |
| Download        | `arrow-inbox-BtbMt_--.js`                                                                   |
| ExternalLink    | `square-arrow-top-right-2-Dg5Q9JFY.js`                                                      |
| Square          | `stop-Dee2RmUL.js`                                                                          |
| TriangleAlert   | local `U` component in `error-tracking-ClwgGV82.js`                                         |
| Copy            | local `T`, exported `p`, in `error-tracking-ClwgGV82.js`                                    |
| Left navigation | 180° counterparts of adopted `arrow-right-xX9MhCG9.js` / `chevron-right-medium-C2yQbmLx.js` |

Copy previously used the success checkmark from `copy-button-BDJ5JmX2.js`. That
component actually imports its idle copy glyph from export`p`; the corrected
shape shows overlapping documents. A regression distinguishes Copy from success.
The reference Bookmark itself is always filled, so existing normal/filled aliases
remain. Unverified Mic/Pin/Pause/VolumeX/other shapes were not guessed. Horizontal
tab34/strip41/max233, shared tab state, caption regions and native glass are untouched.

## Source and rendered verification

- Offline `pnpm install --ignore-scripts --frozen-lockfile`:576 packages reused,
  isolated dependencies, no main dependency/dist symlinks.
- Own contracts/driver declarations generated for shell type resolution; shell
  typecheck passes. No runtime implementation changed.
  -55 affected tests pass across9 files: utility accessibility/Copy; browser-source
  current/stale/disabled/pending/command/recovery/narrow controls; Quick Ask save,
  Channels and selection/capture behavior. No CSS-number mirror tests added.
- Targeted lint has only existing surrounding warnings; diff whitespace passes.
- Local mock renderer in a disposable headless installed Chrome, no owner Profile,
  CUA or native launcher: both themes at1712,700 and400px logical viewport widths.
  Four heroes×six states load successfully, no horizontal card overflow or browser
  exceptions. Wide/700 layouts retain288×160 artwork and168px cards. At400px,
  stacked cards measure274px Channels,322px CLI/Quick Ask and333px Selection,
  with288×160 artwork; growth preserves text and controls. Source current/changed/
  closed cards retain180×44/32px icon geometry and fit at400px; Refresh/Remove
  accept keyboard focus. Disabled/async retirement covered by the tests.

Evidence: `/tmp/aux-ui-parity-{typecheck2,tests,lint,matrix,matrix-400}.log` and
`/tmp/aux-ui-parity-captures/geometry{,-400}.json`, with matching dark/light PNGs.
Representative frames were manually inspected beside reference captures. The mock
Channels listing reports its unimplemented mock method; it does not establish a
live messenger result. Current native comparison, actual Quick Ask, full captured
state coverage, system accessibility modes and performance acceptance remain open.
