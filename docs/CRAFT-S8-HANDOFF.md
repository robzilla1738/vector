# CRAFT: keyboard, overlay and selector batch

## Status and dependency

September 28, 2026. This is a **source-verified S8 batch**, based on the isolated
`codex/aux-egress` worktree at `89cf44cd`. It builds on the existing shared native
Dialog/Menu APIs and the earlier whole-array selector migration. It does not
qualify S8, ACCESS or S14. No native build or native live journey ran in this lane.

The end-to-end outcome is consistent keyboard access to choices and confirmation
dialogs, with focus returning to the right opener, and stable Home/Overview focus
while unrelated state changes. The same batch closes primitive motion, contrast
and CSS-budget defects needed to make those controls readable and predictable.

## Contract and behavior

| Area | Delivered behavior |
| --- | --- |
| Dialog, Menu and Popover | One native-dialog lifecycle acquires/releases the floating-sidebar lock, reports stage obstruction, opens in the native top layer, accepts explicit initial/return focus refs, and avoids restoring focus behind another active dialog. Nested Escape/cancel closes its own layer. No new native host methods or generated bindings. |
| Confirmation | Native `alertdialog` semantics and a linked description; Cancel gets explicit initial focus. Menu-to-confirmation and Profile confirmation return focus to their live trigger. |
| Menu/list focus | Entry, arrows and typeahead skip disabled, aria-disabled, hidden, inert and CSS-hidden controls. A preferred focus ref must belong to that menu. Native autofocus on an aria-disabled control is corrected. Tab traversal stays within its parent dialog. |
| Tabs | Disabled selection still leaves one enabled Tab stop. Arrow movement uses the actual focused tab, honors vertical orientation and horizontal RTL, and does not consume modified keys or unrelated arrows. |
| Tooltip | A tooltip is portaled within its active dialog, remains hoverable while crossing the trigger gap, stays within viewport bounds, and dismisses on Escape without moving focus. The next Escape can close the dialog. Pointer-only tooltips also dismiss when keyboard focus is elsewhere. |
| Toast | Hover and focus pause expiration independently. Leaving the pointer does not restart the timer while a control still has focus. Errors still require dismissal. |
| ScrollArea | Only overflowing edges fade, scrolling regions become keyboard stops, and focus removes the mask so text and outlines stay visible. Resize observation includes direct children. |
| Home and Overview | Each memoized Home conversation card selects only its own draft; unrelated draft updates do not rerender other cards or move focus. Overview navigates an explicit page-to-button ref registry in visible order. |
| Motion and contrast | Reduced-motion rules also clear animation and transition delays. Forced-colors styles cover switch states, selected radio cards, tooltips, popovers and toasts. Shared warning status uses `--wait`. |
| CSS budget | Work/observation rules are in the components layer. The unused project-diagnostics block has no non-CSS source consumers and was removed from startup CSS. The contrast script now accepts the current neutral hex tokens and checks regular, strong and floating glass. |

Ownership is limited to `apps/shell/src/ui/**`, `keyboard-list.ts`, the listed
Home/Overview consumers, token/style files, and `scripts/check-glass-contrast.mjs`.
Goal and EGRESS sign-in UI, App/Settings routing, contracts, generated bindings and
the native source are untouched.

## Verification

The [source evidence](evidence/craft-primitives-2026-09-28.json) records file hashes,
commands, counts, exact bundle bytes and the Vite manifest digest.

- Shell TypeScript passed: `npx tsc -p apps/shell/tsconfig.json`.
- Focused Vitest suite: **10 files, 25 tests passed**. This includes actual nested
  primitive paths and the existing Profile menu/confirmation consumer, plus Home
  card subscription isolation and Overview reorder/removal focus.
- `npm run lint`: passed with **366 warnings and zero errors**, within the current
  390-warning repository limit. This is not a zero-warning claim.
- `npm run format:check` and `git diff --check`: passed. Only specifically changed
  ratchet/new files were formatted; no broad shell formatting was performed.
- Chromium-targeted **shell** Vite build passed. Startup JS: **465,709 bytes**;
  startup CSS: **182,627 bytes / 178.35 KiB**, below the exact 184,320-byte ceiling;
  total JS: **1,581 KiB rounded**. No native compile ran.
- The first shell build exposed the budget checker's rounding: 184,482 CSS bytes
  printed as a 180 KB pass. Removing the unused rules justified one focused shell
  rebuild. The final measurement uses exact bytes; the configured limit was not
  raised. The integrator should compare exact bytes on its combined build too.
- `npm run contrast:check`: all twelve modeled black/white underlay checks passed.
  Worst cases: dark floating glass **5.34:1**, light floating glass **5.94:1**.
  The unit test also samples all 256 neutral underlays for regular/strong glass in
  both themes. These are token composition checks, not native glass screenshots or
  an owner visual approval.

## Remaining CRAFT / ACCESS gates

1. **Native focused journey on the integrated build.** Open real menu/popover
   consumers, move with keyboard, open a nested confirmation, cancel each layer,
   and verify focus return and no underlying Escape action. Check horizontal
   titlebar placement, tooltip placement inside native dialogs, dynamic menu
   content and narrow-window bounds. Retain the earlier scoped Space/Browser tools
   native pass; it does not prove this new lifecycle batch.
2. **Owner visual/accessibility matrix.** Review five core surfaces in both layouts
   and both themes, including native glass under Reduce Transparency. Verify
   reduced motion, increased contrast/forced colors, keyboard-only use and native
   accessibility/VoiceOver. CSS and JSDOM evidence do not close these gates.
3. **Complete deliberate formatting migration.** The current ratchet names 63 of
   517 shell `.ts`/`.tsx`/`.css` files. Passing the ratchet does not satisfy the
   roadmap's every-shell-file requirement. Migrate files in reserved surface
   batches and coordinate the shared formatter configuration with the integrator.
4. **Finish the focus/ref inventory.** Direct whole-array selectors for the audited
   pages/runs/routines/tasks/chats/messages fields remain zero. Overview and Home
   are improved here; consumers still requiring review include TabMenu destination
   focus, Palette list navigation/trap, Library and DeferredSurface traps,
   Appearance radio navigation and the Conversation context-trigger query. Content
   searches in Reader/Markdown/Find are not automatically focus defects. Shared
   menu traversal intentionally enumerates dynamic descendants.
5. **Finish consolidation and CSS inventory honestly.** Non-test `role="menu"`
   appears only in the shared Menu. The former second menu-dismiss hook and
   SettingsDisclosure are absent. `useDismissable` remains for CitationChip and
   SupportingContent; confirm whether those should move to shared Popover. There
   are no `.sheet`/`.drawer` root variants found, but legacy `.drawer-*` and
   `.sheet-acts` utility names remain. No `refinements` layer, removed unused token
   names or stray raw 16/18px blur matched. Remaining `!important` uses are reduced
   motion safeguards. Broad lazy-CSS/cascade and attention-color review still
   needs the final surface matrix; source presence alone is insufficient.

## Integration and next focused journey

Cherry-pick the commit containing this document. Preserve other lanes' consumer
changes when resolving imports. One serialized native build can include this
source batch with the next coherent native dependency. Run only the touched
journeys above and the combined exact bundle gate; do not repeat unrelated task
benchmarks for a shell primitive change. Record the source/binary/artifact tuple
before promoting any qualification flag.
