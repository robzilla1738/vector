# Quick Ask context ownership and compact layout

## Current implementation supersedes the initial picker proposal

Commit `8772143f7` keeps native file/image intake and the compact owned-dialog
layout described below. Browser sources from another window require admission
that the native Quick Ask caller does not currently have. Quick Ask therefore
offers **Open in Aux** for browser tabs and capture; it does not expose the
initial browser-source picker. The normal-window run-start ownership guard stays
in place. Drafts and selected source references survive handback for review, and
new browser choices are rejected before start, queue, steer or answer
acknowledgement. Text followups may retain an existing run's original authority.

The initial source proposal and synthetic renderer states below are historical
evidence, not proof of native cross-window admission. Current behavior and
remaining native acceptance are recorded in [STATUS](../STATUS.md). A future
snapshot or live-source path needs a genuine native producer and original-owner
retirement; a chat ID or same-Profile relationship cannot supply that authority.

## Observed failure and source cause

The current packaged `10d3` preview was observed at 440×92 with an empty draft and 440×200 with a long draft. Clicking Add context, or focusing it and pressing Return, produced only the focus ring: no native dialog or accessibility-tree change. This is native evidence from the owner-controlled preview; the corrected source below still requires a subsequent native observation.

The real Conversation context control invokes `toggle-conversation-context` through scoped command admission. Its previous registry row admitted normal/private windows only. `executeCommand` rejected `quick-ask` before the opener activated. Merely allowing that command would expose a second problem: the existing native layout hook measured only the composer subtree, while its native dialog is portaled outside that subtree. The original 92px viewport consequently constrained the picker.

## Source change

- Admit the actual Quick Ask context opener and four browser-source actions: select context, toggle/remove an additional source, and refresh a selected source. Existing focused-control, original composer/chat/window/Space, disabled and source-identity checks remain authoritative. Queue, model, account and unrelated conversation commands retain their existing scope.
- Admit native image/document intake and their existing review/removal controls. These use the original native file-selection and page-capture producers, not browser upload substitutes. The pinned native `window_methods.cc` image/document picker handlers have no normal-window-only gate. `WebUIBrowserUI::IsAuthorizedAuxDocument`, selection leases and original document-read/import admission bind the actual Aux document/window/Profile. Images retain their original page/epoch and operation-owner checks; documents retain selection/snapshot/hash and sequential partial-success handling.
- Quick Ask has no visible native page stage for lasso selection. Select area remains disabled there, its title explains why, and the same menu offers **Open Quick Ask in Aux** through the existing expansion handback. Page capture requires an eligible selected browser source; unavailable sources remain visibly disabled with their existing explanation.
- Follow only real expanded controls from this composer through their `aria-controls` IDs to live, open dialogs registered in the existing owned-dialog set. Follow nested controls from those dialogs recursively. Unrelated global dialogs cannot enlarge Quick Ask. Observe and retire those specific dialog nodes through the existing stage-report lifecycle.
- Request transient draft space up to the existing 360px native limit while an owned picker is open. Closing it recomputes the original draft/context geometry; an empty draft returns to 92px. Conversation expansion keeps the existing separate native layout. Layout writes serialize and coalesce against the latest desired bounds, rechecking the original window/kind/private-mode owner immediately before dispatch and after asynchronous completion. A retired owner cannot publish queued bounds or revive after an observed identity change.
- Preserve popup scrolling. The anchored Popover previously captured its own internal scroll as a reason to reposition; remeasurement temporarily cleared its max-height and reset scrollTop. Ignore scrolling originating within that popup while continuing to reposition for external scroll. This permits the final menu row to scroll fully into view inside the 360px window.

No native method or producer, execution stack, runtime source, production fixture or visual material layer was added.

## Verification

54 focused tests across ten files pass. Coverage includes the actual QuickAsk component/window kind, trigger → nested picker → real source selection/removal, Escape/focus/draft continuity, unrelated-command rejection, disabled lasso and explicit handback, image pick/review/attach ACK/preview in both normal and Quick Ask windows, native document selection/snapshot/hash import with partial failure, source/window retirement, unrelated global dialogs, asynchronous layout coalescing/retirement, and popup scroll ownership. The shell TypeScript check passes. Tests use synthetic data and native bridge fixtures; they do not establish native file-dialog or packaged-host acceptance.

Sixteen actual-component renderer states were observed at 440px width, both dark and light: empty 92px, Add context and nested browser picker 360px, selected browser-source card 136px, source removal and dismissal 92px, keyboard access to the final option, and long draft bounded at 360px. Both themes retain Escape focus return. Native-shaped image intake/review/cancel was also observed in both themes with a saved renderer fixture. The compositor fixtures explicitly substitute native-host admission and apply recorded layout requests to their viewport; they are renderer evidence, not native measurements. No page exceptions, console errors or horizontal overflow appeared. Artifacts: `/tmp/aux-quick-context-renderer/geometry.json`, `intake.json` and adjacent screenshots. No pixel-diff program was used.

After integration, verify the actual disposable native host: pointer and Return admission, native pickers, original browser-source capture, nested picker scrolling and keyboard traversal, image/document review, Space/window changes during held intake, 92px restoration, long drafts and real screen-work-area clamping. The original preview ownership and normal retirement remain with the native acceptance lane.
