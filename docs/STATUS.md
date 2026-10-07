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

The preserved integration also includes saved local/cloud run options, model funding and account tests, MCP OAuth registration UI/services, GitHub through MCP, scoped context/observation handling, runtime shutdown/ownership refinements, generated native method bindings, and native benchmark source/harness cleanup. These are source changes, not claims of live provider or benchmark acceptance.

The current coding slice adds trusted per-run modes and explicit run/site/global scopes, concrete browser/file/command review, per-action restart-safe journal settlement, governed search and versioned file batches, conflict-safe undo, supervised processes, QuickJS coding calls, declarative profiles and isolated coder worktrees. Aux Packages supply pinned skills and declarations to Aux's own loop. Commands retain honest outcome/log receipts; file undo does not promise to reverse arbitrary command effects. Partial worktree creation remains inspectable and explicitly archivable.

Native area patches are recorded through 0079 in `chromium/patches/series`; 0079 replaces the foreign-agent terminal launcher with an ordinary user shell. The benchmark-only stock patch remains separate from the product series.

## Implementation quality follow-up

The plan audit found and corrected concrete integration gaps:

- Exact browser actions now revalidate and hold the reviewed element after asynchronous preparation, including form destination state. Interrupted runs cannot accept late wider permission grants.
- Ordinary durable tool suspensions survive crash recovery and graceful shutdown. Shutdown retires executable approvals, preserves the original parked call, and refreshes action review after a trusted continuation rechecks native source authority. Normal Stop still cancels. Startup recovery includes archived and older active runs beyond the previous 200-row history window.
- Isolated coders do not implicitly inherit browser tabs. Original groups and receipt-bound worktree recovery survive interruption. Integration persists exact batches of at most 100 changes and can complete a reconciled partial batch while preserving confirmed files and detecting later parent edits. Batched version reads avoid one worker process per file.
- Process launch waits until birth/group identity is durably recorded. Cleanup survives shell `exec` changing command text; stopped command diagnostics include command, workdir, state and signal.
- QuickJS stops at uncertain mutations without caching success. Bounded `coding_state` / `fs.state` references retain older unresolved outcomes beyond recent context. Metadata-only summaries avoid loading complete before-images on every continuation; diff and reconciliation use read admission.
- Narrow searches inherit permitted project ignores. File replacement detects edits during temporary-file preparation and cleans failed temporary writes. Settled not-applied receipts remain honest and do not redispatch. The activity panel refreshes final results even when an older request remains in flight.

Dedicated budget and cloud-resource handoffs still require their original continuation machinery and become interrupted after restart; this ordinary parked-call recovery does not claim to reconstruct them. Comparative browser performance, live-provider completion and visual parity remain separate acceptance work. The packaged AuxFast app below reflects the preceding native checkpoint; these follow-up runtime/renderer fixes have not been restaged into it.

## Native build and preview

- Chromium: **154.0.8037.98**; product checkout: `~/aux-chromium-product/chromium/src`.
- Current app: `out/AuxFast/Aux.app` in that checkout. The coding native build completed **32 steps in 13m53.86s**, then staged the final runtime and launched with an explicit disposable Profile.
- Runtime packaging: **11.93 MiB JavaScript**, **18.50 MiB payload**, plus **33,105,536 bytes full ICU**. Size targets remain advisory.
- Evidence: `/tmp/aux-coding-native-preview.log`. Temporary logs/screenshots are local diagnostics, not durable acceptance artifacts.
- Native inspection verified the shipped aux-core package in Settings and a normal project shell executing a command. Stop returned the terminal to its stopped state. Final renderer restaging after the lazy-diff and project-row layout changes completed **25 steps in 13m00.46s**, staged the runtime, and reached ready on startup. Evidence: `/tmp/aux-coding-final-native.log`. Both owned previews retired normally through their launchers; their temporary Profiles were removed and the normal lock released.
- Earlier inspection covered dark context/model menus, compact Ask composer, mentions and secondary chat actions. Pixel-exact Aside parity, every hover/material condition, and complete native/provider acceptance remain unverified. The preview tool initially resolved AuxDev rather than the intended AuxFast window; subsequent inspection bound the exact AuxFast app after verifying its disposable Profile argument.

## Validation and next work

Runtime dist was rebuilt before the quality-audit tests. Typecheck and lint passed (existing advisory warnings remain). One full unit/renderer suite ran **4,207 tests across 686 files: 4,205 passed and two fixture failures**. Both were corrected: the REPL fixture now uses a process ID without a denied source word, and the live-answer fixture registers its real coordinator control. The two affected files then passed **52/52 tests**. No production source changed after the full run, and the broad suite was not repeated. The new final-refresh renderer regression also passed independently.

The full run passed the new graceful restart/native-authority, historical active-run recovery, reviewed-target drift, late-approval, partial/large worktree integration, process exec/cleanup, file preparation conflict, and inherited-ignore checks. Local logs are `/tmp/aux-coding-quality-check.log` (typecheck/check), `/tmp/aux-coding-quality-lint.log`, `/tmp/aux-coding-quality-tests.log`, and `/tmp/aux-coding-quality-targeted.log`. The original source/native implementation checkpoint is `81068a0d1`; this follow-up is committed separately. Neither checkpoint establishes a successful live-provider coding task or competitor parity.

The owner previously deferred broad acceptance to the next roadmap round. Still pending: detailed Aside comparison across window sizes and both appearances, manual 20-task/default-provider smoke, offline models and provider/OAuth acceptance, native import/extension/filter walkthroughs, and paired native performance measurements. Preserve Stop, Take over, durable effects/undo, site policy and secret protections while continuing development. Browser controls must remain usable when the runtime is unavailable.
