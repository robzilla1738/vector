# Aux status — October 7, 2026

## Current local checkpoint

Work is on local `main`. The current implementation, including the formerly uncommitted runtime, model/MCP, composer and native-binding work, is consolidated locally. Nothing has been pushed; no hosted CI, signing, notarization or release has run. The product remains under development; this is not a phase-completion claim.

Read [ROADMAP](ROADMAP.md) for owner decisions and remaining acceptance, [ARCHITECTURE](ARCHITECTURE.md) for system boundaries, and [native build instructions](../chromium/BUILDING.md) before starting another builder. Earlier chronological notes are [archived](archive/status-before-sidebar-polish-2026-10-07.md).

## Current UI behavior

- Vertical layout remains the default. The address/search field lives in the left sidebar; horizontal layout retains its toolbar field. Focusing the field reveals suggestions immediately. Search source filters live behind All sources.
- Pinned tabs use an icon tray at the top, with drag-to-pin. Bookmarks are separate, support folders, and can be added from the tab context menu. The Last used tab-sort control is removed.
- Left and agent sidebars share the glass treatment with clean internal seams. Only the left sidebar reveals on edge hover when collapsed. It retains an exit grace period and stays open for its menus/focus; floating surfaces and tab previews no longer require clearing the whole page background.
- Blank browser chrome supports native window dragging while interactive controls retain their own input behavior.
- Home Ask and full chat use compact composers. Context, model/run options and secondary actions are in anchored dark menus. Shared popover glass layers that produced white menus have been removed. Menu rows, mention groups, focus treatment and circular 32px composer controls have been refined; microphone icons retain 16px dimensions.
- Ask first is the default. Skip confirmation maps to Full auto and is remembered for future chats; existing saved choices are preserved. Auto remains available in Settings.

## Implementation checkpoint

The preserved integration also includes saved local/cloud run options, model funding and account tests, MCP OAuth registration UI/services, GitHub through MCP, scoped context/observation handling, runtime shutdown/ownership refinements, generated native method bindings, and native benchmark source/harness cleanup. These are source changes, not claims of live provider or benchmark acceptance. Native area patches are recorded through 0078 in `chromium/patches/series`; the benchmark-only stock patch is separate from that product series.

## Native build and preview

- Chromium: **154.0.8037.98**; product checkout: `~/aux-chromium-product/chromium/src`.
- Current app: `out/AuxFast/Aux.app` in that checkout. The final UI build completed **29 steps in 17m10.88s**, then staged the runtime and launched successfully.
- Runtime packaging: **11.81 MiB JavaScript**, **18.38 MiB payload**, plus **33,105,536 bytes full ICU**. Size targets remain advisory.
- Evidence: `/tmp/aux-final-polish-build.log`. Temporary logs/screenshots are local diagnostics, not durable acceptance artifacts.
- The disposable native preview was left open. Its launcher owns the normal Product dev lock until Aux quits and then removes only its temporary Profile. Check live process/lock ownership before building; never force-clear an active lock. No owner Profile was used.
- Native inspection confirmed the dark context/model menus, compact Ask composer, readable microphone and one-line context action. Preview checks also covered mentions and secondary chat actions. Pixel-exact Aside parity, every hover/material condition, and complete native feature acceptance remain unverified.

## Validation and next work

Fresh handoff `npm run check`: **typecheck passed, lint completed without errors, 4,160 tests passed and 4 failed across 678 files** (675 files passed). Runtime dist was rebuilt by the typecheck stage before tests. These are the same four failures observed before this handoff; this is not a fully green checkpoint:

| File | Remaining failure |
| --- | --- |
| `tests/unit/mock-bridge-coverage.test.ts` | Expected missing-method inventory differs from the current runtime/renderer registry. |
| `tests/unit/onboarding.test.ts` | Reviewed retry reads an undefined run ID. |
| `tests/unit/onboarding.test.ts` | Staged-recovery fixture reaches a different admission error than expected. |
| `tests/unit/scoped-eval.test.ts` | Scoped human handoff is denied by current authorization. |

The next development session should resolve or explicitly account for these failures before claiming a green integrated check. Raw output is in `/tmp/aux-main-handoff-check.log`. Focused UI checks and the final native build passed during the UI pass. The generated [agent API reference](AGENT-API.md) has been refreshed from the current contracts.

The owner previously deferred broad acceptance to the next roadmap round. Still pending: detailed Aside comparison across window sizes and both appearances, manual 20-task/default-provider smoke, offline models and provider/OAuth acceptance, native import/extension/filter walkthroughs, and paired native performance measurements. Preserve Stop, Take over, durable effects/undo, site policy and secret protections while continuing development. Browser controls must remain usable when the runtime is unavailable.
